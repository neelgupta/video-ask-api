const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const catchAsyncError = require("./catchAsyncError");
const { response401 } = require("../lib/response-messages");
const { msg } = require("../utils/constant");
const { verifyToken } = require("../lib/token_manager");

// Token is valid or not middleware
exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    const headers = req.headers.authorization;
    if (!headers) return response401(res, msg.invalidToken);

    const token = headers.split(" ")[1];
    if (!token) return response401(res, msg.invalidToken);

    // const data = jwt.verify(token, process.env.JWT_SEC);
    const data = await verifyToken(token)

    const user = await Users.findOne({ _id: data.user_id });
    if (!user) return response401(res, msg.tokenExpired);
    if (!user.isActive) return response401(res, msg.accountInActivated);

    req.user = user._id;
    // req.role = user.role;

    next();
});

// authenticate middleware
// for multiple
exports.isAuthenticatedUser = (...role) => {
    return catchAsyncError(async (req, res, next) => {
        const id = req.user;
        const user = await Users.findOne({ _id: id });
        if (role.includes(user.role)) {
            if (user.status) {
                next();
            } else {
                return response401(res, msg.accountInActivated);
            }
        } else {
            return response401(res, `You are not registered as a ${role}`);
        }
    });
}

//for single
// authenticate middleware
// exports.isAuthenticatedUser = (role) => {
//     return catchAsyncError(async (req, res, next) => {
//         const id = req.user;
//         const user = await Users.findOne({ _id: id });
//         if (user.role === role) {
//             next()
//         } else {
//             return response401(res, `You are not registered as a ${role}`);
//         }
//     });
// }