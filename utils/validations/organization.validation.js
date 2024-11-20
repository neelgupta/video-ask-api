const Joi = require("joi");
const { memberRole } = require("../constant");

const addOrganizationValidator = Joi.object({
    organization_name: Joi.string().required().messages({
        "*": "name is required",
    }),
    // organization_email: Joi.string().required().messages({
    //     "*": "email is required",
    // }),
    organization_settings: Joi.object({
        branding: Joi.string().optional(),
        language: Joi.string().optional(),
        font: Joi.string().optional(),
    }).optional(),
    address_details: Joi.object({
        apartment_number: Joi.string().optional(),
        street_name: Joi.string().optional(),
        state: Joi.string().optional(),
        pinCode: Joi.string().optional(),
        country: Joi.string().optional(),
    }).optional(),
});

const updateOrganizationValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    organization_name: Joi.string().optional(),
    // organization_email: Joi.string().optional(),
    organization_settings: Joi.object({
        branding: Joi.string().optional(),
        language: Joi.string().optional(),
        font: Joi.string().optional(),
    }).optional(),
    address_details: Joi.object({
        apartment_number: Joi.string().optional(),
        street_name: Joi.string().optional(),
        state: Joi.string().optional(),
        pinCode: Joi.string().optional(),
        country: Joi.string().optional(),
    }).optional(),
});

const addOrganizationMemberValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    member_name: Joi.string().required().messages({
        "*": "Member name is required",
    }),
    member_email: Joi.string().required().messages({
        "*": "Member email is required",
    }),
    member_phone: Joi.string().required().messages({
        "*": "Member phone number is required",
    }),
    member_role: Joi.string().required().valid(memberRole.Admin, memberRole.Member, memberRole.Owner)
});

const getOrganizationMemberValidator = Joi.object({
    search: Joi.string().optional(),
    limit: Joi.string().optional(),
    offset: Joi.string().optional(),
});

const updateOrganizationMemberValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    member_id: Joi.string().required().messages({
        "*": "Please enter valid member Id",
    }),
    member_name: Joi.string().optional(),
    member_email: Joi.string().optional(),
    member_phone: Joi.string().optional(),
    member_role: Joi.string().optional().valid(memberRole.Admin, memberRole.Member, memberRole.Owner)
});

module.exports = {
    addOrganizationValidator,
    updateOrganizationValidator,
    getOrganizationMemberValidator,
    addOrganizationMemberValidator,
    updateOrganizationMemberValidator,
};