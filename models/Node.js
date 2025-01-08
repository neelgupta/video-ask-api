const mongoose = require("mongoose");
const { modelName, flowType, answerType } = require("../utils/constant");

const nodeSchema = new mongoose.Schema(
    {
        interaction_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.INTERACTION,
            required: true,
        },
        added_by: {
            type: mongoose.Types.ObjectId,
            ref: modelName.USER,
            required: true,
        },
        type: {
            type: String,
        },
        position: {
            x: {
                type: Number,
                required: true,
            },
            y: {
                type: Number,
                required: true,
            },
        },
        flow_type: {
            type: String,
            enum: [flowType.Webcam, flowType.Upload, flowType.Screen, flowType.Library, flowType.FlowAI],
        },
        video_thumbnail: {
            type: String,
        },
        title: {
            type: String,
        },
        video_url: {
            type: String,
        },
        video_size:{ // stored in bytes format
            type: Number,
            default :0
        },
        video_align: {
            type: Boolean,
        },
        video_duration:{
            type:String,
        },
        video_position: {
            type: String,
        },
        overlay_text: {
            type: String,
        },
        text_size: {
            type: String,
        },
        fade_reveal: {
            type: String,
        },
        description: {
            type: String,
        },
        answer_type: {
            type: String,
            enum: Object.values(answerType), 
        },
        answer_format: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        collect_contact: {
            type: Boolean,
            default: false,
        },
        index:{
            type:Number,
        },
        // media_type:{

        // },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { minimize: false,timestamps: true },
);

module.exports = mongoose.model(modelName.NODE, nodeSchema);