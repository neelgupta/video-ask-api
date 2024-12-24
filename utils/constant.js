const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const frontBaseUrl = "https://adorable-custard-9de130.netlify.app";

const defaultOrganization = "My Organization";

const defaultFolderName = "Default";

const msg = {
  notFound: "Data not found",
  invalidCredentials: "Invalid credentials",
  loginSuccess: "Login successfully",
  invalidRole: "Invalid role",
  tokenExpired: "Token is expired or Invalid",
  accountInActivated: "Your account has been deactivated by the administrator.",
  emailIsExists: "Email is already exists",
  phoneExists: "Phone number is already exists",
  fetchSuccessfully: "Fetched successfully",
  fetch_success: "Fetched successfully",
  update_success: "Updated successfully",
  delete_success: "Deleted successfully",
  signupSuccess: "Sign up successfully",
  headerMissing: "Header is missing",
  invalidToken: "Invalid Token",
  tokenExpired: "Token is expired or Invalid",
  organizationExists: "Organization is already exists",
  organizationCreated: "Organization created successfully",
  organizationNotExists: "Organization is not exists",
  memberCreated: "Member created successfully",
  memberNotExists: "Member details not exists",
  invitationTokenInvalid: "Invitation token is invalid",
  invitationTokenExpired: "Invitation token is expired",
  memberIsAlreadyRegistered: "Member is already registered",
  oldPasswordWrong: "Old password is not correct",
  passwordChangeSuccess: "Password changed successfully",
  profileUpdateSuccess: "Profile updated successfully",
  validMemberEmail: "Email is not exists in the organization",
  addressCreated: " Address added successfully",
  addressNotExists: "Address details not exists",
  referralExists: "This email already has a referral",
  referralSuccess: "Referral send successfully",
  forgotPassword: "We've just sent you an email to reset your password",
  invalidResetPasswordToken: "Reset Password token is invalid",
  passwordRestSuccess: "Password reset successfully",
  contactAddSuccess: "Contact added successfully",
  contactNotFound: "Contact details not found",
  accountDeleted: "Account deleted successfully",
  folderAdded: "Folder created successfully",
  folderIsNotExists: "Folder is not exists",
  interactionAdded: "Interactions added successfully",
  interactionIsNotExists: "Inter action is not exists",
  flowCreated: "Flow created successfully",
  nodeNotExists: "Node is not exists",
  sourceNotFound: "Source Id is not exists",
  targetNotFound: "Target Id is not exists",
  someThingsWrong: "Something is wrong",
  paymentMethodAdd: "Payment method added successfully",
  paymentMethodNotEXists: "Payment method is not exists",
  answerTypeNotMatched: "Answer type is not matched with the flow answer type",
  answerSuccess: "Answer added successfully",
  nodeTypeQuestion: "Node type must be Question",
  libraryUpload: "The media has been created",
  mediaDelete: "Media deleted successfully",
};

const invitationTokenType = {
  Team_Member: "Team Member",
  Referral: "Referral",
};

const userType = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
};

const planType = {
  yearly: "yearly",
  monthly: "monthly",
};

const memberRole = {
  Owner: "owner",
  Admin: "admin",
  Member: "member",
};

const replyTypes = {
  DO_NOT_NOTIFY: "DoNotNotify",
  MENTIONS_ONLY: "MentionsOnly",
  ALL_COMMENTS: "AllComments",
};

const memberInvitationStatus = {
  Pending: "pending",
  Completed: "completed",
};

const addressType = {
  Shipping: "Shipping",
  Billing: "Billing",
};

const CloudFolder = "video-ask";

const modelName = {
  USER: "Users",
  SUBSCRIPTION_PLAN: "Subscription_Plan",
  ORGANIZATION: "Organization",
  ORGANIZATION_MEMBER: "OrganizationMember",
  ADDRESS: "Address",
  REFERRAL: "Referral",
  CONTACT: "Contact",
  FOLDER: "Folder",
  INTERACTION: "Interaction",
  // FLOW: "Flow",
  EDGE: "Edge",
  LIBRARY: "Library",
  NODE: "Node",
  PAYMENT_METHOD: "Payment_method",
  NODE_ANSWER: "Node_answer",
};

const subscriptionPlanType = {
  Free: "free",
  Basic: "basic",
  Pro: "pro",
  Enterprise: "enterprise",
};

const interactionType = {
  Scratch: "Scratch",
  Template: "Template",
  FlowAI: "FlowAI",
};

const flowType = {
  Webcam: "Webcam",
  Upload: "Upload",
  Library: "Library",
  Screen: "Screen",
  FlowAI: "FlowAI",
};

const nodeType = {
  Start: "Start",
  End: "End",
  Question: "Question",
};

const answerType = Object.freeze({
  OpenEnded: "open-ended",
  AIChatbot: "ai-chatbot",
  MultipleChoice: "multiple-choice",
  Button: "button",
  Calender: "calender",
  LiveCall: "live-call",
  NPS: "nps",
  FileUpload: "file-upload",
  Payment: "payment",
});

const openEndedType = {
  audio: "audio",
  video: "video",
  text: "text",
};

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const validatePassword = (inputPassword, storedPassword) => {
  return bcrypt.compareSync(inputPassword, storedPassword);
};

const generateUUID = (prefix) => {
  if (!prefix) throw new Error("Prefix is required");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
};

const generateEncryptedToken = (payload) => {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.SECRET_KEY);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decryptToken = (encryptedToken) => {
  try {
    const decipher = crypto.createDecipher(
      "aes-256-cbc",
      process.env.SECRET_KEY
    );
    let decrypted = decipher.update(encryptedToken, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    return payload;
  } catch (error) {
    return error;
  }
};

const generateResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  return { resetPasswordToken, resetPasswordExpires };
};

const generateUid = () => {
  return uuidv4().replace(/-/g, "").slice(0, 8);
};

module.exports = {
  userType,
  frontBaseUrl,
  defaultOrganization,
  defaultFolderName,
  msg,
  memberRole,
  modelName,
  memberInvitationStatus,
  planType,
  replyTypes,
  addressType,
  invitationTokenType,
  subscriptionPlanType,
  CloudFolder,
  interactionType,
  flowType,
  nodeType,
  answerType,
  openEndedType,
  hashPassword,
  validatePassword,
  generateUUID,
  generateEncryptedToken,
  decryptToken,
  generateResetPasswordToken,
  generateUid,
};
