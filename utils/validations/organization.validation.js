const Joi = require("joi");
const { memberRole, replyTypes, addressType } = require("../constant");

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

const addAddressValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    apartment_number: Joi.string().required().messages({
        "*": "Apartment number is required",
    }),
    street_name: Joi.string().required().messages({
        "*": "Street name is required",
    }),
    state: Joi.string().required().messages({
        "*": "State is required",
    }),
    pinCode: Joi.string().required().messages({
        "*": "Pin code is required",
    }),
    country: Joi.string().required().messages({
        "*": "country is required",
    }),
    email: Joi.string().required().messages({
        "*": "Email is required",
    }),
    address_type: Joi.string().required().valid(addressType.Billing, addressType.Shipping),
});

const updateAddressValidator = Joi.object({
    address_id: Joi.string().required().messages({
        "*": "Please enter valid address Id",
    }),
    apartment_number: Joi.string().optional(),
    street_name: Joi.string().optional(),
    state: Joi.string().optional(),
    pinCode: Joi.string().optional(),
    country: Joi.string().optional(),
    email: Joi.string().optional(),
    is_primary:Joi.boolean().optional(),
});

const addReferralValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    referral_email: Joi.string().required().messages({
        "*": "Email is required",
    }),
});

const addPaymentMethodValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    card_type: Joi.string().required().messages({
        "*": "Card type is required",
    }),
    card_number: Joi.string().required().messages({
        "*": "Card number is required",
    }),
    cvv: Joi.string().required().messages({
        "*": "CVV is required",
    }),
    expiry_date: Joi.date().required().messages({
        "*": "Expiry Date is required",
    }),
    email: Joi.string().required().messages({
        "*": "Email is required",
    }),
});

const updatePaymentMethodValidator = Joi.object({
    payment_method_id: Joi.string().required().messages({
        "*": "Please enter valid payment method Id",
    }),
    card_type: Joi.string().optional(),
    card_number: Joi.string().optional(),
    cvv: Joi.string().optional(),
    expiry_date: Joi.string().optional(),
    email: Joi.string().optional(),
    is_primary:Joi.boolean().optional(),
});

module.exports = {
    addOrganizationValidator,
    updateOrganizationValidator,
    getOrganizationMemberValidator,
    addOrganizationMemberValidator,
    updateOrganizationMemberValidator,
    addAddressValidator,
    updateAddressValidator,
    addReferralValidator,
    addPaymentMethodValidator,
    updatePaymentMethodValidator,
};