const mongoose = require("mongoose");
const { modelName, interactionType, answerType } = require("../utils/constant");

const interactionSchema = new mongoose.Schema(
    {
        organization_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.ORGANIZATION,
            required: true,
        },
        interaction_type: {
            type: String,
            enum: [interactionType.Scratch, interactionType.FlowAI, interactionType.Template],
            required: true,
        },
        is_lead_crm: {
            type: Boolean
        },
        title: {
            type: String,
            required: true,
        },
        is_collect_contact: {
            type: Boolean,
        },
        language: {
            type: String,
        },
        folder_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.FOLDER,
        },
        answer_type: {
            type: String,
            enum: Object.values(answerType), // Use Object.values for enum
        },
        answer_format: [
            {
                type: mongoose.Schema.Types.Mixed,
            },
        ],
        added_by: {
            type: mongoose.Types.ObjectId,
            ref: modelName.USER,
            required: true,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.INTERACTION, interactionSchema);