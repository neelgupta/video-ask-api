const Joi = require("joi");
const { subscriptionPlanType, Currencies } = require("../constant");

const addPlanValidator = Joi.object({
  title: Joi.string().required().messages({
    "*": "Please enter title",
  }),
  plan_type: Joi.string()
    .required()
    .valid(subscriptionPlanType.Free, subscriptionPlanType.Premium),
  sub_title: Joi.string().required().messages({
    "*": "Please enter Sub Title",
  }),
  price: Joi.number().required().messages({
    "*": "Please enter Price",
  }),
  page: Joi.number().required().messages({
    "*": "Please enter Page",
  }),
  storage: Joi.number().required().messages({
    "*": "Please enter Storage",
  }),
  members: Joi.number().required().messages({
    "*": "Please enter Members",
  }),
  description: Joi.string().required().messages({
    "*": "Please enter Description",
  }),
  button_text: Joi.string().required().messages({
    "*": "Please enter Button Text",
  }),
  currency: Joi.string().optional(),
});

const updatePlanValidator = Joi.object({
  plan_id: Joi.string().required().messages({
    "*": "Subscription plan id is required",
  }),
  title: Joi.string().optional(),
  plan_type: Joi.string()
    .optional()
    .valid(subscriptionPlanType.Free, subscriptionPlanType.Premium),
  sub_title: Joi.string().optional(),
  price: Joi.number().optional(),
  page: Joi.number().optional(),
  storage: Joi.number().optional(),
  members: Joi.number().optional(),
  description: Joi.string().optional(),
  currency: Joi.string().optional().valid(Currencies.USD),
  is_best_deal: Joi.boolean().optional(),
  button_text: Joi.string().optional(),
});

module.exports = { addPlanValidator, updatePlanValidator };
