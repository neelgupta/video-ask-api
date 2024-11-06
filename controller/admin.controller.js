const { response400, response200 } = require("../lib/response-messages");
const catchAsyncError = require("../middleware/catchAsyncError");
const { subscription_services } = require("../service");
const { msg } = require("../utils/constant");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const adminSigning = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const adminData = await user_services.findUser({ email });
  if (!adminData) return response400(res, msg.invalidCredentials);

  if (!bcrypt.compareSync(password, adminData.password))
    return response400(res, msg.invalidCredentials);

  // const token = jwt.sign({ _id: adminData._id }, process.env.JWT_SEC)
  const token = await user_services.create_jwt_token(adminData);
  return response200(res, msg.loginSuccess, { token });
});

const postSubscriptionPlan = catchAsyncError(async (req, res) => {
  const subscription = await subscription_services.createSubscriptionPlan(
    req.body
  );
  return response200(res, "Subscription add successfully", { subscription });
});

const updateSubscriptionPlan = catchAsyncError(async (req, res) => {
  let userId = req.user;
  let { id } = req.params;

  let plan = await subscription_services.findPlanById({ _id: id });
  if (!plan) return response400(res, "Subscription details not found");

  await subscription_services.updateSubscriptionPlan(
    { _id: id },
    { ...req.body }
  );
  return response200(res, "Update details successfully", []);
});

const getSubscriptionPlan = catchAsyncError(async (req, res) => {
  let subscriptions = await subscription_services.getAllSubscriptionPlan({
    select: "",
    lean: true,
    sort: { createdAt: -1 },
  });
  return response200(res, msg.fetch_success, { subscriptions });
});

const deleteSubscriptionPlan = catchAsyncError(async (req, res) => {
  let { id } = req.params;
  const subscription = await subscription_services.deleteSubscriptionPlan({
    _id: id,
  });
  return response200(res, "deleted successfully", { subscription });
});
module.exports = {
  adminSigning,
  postSubscriptionPlan,
  updateSubscriptionPlan,
  getSubscriptionPlan,
  deleteSubscriptionPlan,
};
