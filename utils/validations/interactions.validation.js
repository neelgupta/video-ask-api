const Joi = require("joi");
const {
  interactionType,
  flowType,
  nodeType,
  answerType,
  openEndedType,
} = require("../constant");

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

const contactDetailsSchema = Joi.object({
  is_name: Joi.boolean().optional(), // Validates as boolean with a default value
  is_email: Joi.boolean().optional(),
  is_phone: Joi.boolean().optional(),
  is_product: Joi.boolean().optional(),
  is_note: Joi.boolean().optional(),
  note: Joi.string().optional().allow(""), // Allows empty string and sets default
});

const addInteractionValidator = Joi.object({
  organization_id: Joi.string().required().messages({
    "*": "Please enter valid organization Id",
  }),
  folder_id: Joi.string().required().messages({
    "*": "Please enter valid folder Id",
  }),
  interaction_type: Joi.string()
    .required()
    .valid(
      interactionType.Template,
      interactionType.Scratch,
      interactionType.FlowAI
    ),
  is_lead_crm: Joi.boolean().required(),
  title: Joi.string().required().messages({
    "*": "Title is required",
  }),
  is_collect_contact: Joi.boolean().required(),
  language: Joi.string().optional(),
  flows: Joi.array()
    .required()
    .items(
      Joi.object({
        type: Joi.string().required().valid(nodeType.Start, nodeType.End),
        position: Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        }).required(),
        title: Joi.string().required(),
        answer_format: Joi.object().optional(),
      })
    )
    .required(),
  contact_details: contactDetailsSchema.optional(),
});

const updateInteractionValidator = Joi.object({
  interaction_id: Joi.string().required().messages({
    "*": "Please enter valid interaction Id",
  }),
  folder_id: Joi.string().optional(),
  is_deleted: Joi.boolean().optional(),
  contact_details: contactDetailsSchema.optional(),
});

const createNodeValidator = Joi.object({
  interaction_id: Joi.string().required().messages({
    "*": "Please enter valid interaction Id",
  }),
  flow_type: Joi.string()
    .required()
    .valid(
      flowType.Webcam,
      flowType.Upload,
      flowType.Screen,
      flowType.Library,
      flowType.FlowAI
    ),
  video: Joi.array()
    .items(
      Joi.object({
        originalname: Joi.string().required(),
        size: Joi.number().max(10 * 1024 * 1024), // Max size 10MB
      })
    )
    .optional(),
  video_align: Joi.boolean().optional(),
  video_duration: Joi.boolean().optional(),
  overlay_text: Joi.string().optional().allow(""),
  text_size: Joi.string().optional(),
  fade_reveal: Joi.string().optional(),
  video_position: Joi.string().optional(),
  positionX: Joi.number().required(),
  positionY: Joi.number().required(),
  type: Joi.string()
    .required()
    .valid(nodeType.Start, nodeType.End, nodeType.Question),
  title: Joi.string().required(),
  sourceId: Joi.string().required(),
  targetId: Joi.string().required(),
  answer_type: Joi.string()
    .valid(...Object.values(answerType))
    .optional(),
  answer_format: Joi.any().optional(),
});

const updateNodeValidator = Joi.object({
  node_id: Joi.string().required().messages({
    "*": "Please enter valid flow Id",
  }),
  flow_type: Joi.string()
    .optional()
    .valid(
      flowType.Webcam,
      flowType.Upload,
      flowType.Screen,
      flowType.Library,
      flowType.FlowAI
    ),
  video: Joi.array()
    .items(
      Joi.object({
        originalname: Joi.string().optional(),
        // mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf').required(),
        size: Joi.number().max(10 * 1024 * 1024), // Max size 5MB
      })
    )
    .optional(),
  video_align: Joi.boolean().optional(),
  video_duration: Joi.boolean().optional(),
  overlay_text: Joi.string().optional().allow(""),
  answer_type: Joi.string()
    .valid(...Object.values(answerType))
    .optional(),
  text_size: Joi.string().optional(),
  fade_reveal: Joi.string().optional(),
  video_position: Joi.string().optional(),
  title: Joi.string().optional(),
  sourceId: Joi.string().optional(),
  targetId: Joi.string().optional(),
});

const updateCordinates = Joi.object({
  nodes: Joi.array()
    .items(
      Joi.object({
        node_id: Joi.string().required(),
        position: Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        }).required(),
      })
    )
    .required(),
});

const updateAnswerFormatValidator = Joi.object({
  node_id: Joi.string().required().messages({
    "*": "Please enter valid Node Id",
  }),
  answer_type: Joi.string()
    .valid(...Object.values(answerType))
    .optional(),
  answer_format: Joi.any().optional(),
});

const createDefaultFlow = Joi.object({
  interaction_id: Joi.string().required().messages({
    "*": "Please enter valid interaction Id",
  }),
  flows: Joi.array()
    .required()
    .items(
      Joi.object({
        type: Joi.string()
          .required()
          .valid(nodeType.Start, nodeType.End, nodeType.Question),
        position: Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        }).required(),
        title: Joi.string().required(),
      })
    )
    .required(),
});

const copyInteractionValidator = Joi.object({
  interaction_id: Joi.string().required().messages({
    "*": "Please enter valid interaction Id",
  }),
  folder_id: Joi.string().required().messages({
    "*": "Please enter valid folder Id",
  }),
});

const collectAnswerValidator = Joi.object({
  answer_id: Joi.string().optional().allow(""),
  interaction_id: Joi.string().required().messages({
    "*": "Please enter valid interaction Id",
  }),
  node_id: Joi.string().required().messages({
    "*": "Please enter valid Node Id",
  }),
  node_answer_type: Joi.string()
    .valid(...Object.values(answerType))
    .required(),
  answer: Joi.alternatives()
    .try(
      Joi.string(), // For text-based answers
      Joi.object() // For file-based answers (Multer attaches file as an object)
    )
    .optional(),
  type: Joi.string()
    .optional()
    .valid(openEndedType.audio, openEndedType.text, openEndedType.video),

    contact_details: Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        product: Joi.string().optional(),
        // note: Joi.string().optional(), // Uncomment if needed
      }).optional(),
});

module.exports = {
  addFolderValidator,
  updateFolderValidator,
  addInteractionValidator,
  updateInteractionValidator,
  createNodeValidator,
  updateNodeValidator,
  createDefaultFlow,
  updateCordinates,
  copyInteractionValidator,
  updateAnswerFormatValidator,
  collectAnswerValidator,
};
