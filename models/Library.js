const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const librarySchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Types.ObjectId,
      ref: modelName.ORGANIZATION,
      required: true,
    },
    media_thumbnail: {
      type: String,
    },
    link_id: {
      type: mongoose.Types.ObjectId,
      required: function () {
        return this.is_link;
      },
    },
    media_type: {
      type: String,
      enum: ["node", "library"],
      default: "library",
    },
    media_url: {
      type: String,
    },
    media_size: {
      type: Number,
      default: 0,
    },
    is_link: {
      type: Boolean,
      default: function () {
        return this.media_type === "node";
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    added_by: {
      type: mongoose.Types.ObjectId,
      ref: modelName.USER,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.LIBRARY, librarySchema);
