
const mongoose = require("mongoose");
const validator = require("validator");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const validateRegister = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

   if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
}

    next();

});

const validateObjectId = (fieldName = "id") => {
    return (req, res, next) => {
        const value = req.params[fieldName] || req.query[fieldName];

        if (value && !mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${fieldName}`
            });
        }

        next();
    };
};

module.exports = validateRegister;
module.exports.validateRegister = validateRegister;
module.exports.validateObjectId = validateObjectId;