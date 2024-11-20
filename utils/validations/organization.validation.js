const Joi = require("joi");
const { memberRole, replyTypes } = require("../constant");

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
    replay_to_email: Joi.string().optional(),
    branding: Joi.string().optional(),
    language: Joi.string().optional(),
    font: Joi.string().optional(),
    colors: Joi.string().optional(),
    border_radius: Joi.number().optional(),
    notification_settings: Joi.object({
        new_user_contacts: Joi.boolean().optional(),
        tips_and_tutorials: Joi.boolean().optional(),
        user_research: Joi.boolean().optional(),
    }).optional(),
    replies: Joi.string().optional().valid(replyTypes.DO_NOT_NOTIFY, replyTypes.MENTIONS_ONLY, replyTypes.ALL_COMMENTS),
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
    member_role: Joi.string().optional().valid(memberRole.Admin, memberRole.Member, memberRole.Owner),
});

module.exports = {
    addOrganizationValidator,
    updateOrganizationValidator,
    getOrganizationMemberValidator,
    addOrganizationMemberValidator,
    updateOrganizationMemberValidator,
};