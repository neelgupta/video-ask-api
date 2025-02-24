const mongoose = require("mongoose");
const { modelName, answerType } = require("../utils/constant");

const nodeAnswerSchema = new mongoose.Schema(
  {
    // organization_id: {
    //   type: mongoose.Types.ObjectId,
    //   ref: modelName.ORGANIZATION,
    //   required: true,
    // },
    interaction_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.INTERACTION,
      required: true,
    },
    answers: [
      {
        node_id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "answers.node_type",
          required: true,
        },
        node_type: {
          type: String,
          required: true,
          enum: [modelName.NODE, modelName.REPLY_NODE],
          default: modelName.NODE,
        },
        node_answer_type: {
          type: String,
          enum: Object.values(answerType),
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
    contact_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.CONTACT,
    },
    is_completed_interaction: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    device_name: {
      type: String,
      default: "",
    },
  },
  { minimize: false, timestamps: true }
);

module.exports = mongoose.model(modelName.NODE_ANSWER, nodeAnswerSchema);
