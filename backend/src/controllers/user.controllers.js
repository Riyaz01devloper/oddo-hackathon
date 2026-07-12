const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");



// Register User
const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    }).select("-password");

    return res.status(201).json(
        new ApiResponse(
            201,
            user,
            "User registered successfully"
        )
    );

});



// Login User
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are required");
    }

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
         expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
                token
            },
            "Login successful"
        )
    );

});



// Logout User
const logoutUser = asyncHandler(async (req, res) => {

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
