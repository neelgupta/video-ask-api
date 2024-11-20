const mongoose = require("mongoose");
const { memberRole } = require("../utils/constant");

const organizationSchema = mongoose.Schema({
    organization_uuid: {
        type: String,
        required: true,
    },
    organization_name: {
        type: String,
        required: true,
    },
    replay_to_email: {
        type: String,
    },
    members: [
        {
            userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
            role: {
                type: String,
                enum: [memberRole.Owner, memberRole.Member, memberRole.Admin],
                // required: true,
            },
        },
    ],
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