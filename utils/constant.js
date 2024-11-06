const bcrypt = require("bcrypt");

const role = {
  ADMIN: "admin",
  USER: "user",
};

const planType = {
  yearly: "yearly",
  monthly: "monthly",
};

const msg = {
  invalidCredentials: "Invalid credentials",
  loginSuccess: "Login successfully",
  invalidRole: "Invalid role",
  tokenExpired: "Token is expired or Invalid",
  accountInActivated: "Your account has been deactivated by the administrator.",
  emailIsExists: "Email is already exists",
  fetchSuccessfully: "Fetched successfully",
  fetch_success: "Fetched successfully",
  signupSuccess: "Sign up successfully",
  invalidToken: "Invalid Token",
  tokenExpired: "Token is expired or Invalid",
};

const modelName = {
  USER: "Users",
  SUBSCRIPTION: "subscription",
};
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const validatePassword = (inputPassword, storedPassword) => {
  return bcrypt.compareSync(inputPassword, storedPassword);
};

module.exports = {
  role,
  msg,
  modelName,
  hashPassword,
  validatePassword,
  planType,
};
