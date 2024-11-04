const { response400, response200 } = require("../lib/response-messages");
const catchAsyncError = require("../middleware/catchAsyncError");
const { user_services } = require("../service");
const { msg } = require("../utils/constant");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const adminSigning = catchAsyncError(async (req, res) => {
    const { email, password } = req.body;

    const adminData = await user_services.findUser({ email })
    if (!adminData) return response400(res, msg.invalidCredentials)

    if (!bcrypt.compareSync(password, adminData.password)) return response400(res, msg.invalidCredentials)

    // const token = jwt.sign({ _id: adminData._id }, process.env.JWT_SEC)
    const token = await user_services.create_jwt_token(adminData);
    return response200(res, msg.loginSuccess, { token })
});

module.exports = { adminSigning }
