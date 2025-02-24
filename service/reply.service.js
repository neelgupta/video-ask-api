const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const findOneReplyNode = async (query) => {
  try {
    return await mongoService.findOne(modelName.REPLY_NODE, query);
  } catch (error) {
    throw error;
  }
};

const createReplyNode = async (payload) => {
  try {
    return await mongoService.createOne(modelName.REPLY_NODE, payload);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReplyNode,
  findOneReplyNode,
};
