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
    subscription_plan_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.SUBSCRIPTION_PLAN,
      required: true,
    },
    payment_method_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.PAYMENT_METHOD,
      required: true,
    },
    stripe_client_secret: {
      type: String,
      required: true,
    },
    stripe_payment_method_id: {
      type: String,
      required: true,
    },
    stripe_subscription_id: {
      type: String,
      required: true,
    },
    stripe_invoice_id: {
      type: String,
      required: true,
    },
    stripe_payment_intent: {
      type: String,
      required: true,
    },
    stripe_charge_id:{
      type:String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    plan_type: {
      type: String,
      enum: [subscriptionPlanType.Free, subscriptionPlanType.Premium],
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
        subscriptionsStatus.succeeded,
      ],
    },
    billing_address_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.ADDRESS,
      required: true,
    },
    shipping_address_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.ADDRESS,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.SUBSCRIPTIONS, Schema);
