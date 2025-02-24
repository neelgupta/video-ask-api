const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const directMessageAnswerSchema = new mongoose.Schema(
  {
    direct_node_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.REPLY_NODE,
      required: true,
    },
    contact_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.CONTACT,
      required: true,
    },
    answers: [
      {
        node_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: modelName.REPLY_NODE,
          required: true,
        },

        answer_details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { minimize: false, timestamps: true }
);

module.exports = mongoose.model(
  modelName.DIRECT_MESSAGE_ANSWER,
  directMessageAnswerSchema
);
