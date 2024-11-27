const mongoose = require("mongoose");
const { modelName, interactionType, flowType } = require("../utils/constant");

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