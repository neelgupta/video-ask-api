const mongoose = require("mongoose");
const { modelName, memberRole, replyTypes } = require("../utils/constant");

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
            userId: { type: mongoose.Types.ObjectId, ref: modelName.USER, required: true },
            role: {
                type: String,
                enum: [memberRole.Owner, memberRole.Member, memberRole.Admin],
                // required: true,
            },
        },
    ],
    branding: { type: String, required: false },
    language: { type: String, required: false },
    font: { type: String, required: false },
    colors: { type: String, required: false },
    border_radius: { type: Number, required: false },
    notification_settings: {
        type: {
            new_user_contacts: { type: Boolean, default: false },
            tips_and_tutorials: { type: Boolean, default: false },
            user_research: { type: Boolean, default: false },
        },
    },
    replies: {
        type: String,
        enum: [replyTypes.DO_NOT_NOTIFY, replyTypes.MENTIONS_ONLY, replyTypes.ALL_COMMENTS],
        default: replyTypes.DO_NOT_NOTIFY
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
        ref: modelName.USER
    },
}, { timestamps: true });

module.exports = mongoose.model(modelName.ORGANIZATION, organizationSchema);