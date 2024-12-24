const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const librarySchema = new mongoose.Schema(
    {
        organization_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.ORGANIZATION,
            required: true,
        },
        video_thumbnail: {
            type: String,
        },
        video_url: {
            type: String,
        },
        is_connected_with_node:{
            type: Boolean,
            default: false
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

module.exports = mongoose.model(modelName.LIBRARY, librarySchema);