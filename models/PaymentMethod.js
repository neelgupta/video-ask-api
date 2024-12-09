const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const paymentMethodSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.ORGANIZATION,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
      required: true,
    },
    card_type: {
      type: String,
      required: true,
    },
    card_number: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.PAYMENT_METHOD, paymentMethodSchema);
