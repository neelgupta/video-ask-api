const bcrypt = require("bcrypt");
const crypto = require("crypto");

const frontBaseUrl = "https://localhost:3000";

const defaultOrganization = "My Organization";

const msg = {
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
}

const replyTypes = {
  DO_NOT_NOTIFY: "DoNotNotify",
  MENTIONS_ONLY: "MentionsOnly",
  ALL_COMMENTS: "AllComments",
};

const memberInvitationStatus = {
  Pending: "pending",
  Completed: "completed",
}

const addressType = {
  Shipping: "Shipping",
  Billing: "Billing",
}

const modelName = {
  USER: "Users",
  SUBSCRIPTION: "subscription",
  ORGANIZATION: "Organization",
  ORGANIZATION_MEMBER: "OrganizationMember",
  ADDRESS: "Address",
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
    const decipher = crypto.createDecipher("aes-256-cbc", process.env.SECRET_KEY);
    let decrypted = decipher.update(encryptedToken, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    return payload;
  } catch (error) {
    return error
  }
};

module.exports = {
  userType,
  frontBaseUrl,
  defaultOrganization,
  msg,
  memberRole,
  modelName,
  memberInvitationStatus,
  planType,
  replyTypes,
  addressType,
  hashPassword,
  validatePassword,
  generateUUID,
  generateEncryptedToken,
  decryptToken,
};
