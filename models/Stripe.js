const mongoose = require("mongoose");

const stripeWebhookSchema = new mongoose.Schema(

    {
        type: {
            type: String,
            required: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "processed", "failed"],
            default: "pending",
        },
        error: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const StripeWebhook = mongoose.model("StripeWebhook", stripeWebhookSchema);

module.exports = StripeWebhook;
