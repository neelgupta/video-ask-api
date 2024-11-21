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


module.exports = {
  signUpValidator,
  signInValidator,
  checkInvitationValidator,
};
