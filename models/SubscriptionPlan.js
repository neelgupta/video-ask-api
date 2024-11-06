const mongoose = require("mongoose");
const { role, modelName, planType } = require("../utils/constant");
const subPlanSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { _id: false } // This prevents Mongoose from creating _id fields for subdocuments
);
const Schema = mongoose.Schema(
  {
    plan_uuid: {
      type: String,
      required: true,
    },
    plan_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    plan_type: {
      type: String,
      enum: [planType.yearly, planType.monthly],
    },
    discount: {
      type: String,
    },
    mins: {
      type: String,
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
    sub_plan: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.SUBSCRIPTION, Schema);
