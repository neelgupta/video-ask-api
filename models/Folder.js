const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const folderSchema = new mongoose.Schema(
    {
        organization_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.ORGANIZATION,
            required: true,
        },
        added_by: {
            type: mongoose.Types.ObjectId,
            ref: modelName.USER,
            required: true,
        },
        folder_name: {
            type: String,
            required: true,
        },
        is_default: {
            type: Boolean,
            default: false,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.FOLDER, folderSchema);