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
        },
        contact_email: {
            type: String,
        },
        added_by: {
            type: mongoose.Types.ObjectId,
            ref: modelName.USER,
            // required: true,
        },
        phone_number: {
            type: String,
        },
        product_name:{
            type:String,
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