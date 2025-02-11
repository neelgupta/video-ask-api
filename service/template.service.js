const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const {
  modelName,
  answerType,
  generateLabels,
  shardModelName,
} = require("../utils/constant");
const dayjs = require("dayjs");

const get_shard_interaction = async () => {
  try {
    return await mongoService.findOne(
      shardModelName.SHARD_INTERACTION,
      payload
    );
  } catch (error) {
    throw error;
  }
};

const add_new_shard_interaction = async (payload) => {
  try {
    return mongoService.createOne(shardModelName.SHARD_INTERACTION, payload);
  } catch (error) {
    return error;
  }
};

const add_Shard_Node = async (payload) => {
  try {
    return mongoService.createOne(shardModelName.SHARD_NODE, payload);
  } catch (error) {
    return error;
  }
};

const update_Shard_Node = async (query, payload) => {
  try {
    return mongoService.updateOne(shardModelName.SHARD_NODE, query, payload);
  } catch (error) {
    return error;
  }
};

const add_Shard_Edge = async (payload) => {
  try {
    return mongoService.createOne(shardModelName.SHARD_EDGE, payload);
  } catch (error) {
    return error;
  }
};

const get_Shard_Template = async (interactionId) => {
  try {
    let pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(interactionId),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "shard_nodes",
          localField: "_id",
          foreignField: "interaction_id",
          as: "nodes",
          pipeline: [
            { $match: { is_deleted: false } },
            { $sort: { index: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "shard_edges",
          localField: "_id",
          foreignField: "interaction_id",
          as: "edges",
          pipeline: [{ $match: { is_deleted: false } }],
        },
      },
    ];
    let data = await mongoService.aggregation(
      shardModelName.SHARD_INTERACTION,
      pipeline
    );

    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  get_shard_interaction,
  add_new_shard_interaction,
  add_Shard_Node,
  add_Shard_Edge,
  get_Shard_Template,
  update_Shard_Node,
};
