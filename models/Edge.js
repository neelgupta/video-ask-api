const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const edgeSchema = new mongoose.Schema(
    {
        interaction_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.INTERACTION,
            required: true,
        },
        source: {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelName.NODE,
            required: true,
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelName.NODE,
            required: true,
        },
        label: {
            type: String,
            // required: true,
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

module.exports = mongoose.model(modelName.EDGE, edgeSchema);