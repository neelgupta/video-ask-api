const mongoose = require("mongoose");
const { modelName, addressType } = require("../utils/constant");

const addressSchema = new mongoose.Schema(
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
        apartment_number: {
            type: String,
            required: true,
        },
        street_name: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pinCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        address_type: {
            type: String,
            enum: [addressType.Billing, addressType.Shipping],
            required: true,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.ADDRESS, addressSchema);