const mongoose = require("mongoose");
const { shardModelName } = require("../../utils/constant");

const shardEdgeSchema = new mongoose.Schema(
  {
    interaction_id: {
      type: mongoose.Types.ObjectId,
      ref: shardModelName.SHARD_INTERACTION,
      required: true,
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: shardModelName.SHARD_NODE,
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: shardModelName.SHARD_NODE,
      required: true,
    },
    label: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(shardModelName.SHARD_EDGE, shardEdgeSchema);
