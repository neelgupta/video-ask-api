const Joi = require("joi");

const addContactValidator = Joi.object({
  organization_id: Joi.string().required().messages({
    "*": "Please enter organization Id",
  }),
  contact_name: Joi.string().required().messages({
    "*": "Please enter contact name",
  }),
  contact_email: Joi.string().required().messages({
    "*": "Please enter contact email",
  }),
  country_code: Joi.string().optional(),
  phone_number: Joi.string().optional(),
  product_name: Joi.string().optional(),
});

const updateContactValidator = Joi.object({
  contact_id: Joi.string().required().messages({
    "*": "Please enter contact Id",
  }),
  organization_id: Joi.string().required().messages({
    "*": "Please enter organization Id",
  }),
  contact_name: Joi.string().optional(),
  contact_email: Joi.string().optional(),
  country_code: Joi.string().optional(),
  product_name: Joi.string().optional(),
  phone_number: Joi.string().optional(),
  is_favorite: Joi.boolean().optional(),
});

module.exports = { addContactValidator, updateContactValidator };
