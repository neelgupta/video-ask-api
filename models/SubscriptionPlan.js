const mongoose = require("mongoose");
const {
  modelName,
  planType,
  subscriptionPlanType,
} = require("../utils/constant");

// old schema
// const Schema = mongoose.Schema(
//   {
//     plan_uuid: {
//       type: String,
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     plan_type: {
//       type: String,
//       enum: [subscriptionPlanType.Free, subscriptionPlanType.Basic, subscriptionPlanType.Pro, subscriptionPlanType.Enterprise],
//     },
//     sub_title: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: [String], // Array of strings for plan descriptions
//       required: true,
//     },
//     currency: {
//       type: String,
//       required: true,
//     },
//     page:{
//       type:Number,
//       required:true
//     },
//     storage:{
//       type:Number,
//       required:true
//     },
//     members:{
//       type:Number,
//       required:true
//     },
//     discount: {
//       type: String,
//     },
//     is_best_deal: {
//       type: Boolean,
//       default: false,
//     },
//     is_upgrade: {
//       type: Boolean,
//       default: false,
//     },
//     is_custom: {
//       type: Boolean,
//       default: false,
//     },
//     button_text: {
//       type: String,
//       required: true,
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//     is_deleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// new schema
const Schema = mongoose.Schema(
  {
    plan_uuid: {
      type: String,
      required: true,
    },
    stripe_plan_id:{
      type:String,
      // required:true,
    },
    stripe_price_id:{
      type:String,
    },
    title: {
      type: String,
      required: true,
    },
    sub_title: {
      type: String,
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
    interval: {
      type: Number,
    },
    description: {
      type: String, // Array of strings for plan descriptions
      required: true,
    },
    page: {
      // page_unlock_limit
      type: Number,
      required: true,
    },
    storage: {
      // storage_limit in the GB
      type: Number,
      required: true,
    },
    members: {
      // team_members_limit
      type: Number,
      required: true,
    },
    is_best_deal: {
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
    added_by: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.SUBSCRIPTION_PLAN, Schema);
