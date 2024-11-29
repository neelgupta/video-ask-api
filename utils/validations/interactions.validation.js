const Joi = require("joi");
const { interactionType, flowType, nodeType } = require("../constant");

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
    flows: Joi.array().required().items(
        Joi.object({
            type: Joi.string().required().valid(nodeType.Start, nodeType.End),
            position: Joi.object({
                x: Joi.number().required(),
                y: Joi.number().required(),
            }).required(),
            title: Joi.string().required(),
        })).required(),
});

const updateInteractionValidator = Joi.object({
    interaction_id: Joi.string().required().messages({
        "*": "Please enter valid interaction Id",
    }),
    folder_id: Joi.string().required().messages({
        "*": "Please enter valid folder Id",
    }),
});

const createNodeValidator = Joi.object({
    interaction_id: Joi.string().required().messages({
        "*": "Please enter valid interaction Id",
    }),
    flow_type: Joi.string().required().valid(flowType.Webcam, flowType.Upload, flowType.Screen, flowType.Library, flowType.FlowAI),
    video: Joi.array()
        .items(Joi.object({
            originalname: Joi.string().required(),
            size: Joi.number().max(10 * 1024 * 1024) // Max size 10MB
        }))
        .optional(),
    video_align: Joi.boolean().optional(),
    overlay_text: Joi.string().optional(),
    text_size: Joi.string().optional(),
    fade_reveal: Joi.string().optional(),
    positionX: Joi.number().required(),
    positionY: Joi.number().required(),
    type: Joi.string().required().valid(nodeType.Start, nodeType.End),
    title: Joi.string().required(),
    sourceId: Joi.string().required(),
    targetId: Joi.string().required(),
});

const updateNodeValidator = Joi.object({
    flow_id: Joi.string().required().messages({
        "*": "Please enter valid flow Id",
    }),
    flow_type: Joi.string().optional().valid(flowType.Webcam, flowType.Upload, flowType.Screen, flowType.Library, flowType.FlowAI),
    video: Joi.array()
        .items(Joi.object({
            originalname: Joi.string().optional(),
            // mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf').required(),
            size: Joi.number().max(10 * 1024 * 1024) // Max size 5MB
        }))
        .optional(),
    video_align: Joi.boolean().optional(),
    overlay_text: Joi.string().optional(),
    text_size: Joi.string().optional(),
    fade_reveal: Joi.string().optional(),
});

const createDefaultFlow = Joi.object({
    interaction_id: Joi.string().required().messages({
        "*": "Please enter valid interaction Id",
    }),
    flows: Joi.array().required().items(
        Joi.object({
            type: Joi.string().required().valid(nodeType.Start, nodeType.End),
            position: Joi.object({
                x: Joi.number().required(),
                y: Joi.number().required(),
            }).required(),
            title: Joi.string().required(),
        })).required(),
});


module.exports = { addFolderValidator, updateFolderValidator, addInteractionValidator, updateInteractionValidator, createNodeValidator, updateNodeValidator, createDefaultFlow }