
const validator = require("validator");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const validateRegister = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    if (!validator.isStrongPassword(password)) {
        throw new ApiError(
            400,
            "Password must be strong"
        );
    }

    next();

});

module.exports = validateRegister;