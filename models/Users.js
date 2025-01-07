const mongoose = require("mongoose");
const { userType, modelName, memberRole } = require("../utils/constant");

const termsSchema = new mongoose.Schema(
  {
    isAgree: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAccept: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmail: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActivity: {
      type: Boolean,
      required: true,
      default: false,
    },
    isSherContent: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    user_type: {
      type: String,
      enum: [userType.ADMIN, userType.USER, userType.MEMBER],
      default: userType.USER,
    },
    member_role: {
      type: String,
      enum: [memberRole.Owner, memberRole.Member, memberRole.Admin],
    },
    current_subscription_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.SUBSCRIPTIONS,
      // required: true,
    },
    reset_password_token: {
      type: String,
    },
    reset_password_expires: {
      type: String,
    },
    is_member: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    terms: {
      type: termsSchema,
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.USER, userSchema);
