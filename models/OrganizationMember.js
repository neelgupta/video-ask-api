const mongoose = require("mongoose");
const { modelName, memberRole, memberInvitationStatus } = require("../utils/constant");

const organizationMemberSchema = mongoose.Schema({
    organization_id: {
        type: mongoose.Types.ObjectId,
        ref: modelName.ORGANIZATION
    },
    member_uuid: {
        type: String,
        required: true,
    },
    member_name: {
        type: String,
        required: true,
    },
    member_email: {
        type: String,
        required: true,
    },
    member_phone: {
        type: String,
        // required: true,
    },
    member_role: {
        type: String,
        enum: [memberRole.Owner, memberRole.Admin, memberRole.Member],
        required: true,
    },
    invitation_status: {
        type: String,
        enum: [memberInvitationStatus.Pending, memberInvitationStatus.Completed],
        default: memberInvitationStatus.Pending,
    },
    invitation_token: { // this field is only for the development purpose
        type: String,
    },
    is_active: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model(modelName.ORGANIZATION_MEMBER, organizationMemberSchema);