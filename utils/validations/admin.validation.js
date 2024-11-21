const Joi = require("joi");
const { subscriptionPlanType } = require("../constant");

const addPlanValidator = Joi.object({
    title: Joi.string().required().messages({
        "*": "Please enter title",
    }),
    plan_type: Joi.string().required().valid(subscriptionPlanType.Free, subscriptionPlanType.Basic, subscriptionPlanType.Pro, subscriptionPlanType.Enterprise),
    sub_title: Joi.string().required().messages({
        "*": "Please enter Sub Title",
    }),
    price: Joi.string().required().messages({
        "*": "Please enter Price",
    }),
    description: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required(),
    currency: Joi.string().optional(),
    discount: Joi.string().optional(),
    is_best_deal: Joi.boolean().required(),
    is_upgrade: Joi.boolean().required(),
    is_custom: Joi.boolean().required(),
    button_text: Joi.string().required().messages({
        "*": "Please enter Button Text",
    }),
});

const updatePlanValidator = Joi.object({
    plan_id: Joi.string().required().messages({
        "*": "Subscription plan id is required",
    }),
    title: Joi.string().optional(),
    plan_type: Joi.string().optional().valid(subscriptionPlanType.Free, subscriptionPlanType.Basic, subscriptionPlanType.Pro, subscriptionPlanType.Enterprise),
    subTitle: Joi.string().optional(),
    price: Joi.string().optional(),
    description: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .optional(),
    currency: Joi.string().optional(),
    discount: Joi.string().optional(),
    is_best_deal: Joi.boolean().optional(),
    is_upgrade: Joi.boolean().optional(),
    is_custom: Joi.boolean().optional(),
    button_text: Joi.string().optional(),
});


module.exports = { addPlanValidator, updatePlanValidator }

