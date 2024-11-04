const mongoose = require("mongoose");
const { role, modelName } = require("../utils/constant");

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
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
}, { timestamps: true });

module.exports = mongoose.model(modelName.USER, userSchema)