const mongoose = require("mongoose");
const { modelName, memberInvitationStatus } = require("../utils/constant");

const referralSchema = new mongoose.Schema(
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
        referral_email: {
            type: String,
            required: true,
        },
        referral_token: {
            type: String,
            required: false,
        },
        referral_status: {
            type: String,
            enum: [memberInvitationStatus.Pending, memberInvitationStatus.Completed],
            default: memberInvitationStatus.Pending,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.REFERRAL, referralSchema);