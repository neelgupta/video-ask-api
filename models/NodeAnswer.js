const mongoose = require("mongoose");
const { modelName, answerType } = require("../utils/constant");

const nodeAnswerSchema = new mongoose.Schema(
    {
        interaction_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.INTERACTION,
            required: true,
        },
        node_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelName.NODE,
            required: true,
        },
        answer_format: {
            type: String,
            enum:["file","text"],
            // required: true,
        },
        answer_type:{
            type: String,
            enum: Object.values(answerType),
        },
        contact_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.CONTACT,
            // required: true,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.NODE_ANSWER, nodeAnswerSchema);