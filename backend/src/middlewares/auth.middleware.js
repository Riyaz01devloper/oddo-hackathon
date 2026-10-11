const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const verifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.header("Authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        throw new ApiError(401, "Authentication required. No token provided.");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Authentication token has expired. Please log in again.");
        }
        if (err.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid authentication token.");
        }
        throw new ApiError(401, "Authentication failed.");
    }

    const user = await User.findById(decodedToken.id).select("-password").lean();

    if (!user) {
        throw new ApiError(401, "User belonging to this token no longer exists.");
    }

    req.user = user;
    next();
});

module.exports = verifyJWT;