const ApiError = require("../utils/ApiError");

const authorizeRoles = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(
                403,
                "You are not authorized to access this resource"
            ));
        }

        next();
    };
};

module.exports = authorizeRoles;