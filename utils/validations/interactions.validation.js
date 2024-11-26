const Joi = require("joi");
const { interactionType } = require("../constant");

const addFolderValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    folder_name: Joi.string().required().messages({
        "*": "Folder name is required",
    }),
});

const updateFolderValidator = Joi.object({
    folder_id: Joi.string().required().messages({
        "*": "Please enter valid folder Id",
    }),
    folder_name: Joi.string().optional(),
});

const addInteractionValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    folder_id: Joi.string().required().messages({
        "*": "Please enter valid folder Id",
    }),
    interaction_type: Joi.string().required().valid(interactionType.Template, interactionType.Scratch, interactionType.FlowAI),
    is_lead_crm: Joi.boolean().required(),
    title: Joi.string().required().messages({
        "*": "Title is required",
    }),
    is_collect_contact: Joi.boolean().required(),
    language: Joi.string().optional(),
});

const updateInteractionValidator = Joi.object({
    interaction_id: Joi.string().required().messages({
        "*": "Please enter valid interaction Id",
    }),
    folder_id: Joi.string().required().messages({
        "*": "Please enter valid folder Id",
    }),
});


module.exports = { addFolderValidator, updateFolderValidator, addInteractionValidator, updateInteractionValidator }