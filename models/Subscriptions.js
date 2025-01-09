const mongoose = require("mongoose");
const {
  modelName,
  subscriptionsStatus,
  subscriptionPlanType,
} = require("../utils/constant");

const Schema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
      required: true,
    },
    stripe_subscription_id:{
      type: String,
      required: true,
    },
    subscription_plan_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.SUBSCRIPTION_PLAN,
      required: true,
    },
    plan_type: {
      type: String,
      enum: [subscriptionPlanType.Free, subscriptionPlanType.Premium],
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        subscriptionsStatus.active,
        subscriptionsStatus.canceled,
        subscriptionsStatus.incomplete,
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.SUBSCRIPTIONS, Schema);
