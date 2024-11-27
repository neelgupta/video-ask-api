const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const nodeSchema = new mongoose.Schema({
    flow_id: {
        type: mongoose.Types.ObjectId,
        ref: modelName.FLOW,
    },
    type: {
        type: String,
        required: true,
    },
    position: {
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
    },
    data: {
        idx: {
            type: Number,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
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
});

module.exports = mongoose.model(modelName.NODE, nodeSchema);