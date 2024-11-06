const catchAsyncError = require("../middleware/catchAsyncError");
const { response200, response400 } = require("../lib/response-messages");
const { msg, hashPassword, validatePassword } = require("../utils/constant");
const { user_services } = require("../service");

// sign-up
const userSignup = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const user = await user_services.findUser({ email });
  if (user) return response400(res, msg.emailIsExists);

  req.body.password = hashPassword(password);

  await user_services.registerUser(req.body);
  return response200(res, msg.signupSuccess, []);
});

// sign-in
const userSignIn = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const user = await user_services.findUser({ email });
  if (!user) return response400(res, msg.invalidCredentials);

  const validPassword = validatePassword(password, user.password);
  if (!validPassword) return response400(res, msg.invalidCredentials);

  // const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC)
  const token = await user_services.create_jwt_token(user);
  return response200(res, msg.loginSuccess, { token });
});

// update one
const updateOne = catchAsyncError(async (req, res) => {
  let userId = req.user;
  let { email } = req.body;

  let user = await user_services.findUser({ _id: userId });
  if (!user) return response400(res, "User details not found");

  let isEmailExits = await user_services.findUser({
    email,
    _id: { $ne: userId },
  });
  if (isEmailExits) return response400(res, "Email already exits");

  await user_services.updateUser({ _id: userId }, { ...req.body });
  return response200(res, "Update details successfully", []);
});

// update many
const updateManyUser = catchAsyncError(async (req, res) => {
  await user_services.updateAllUser({}, { $set: { isDeleted: false } });
  return response200(res, "Update successfully", []);
});

// findAll
const fetchAll = catchAsyncError(async (req, res) => {
  let user = await user_services.getAllUsers({
    select: "email name isActive createdAt",
    lean: true,
    sort: { createdAt: -1 },
  });
  return response200(res, "User list successfully", user);
});

// find all using aggregation
const fetchAllAggregation = catchAsyncError(async (req, res) => {
  let userId = req.user;

  let user = await user_services.getAllUsersByAggregation(userId);
  return response200(res, "User list successfully", user);
});

// get all post using populate
const fetchAllPost = catchAsyncError(async (req, res) => {
  let userId = req.user;
  let populateQuery = [
    {
      path: "userId",
      select: "email name",
    },
  ];

  let user = await user_services.fetchPost({ userId }, populateQuery);
  return response200(res, "Post list successfully", user);
});

module.exports = {
  userSignup,
  fetchAll,
  userSignIn,
  updateOne,
  updateManyUser,
  fetchAllAggregation,
  fetchAllPost,
};
