const Joi = require("joi");

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

module.exports = {
  signUpValidator,
  signInValidator,
};
