const mongoose = require("mongoose");
const { modelName, interactionType } = require("../utils/constant");

const interactionSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.ORGANIZATION,
      required: true,
    },
    interaction_type: {
      type: String,
      enum: [
        interactionType.Scratch,
        interactionType.FlowAI,
        interactionType.Template,
      ],
      required: true,
    },
    is_lead_crm: {
      type: Boolean,
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
    contact_details: {
      is_name: {
        type: Boolean,
        default: true,
      },
      is_email: {
        type: Boolean,
        default: true,
      },
      is_phone: {
        type: Boolean,
        default: false,
      },
      is_product: {
        type: Boolean,
        default: false,
      },
      is_note: {
        type: Boolean,
        default: false,
      },
      note: {
        type: String,
        default: "",
      },
    },
    language: { type: String, required: false },
    font: { type: String, required: false },
    primary_color: { type: String, default: "#7B5AFF" },
    secondary_color: { type: String, default: "#B3A1FF" },
    background_color: { type: String, default: "#FFFFFF" },
    border_radius: { type: Number, required: false },
    added_by: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.INTERACTION, interactionSchema);
