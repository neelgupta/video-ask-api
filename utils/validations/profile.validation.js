const Joi = require("joi");

const changePasswordValidator = Joi.object({
    old_password: Joi.string().required().messages({
        "*": "Please enter old password",
    }),
    new_password: Joi.string().required().messages({
        "*": "Please enter new password",
    }),
});

const updateProfileValidator = Joi.object({
    user_name: Joi.string().optional(),
    email: Joi.string().optional(),
});

module.exports = {
    changePasswordValidator,
    updateProfileValidator
};