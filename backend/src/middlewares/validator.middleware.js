const mongoose = require("mongoose");
const validator = require("validator");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const VALID_ROLES = ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"];

const validateRegister = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
        throw new ApiError(400, "Name is required");
    }

    if (!email || !validator.isEmail(String(email))) {
        throw new ApiError(400, "Invalid email format");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    if (role && !VALID_ROLES.includes(role)) {
        throw new ApiError(400, `Invalid role. Allowed roles: ${VALID_ROLES.join(", ")}`);
    }

    next();
});

const validateObjectId = (fieldName = "id") => {
    return (req, res, next) => {
        const value = req.params[fieldName] || req.query[fieldName];

        if (value && !mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                data: null,
                message: `Invalid ${fieldName} format`,
                errors: [`${fieldName} must be a valid 24-character hex ObjectId`]
            });
        }

        next();
    };
};

module.exports = validateRegister;
module.exports.validateRegister = validateRegister;
module.exports.validateObjectId = validateObjectId;
module.exports.VALID_ROLES = VALID_ROLES;