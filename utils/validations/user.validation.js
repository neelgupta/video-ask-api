const Joi = require('joi');

const signUpValidator = Joi.object({
    first_name: Joi.string().required().messages({
        "*": "first name is required"
    }),
    last_name: Joi.string().required().messages({
        "*": "last name is required"
    }),
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
    // role:Joi.string(),
});

const signInValidator = Joi.object({
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
});

module.exports = {
    signUpValidator,
    signInValidator,
}