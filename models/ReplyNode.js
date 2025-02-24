const mongoose = require("mongoose");
const { flowType, modelName, answerType } = require("../utils/constant");

const replyNodeSchema = new mongoose.Schema(
  {
    contact_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.CONTACT,
      required: true,
    },
    organization_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.ORGANIZATION,
      required: true,
    },

    answer_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.NODE_ANSWER,
      required: function () {
        return this.type === "reply";
      },
    },
    interaction_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.INTERACTION,
      required: function () {
        return this.type === "reply";
      },
    },

    reply_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.REPLY_NODE,
      required: function () {
        return this.type === "reply-message";
      },
    },
    direct_node_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.REPLY_NODE,
      required: function () {
        return this.type === "reply-message";
      },
    },
    type: {
      type: String,
      enum: ["reply", "direct-message", "reply-message"],
      required: true,
    },
    flow_type: {
      type: String,
      enum: [
        flowType.Webcam,
        flowType.Upload,
        flowType.Screen,
        flowType.Library,
        flowType.FlowAI,
      ],
    },
    node_style: {
      primary_color: {
        type: String,
        default: function () {
          return this.type === "direct-message" ? "#000000" : undefined;
        },
      },
      secondary_color: {
        type: String,
        default: function () {
          return this.type === "direct-message" ? "#000000" : undefined;
        },
      },
      background_color: {
        type: String,
        default: function () {
          return this.type === "direct-message" ? "#f1f1f1" : undefined;
        },
      },
      border_radius: {
        type: Number,
        default: function () {
          return this.type === "direct-message" ? 0 : undefined;
        },
      },
      font_size: {
        type: String,
        default: function () {
          return this.type === "direct-message" ? "16px" : undefined;
        },
      },
      font_family: {
        type: String,
        default: function () {
          return this.type === "direct-message" ? "Arial" : undefined;
        },
      },
      language: {
        type: String,
        default: function () {
          return this.type === "direct-message" ? "en" : undefined;
        },
      },
    },
    video_thumbnail: {
      type: String,
    },
    title: {
      type: String,
    },
    video_url: {
      type: String,
    },
    video_size: {
      // stored in bytes format
      type: Number,
      default: 0,
    },
    video_align: {
      type: Boolean,
    },
    video_position: {
      type: String,
    },
    overlay_text: {
      type: String,
    },
    text_size: {
      type: String,
    },
    fade_reveal: {
      type: String,
    },
    redirection_url: {
      type: String,
    },
    answer_type: {
      type: String,
      enum: Object.values(answerType),
    },
    answer_format: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    collect_contact: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
    },
    is_disabled: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    added_by: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
    },
  },
  { minimize: false, timestamps: true }
);

module.exports = mongoose.model(modelName.REPLY_NODE, replyNodeSchema);
