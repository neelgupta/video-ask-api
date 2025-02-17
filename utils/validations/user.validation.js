const Joi = require("joi");
const { subscriptionPlanType, subscriptionsStatus } = require("../constant");

const signUpValidator = Joi.object({
  user_name: Joi.string().required().messages({
    "*": "name is required",
  }),
  email: Joi.string().required().messages({
    "*": "email is required",
  }),
  password: Joi.string().required().messages({
    "*": "password is required",
  }),
  terms: Joi.object(),
  memberId: Joi.string().optional(),
  referralId: Joi.string().optional(),
  // role:Joi.string(),
});

const signInValidator = Joi.object({
  email: Joi.string().required().messages({
    "*": "email is required",
  }),
  password: Joi.string().required().messages({
    "*": "password is required",
  }),
});

const checkInvitationValidator = Joi.object({
  invitation_token: Joi.string().required().messages({
    "*": "Invitation token is required",
  }),
});

const forgotPasswordValidator = Joi.object({
  email: Joi.string().required().messages({
    "*": "Email is required",
  }),
});

const resetPasswordValidator = Joi.object({
  password: Joi.string().required().messages({
    "*": "Password is required",
  }),
  resetPasswordToken: Joi.string().required().messages({
    "*": "Password token is required",
  }),
});

const deleteAccountValidator = Joi.object({
  password: Joi.string().required().messages({
    "*": "Password is required",
  }),
});

const addSubscriptionsValidator = Joi.object({
  subscription_plan_id: Joi.string().required().messages({
    "*": "Plan is required",
  }),
  plan_type: Joi.string()
    .required()
    .valid(subscriptionPlanType.Free, subscriptionPlanType.Premium),
  shipping_address_id: Joi.string().required().messages({
    "*": "Shipping address is required",
  }),
  billing_address_id: Joi.string().required().messages({
    "*": "Billing address is required",
  }),
  payment_method_id: Joi.string().required().messages({
    "*": "Payment method is required",
  }),
  organization_id: Joi.string().required().messages({
    "*": "Payment method is required",
  }),
});

const confirmSubscriptionValidator = Joi.object({
  currentSubscription: Joi.string().required().messages({
    "*": "subscription id is required",
  }),
  status: Joi.string()
    .required()
    .valid(
      subscriptionsStatus.active,
      subscriptionsStatus.canceled,
      subscriptionsStatus.incomplete
    ),
  clientSecret: Joi.string().required().messages({
    "*": "client Secret is required",
  }),
});

module.exports = {
  signUpValidator,
  signInValidator,
  checkInvitationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  deleteAccountValidator,
  addSubscriptionsValidator,
  confirmSubscriptionValidator,
};
