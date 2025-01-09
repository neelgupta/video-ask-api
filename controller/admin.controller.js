const { response400, response200 } = require("../lib/response-messages");
const catchAsyncError = require("../middleware/catchAsyncError");
const { subscription_services, stripe_service } = require("../service");
const {
  msg,
  generateUUID,
  subscriptionPlanType,
  Currencies,
} = require("../utils/constant");
const bcrypt = require("bcrypt");

const adminSigning = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const adminData = await user_services.findUser({ email });
  if (!adminData) return response400(res, msg.invalidCredentials);

  if (!bcrypt.compareSync(password, adminData.password))
    return response400(res, msg.invalidCredentials);

  const token = await user_services.create_jwt_token(adminData);
  return response200(res, msg.loginSuccess, { token });
});

const addSubscriptionPlan = catchAsyncError(async (req, res) => {
  const userId = req.user;
  const currency = Currencies.USD;
  const plan_uuid = generateUUID("SUB");

  req.body = {
    ...req.body,
    currency,
    plan_uuid,
    added_by: userId,
    interval: 30,
  };

  if (req.body.plan_type === subscriptionPlanType.Premium) {
    const subscriptionPlan = await stripe_service.createStripePlan({
      name: req.body.title,
    });

    if (!subscriptionPlan?.id) return response400(res, msg.createPlanError);

    const subscriptionPrice = await stripe_service.createStripePrice({
      product_id: subscriptionPlan?.id,
      currency: Currencies.USD,
      amount: req.body.price * 100,
    });

    if (!subscriptionPrice.id) {
      await stripe_service.removeSubscriptionPlan(subscriptionPlan?.id);
      return response400(res, msg.createPlanError);
    }

    req.body.stripe_plan_id = subscriptionPlan?.id;
    req.body.stripe_price_id = subscriptionPrice?.id;
  }

  const subscription = await subscription_services.createSubscriptionPlan(
    req.body
  );
  return response200(res, msg.subscriptionPlanAdded, subscription);
});

const getAllSubscriptionPlan = catchAsyncError(async(req,res)=>{
  const data = await subscription_services.getAllSubscriptionPlan(
    {
      is_deleted: false,
    },
    { sort: { price: 1 } }
  );

  return response200(res, msg.fetch_success, data);
});

const updateSubscriptionPlan = catchAsyncError(async (req, res) => {
  const { plan_id, title, price } = req.body;

  const planData = await subscription_services.findPlanById({ _id: plan_id });
  if (!planData) return response400(res, msg.subscriptionPlanNotFound);

  if (title) {
    if (
      planData?.plan_type === subscriptionPlanType.Premium &&
      planData?.stripe_plan_id
    ) {
      await stripe_service.updateStripePlan(planData.stripe_plan_id, {
        name: title,
      });
    }
  }

  // if(req.body.price){
  //   if (planData?.plan_type === subscriptionPlanType.Premium && planData?.stripe_plan_id) {
  //     await stripe_service.updateStripePlan(planData.stripe_plan_id, {
  //       name: req.body.title,
  //     });
  //   }
  // }

  await subscription_services.updateSubscription(
    { _id: plan_id },
    { ...req.body }
  );

  return response200(res, msg.update_success, []);
});

const deleteSubscriptionPlan = catchAsyncError(async (req, res) => {
  const { plan_id } = req.params;

  const planData = await subscription_services.findPlanById({ _id: plan_id });
  if (!planData) return response400(res, msg.subscriptionPlanNotFound);

  if (planData.plan_type === subscriptionPlanType.Premium) {
    await stripe_service.updateStripePlan(planData?.stripe_plan_id, {
      active: false,
    });
    await stripe_service.updateStripePrice(planData?.stripe_price_id, {
      active: false,
    });
  }

  await subscription_services.updateSubscription(
    {_id: plan_id},
    { is_deleted: true },
  );

  return response200(res, msg.delete_success, []);
});

module.exports = {
  adminSigning,
  addSubscriptionPlan,
  getAllSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
};
