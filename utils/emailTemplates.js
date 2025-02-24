const path = require("path");
const ejs = require("ejs");
const sendEmail = require("./emailSender");
const year = new Date().getFullYear();

const SignupEmail = async (options) => {
  const { email } = options;

  const templatePath = path.join(
    __dirname,
    "../lib/email-templates/singup.ejs"
  );
  const data = await ejs.renderFile(templatePath, { email });

  await sendEmail({
    email,
    subject: "Singup",
    message: data,
  });
};

const emailVerification = async (options) => {
  const { first_name, last_name, email, OTP } = options;

  const templatePath = path.join(
    __dirname,
    "../lib/email-templates/verification.ejs"
  );
  const data = await ejs.renderFile(templatePath, {
    first_name,
    last_name,
    email,
    OTP,
  });

  await sendEmail({
    email,
    subject: "Email Verification",
    message: data,
  });
};

const forgotPasswordMail = async (options) => {
  const { email, name, resetPasswordUrl } = options;

  const templatePath = path.join(
    __dirname,
    "../lib/email-templates/forgotPassword.ejs"
  );
  const data = await ejs.renderFile(templatePath, {
    name,
    resetPasswordUrl,
    year,
  });

  await sendEmail({
    email,
    subject: "Reset your password",
    message: data,
  });
};

const sendInvitation = async (options) => {
  const { email, member_name, user_name, invitation_link } = options;

  const templatePath = path.join(
    __dirname,
    "../lib/email-templates/invitation.ejs"
  );
  const data = await ejs.renderFile(templatePath, {
    member_name,
    user_name,
    invitation_link,
    year,
  });

  await sendEmail({
    email,
    subject: "Invitation",
    message: data,
  });
};

const sendReply = async (options) => {
  const {
    email,
    member_name,
    user_name,
    invitation_link,
    reply_name,
    reply_text,
  } = options;

  const templatePath = path.join(__dirname, "../lib/email-templates/reply.ejs");
  const data = await ejs.renderFile(templatePath, {
    member_name,
    user_name,
    invitation_link,
    reply_name,
    reply_text,
    year,
  });

  await sendEmail({
    email,
    subject: "Replay",
    message: data,
  });
};

const referralInvitation = async (options) => {
  const { email, user_name, invitation_link } = options;

  const templatePath = path.join(
    __dirname,
    "../lib/email-templates/referral.ejs"
  );
  const data = await ejs.renderFile(templatePath, {
    invitation_link,
    user_name,
    year,
  });

  await sendEmail({
    email,
    subject: `${user_name} wants you to join QnAFlowAI!`,
    message: data,
  });
};

module.exports = {
  SignupEmail,
  sendInvitation,
  emailVerification,
  forgotPasswordMail,
  referralInvitation,
  sendReply,
};
