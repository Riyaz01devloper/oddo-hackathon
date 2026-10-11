const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

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
        role: newuser.role
    };

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
        role: user.role
    };

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
    res.clearCookie("token", cookieOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Logout successful"
        )
    );
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
