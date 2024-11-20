const path = require("path");
const ejs = require("ejs");
const sendEmail = require("./emailSender");

const SignupEmail = async (options) => {
    const { email } = options

    const templatePath = path.join(__dirname, "../lib/email-templates/singup.ejs")
    const data = await ejs.renderFile(templatePath, { email });

    await sendEmail({
        email,
        subject: 'Singup',
        message: data
    })
}

const sendInvitation = async (options) => {
    const { email, member_name, user_name, invitation_link, year } = options;

    const templatePath = path.join(__dirname, "../lib/email-templates/invitation.ejs");
    const data = await ejs.renderFile(templatePath, { member_name, user_name, invitation_link, year });

    await sendEmail({
        email,
        subject: 'Invitation',
        message: data
    })
}

const emailVerification = async (options) => {
    const { first_name, last_name, email, OTP } = options

    const templatePath = path.join(__dirname, "../lib/email-templates/verification.ejs")
    const data = await ejs.renderFile(templatePath, { first_name, last_name, email, OTP });

    await sendEmail({
        email,
        subject: 'Email Verification',
        message: data
    })
}

const forgotPasswordMail = async (options) => {
    const { email, first_name, last_name, resetPasswordUrl } = options

    const templatePath = path.join(__dirname, "../lib/email-templates/forgotPassword.ejs")
    const data = await ejs.renderFile(templatePath, { first_name, last_name, email, resetPasswordUrl });

    await sendEmail({
        email,
        subject: 'Reset Password Token',
        message: data
    })
}

module.exports = {
    SignupEmail,
    sendInvitation,
    emailVerification,
    forgotPasswordMail
}