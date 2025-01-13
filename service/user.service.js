const mongoose = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");
const { create_token } = require("../lib/token_manager");

const findUser = async (payload) => {
  try {
    return await mongoService.findOne(modelName.USER, payload);
  } catch (error) {
    throw error;
  }
};

const registerUser = async (payload) => {
  try {
    return await mongoService.createOne(modelName.USER, payload);
  } catch (error) {
    throw error;
  }
};

const create_jwt_token = async (payload) => {
  try {
    return await create_token(payload);
  } catch (error) {
    throw error;
  }
};

const updateUser = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.USER, query, payload, {});
  } catch (error) {
    throw error;
  }
};

const updateAllUser = async (query, payload) => {
  try {
    return await mongoService.updateMany(modelName.USER, query, payload, {});
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async (options) => {
  try {
    return await mongoService.findAll(modelName.USER, {}, {}, options);
  } catch (error) {
    throw error;
  }
};

const getAllUsersByAggregation = async (userId) => {
  try {
    let pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
    ];
    return await mongoService.aggregation(modelName.USER, pipeline);
  } catch (error) {
    throw error;
  }
};

const fetchUser = async (match, project, populateQuery) => {
  try {
    return await mongoService.findOnePopulate(
      modelName.USER,
      match,
      project,
      {},
      populateQuery
    );
  } catch (error) {
    throw error;
  }
};

const getUserSubscriptionPlan = async (query, populate) => {
  try {
    return await mongoService.findOnePopulate(
      modelName.USER,
      query,
      {},
      {},
      populate
    );
  } catch (error) {
    throw error;
  }
};

const get_subscriptions_list = async (query) => {
  try {
    return await mongoService.findAll(modelName.SUBSCRIPTIONS, query);
  } catch (error) {
    throw error;
  }
};

const get_subscriptions = async (query) => {
  try {
    return await mongoService.findOne(modelName.SUBSCRIPTIONS, query);
  } catch (error) {
    throw error;
  }
};

const purchase_subscription = async (payload) => {
  try {
    return await mongoService.createOne(modelName.SUBSCRIPTIONS, payload);
  } catch (error) {
    throw error;
  }
};

const update_subscription = async (query, payload) => {
  try {
    return await mongoService.updateOne(
      modelName.SUBSCRIPTIONS,
      query,
      payload
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findUser,
  registerUser,
  create_jwt_token,
  updateUser,
  getAllUsers,
  updateAllUser,
  getAllUsersByAggregation,
  fetchUser,
  get_subscriptions_list,
  get_subscriptions,
  purchase_subscription,
  getUserSubscriptionPlan,
  update_subscription,
};
