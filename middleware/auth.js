const catchAsyncError = require("./catchAsyncError");
const { response401 } = require("../lib/response-messages");
const { msg } = require("../utils/constant");
const { verifyToken } = require("../lib/token_manager");
const { user_services } = require("../service");

// Token is valid or not middleware
exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    const headers = req.headers.authorization;
    if (!headers) return response401(res, msg.headerMissing);

    const token = headers.split(" ")[1];
    if (!token) return response401(res, msg.invalidToken);

    const data = await verifyToken(token)

    const user = await user_services.findUser({ _id: data?.user_id})
    if (!user) return response401(res, msg.tokenExpired);
    if (!user.is_active) return response401(res, msg.accountInActivated);

    req.user = user._id;
    // req.role = user.role;

    next();
});

// authenticate middleware for multiple role
exports.isAuthenticatedUser = (...role) => {
    return catchAsyncError(async (req, res, next) => {
        const id = req.user;
        const user = await user_services.findUser({ _id: id });
        if (role.includes(user.user_type)) {
            if (user.is_active) {
                next();
            } else {
                return response401(res, msg.accountInActivated);
            }
        } else {
            return response401(res, `You are not registered as a ${role}`);
        }
    });
}