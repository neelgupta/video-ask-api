const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const contactSchema = new mongoose.Schema(
    {
        organization_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.ORGANIZATION,
            required: true,
        },
        contact_uuid: {
            type: String,
        },
        contact_name: {
            type: String,
            required: true
        },
        contact_email: {
            type: String,
            required: true
        },
        added_by: {
            type: mongoose.Types.ObjectId,
            ref: modelName.USER,
            required: true,
        },
        country_code: {
            type: String,
            required: false
        },
        phone_number: {
            type: String,
            required: false
        },
        is_favorite: {
            type: Boolean,
            default: false,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.CONTACT, contactSchema);