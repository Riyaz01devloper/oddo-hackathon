const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const verifyJWT = asyncHandler(async (req, res, next) => {

    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;

    if (!token) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
        throw new ApiError(401, "Invalid Token");
    }

    req.user = user;

    next();
});

module.exports = verifyJWT;