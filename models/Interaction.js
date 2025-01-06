const mongoose = require("mongoose");
const { modelName, interactionType, answerType } = require("../utils/constant");

const interactionSchema = new mongoose.Schema(
    {
        // organization_id: {
        //     type: mongoose.Types.ObjectId,
        //     ref: modelName.ORGANIZATION,
        //     required: true,
        // },
        interaction_type: {
            type: String,
            enum: [interactionType.Scratch, interactionType.FlowAI, interactionType.Template],
            required: true,
        },
        is_lead_crm: {
            type: Boolean
        },
        title: {
            type: String,
            required: true,
        },
        is_collect_contact: {
            type: Boolean,
        },
        language: {
            type: String,
        },
        folder_id: {
            type: mongoose.Types.ObjectId,
            ref: modelName.FOLDER,
        },
        contact_details:{
            is_name: {
                type: Boolean,
                default:false,
            },
            is_email: {
                type: Boolean,
                default:true,
            },
            is_phone: {
                type: Boolean,
                default:false,
            },
            is_product: {
                type: Boolean,
                default:false,
            },
            is_note: {
                type: Boolean,
                default:false,
            },
            note:{
                type: String, 
                default:"",
            },
        },
        added_by: {
            type: mongoose.Types.ObjectId,
            ref: modelName.USER,
            required: true,
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

module.exports = mongoose.model(modelName.INTERACTION, interactionSchema);