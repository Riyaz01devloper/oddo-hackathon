const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { recordAuditLog } = require("../utils/auditLogger.js");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role = "Driver" } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newuser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role
    });

    const token = jwt.sign(
        {
            id: newuser._id,
            role: newuser.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    res.cookie("token", token, cookieOptions);

    const safeUser = {
        _id: newuser._id,
        id: newuser._id,
        name: newuser.name,
        email: newuser.email,
        role: newuser.role,
        phone: newuser.phone,
        avatar: newuser.avatar,
        preferences: newuser.preferences,
        createdAt: newuser.createdAt
    };

    recordAuditLog({
        actor: safeUser,
        action: 'REGISTER',
        entityType: 'User',
        entityId: newuser._id,
        details: `User registered with role ${newuser.role}`,
        req
    });

    return res.status(201).json({
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: {
            user: safeUser,
            token
        },
        user: safeUser,
        token
    });
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    res.cookie("token", token, cookieOptions);

    // Sanitize user object: NEVER leak password hash to frontend
    const safeUser = {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        preferences: user.preferences || {},
        createdAt: user.createdAt
    };

    recordAuditLog({
        actor: safeUser,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user._id,
        details: 'User logged in successfully',
        req
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: safeUser,
                token
            },
            "Login successful"
        )
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
    if (req.user) {
        recordAuditLog({
            actor: req.user,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: req.user._id,
            details: 'User logged out',
            req
        });
    }

    res.clearCookie("token", cookieOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Logout successful"
        )
    );
});

// Get Current User Profile (GET /api/users/me or /profile)
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password").lean();

    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User profile retrieved successfully")
    );
});

// Update Current User Profile (PATCH /api/users/me)
// Never accepts an arbitrary userId and strictly prevents role self-elevation or password alteration
const updateMe = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, phone, avatar, preferences } = req.body;

    const updateFields = {};
    if (name && typeof name === "string") updateFields.name = name.trim();
    if (typeof phone === "string") updateFields.phone = phone.trim();
    if (typeof avatar === "string") updateFields.avatar = avatar.trim();

    if (preferences && typeof preferences === "object") {
        updateFields.preferences = {
            ...req.user.preferences,
            ...preferences,
            notifications: {
                ...(req.user.preferences?.notifications || {}),
                ...(preferences.notifications || {})
            }
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-password").lean();

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    recordAuditLog({
        actor: updatedUser,
        action: 'UPDATE_PROFILE',
        entityType: 'User',
        entityId: userId,
        details: 'User updated personal profile/preferences',
        req
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

// Change Password (PATCH /api/users/me/password)
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters long");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Incorrect current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    recordAuditLog({
        actor: req.user,
        action: 'CHANGE_PASSWORD',
        entityType: 'User',
        entityId: userId,
        details: 'User updated account password',
        req
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Get User Directory (GET /api/users) - Authorized for Fleet Manager
const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
        const regex = new RegExp(String(search).trim(), 'i');
        query.$or = [{ name: regex }, { email: regex }];
    }

    if (role && role !== 'All') {
        query.role = role;
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const [users, total] = await Promise.all([
        User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        User.countDocuments(query)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                total,
                page: parsedPage,
                totalPages: Math.ceil(total / parsedLimit)
            },
            "Users retrieved successfully"
        )
    );
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateMe,
    changePassword,
    getAllUsers
};
