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
    return await mongoService.populate(
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

module.exports = {
  findUser,
  registerUser,
  create_jwt_token,
  updateUser,
  getAllUsers,
  updateAllUser,
  getAllUsersByAggregation,
  fetchUser,
};
