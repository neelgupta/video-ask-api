const mongoose = require("mongoose");
const { modelName, planType, subscriptionPlanType } = require("../utils/constant");

const Schema = mongoose.Schema(
  {
    plan_uuid: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    plan_type: {
      type: String,
      enum: [subscriptionPlanType.Free, subscriptionPlanType.Basic, subscriptionPlanType.Pro, subscriptionPlanType.Enterprise],
    },
    sub_title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    description: {
      type: [String], // Array of strings for plan descriptions
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
    },
    is_best_deal: {
      type: Boolean,
      default: false,
    },
    is_upgrade: {
      type: Boolean,
      default: false,
    },
    is_custom: {
      type: Boolean,
      default: false,
    },
    button_text: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.SUBSCRIPTION_PLAN, Schema);
