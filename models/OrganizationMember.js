const mongoose = require("mongoose");
const { memberRole } = require("../utils/constant");

const organizationMemberSchema = mongoose.Schema({
    organization_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Organization'
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
        required: true,
    },
    member_role: {
        type: String,
        enum: [memberRole.OWNER, memberRole.ADMIN, memberRole.MEMBER],
        required: true,
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
        ref: 'User'
    },
}, { timestamps: true });

module.exports = mongoose.model("OrganizationMember", organizationMemberSchema);