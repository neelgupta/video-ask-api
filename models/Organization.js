const mongoose = require("mongoose");

const organizationSchema = mongoose.Schema({
    organization_uuid: {
        type: String,
        required: true,
    },
    organization_name: {
        type: String,
        required: true,
    },
    organization_email: {
        type: String,
        required: true,
    },
    organization_settings: {
        type: {
            branding: { type: String, required: false },
            language: { type: String, required: false },
            font: { type: String, required: false },
        },
        required: false
    },
    address_details: {
        type: {
            apartment_number: { type: String, required: false },
            street_name: { type: String, required: false },
            state: { type: String, required: false },
            pinCode: { type: String, required: false },
            country: { type: String, required: false },
        },
        required: false
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    added_by: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true });

module.exports = mongoose.model("Organization", organizationSchema);