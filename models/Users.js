const mongoose = require("mongoose");
const { role, modelName } = require("../utils/constant");

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
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: [role.ADMIN, role.USER],
      default: role.USER,
    },
    isDeleted: {
      type: Boolean,
      default: true,
    },
    terms: {
      type: termsSchema,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.USER, userSchema);
