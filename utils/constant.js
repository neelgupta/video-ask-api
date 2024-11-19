const bcrypt = require("bcrypt");

const role = {
  ADMIN: "admin",
  USER: "user",
};

const planType = {
  yearly: "yearly",
  monthly: "monthly",
};

const memberRole = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
}

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
};

const modelName = {
  USER: "Users",
  SUBSCRIPTION: "subscription",
  ORGANIZATION: "Organization",
  ORGANIZATION_MEMBER: "OrganizationMember",
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

module.exports = {
  role,
  msg,
  memberRole,
  modelName,
  hashPassword,
  validatePassword,
  planType,
  generateUUID,
};
