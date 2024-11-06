const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const createSubscriptionPlan = async (payload) => {
  try {
    console.log("payload", payload);
    return await mongoService.createOne(modelName.SUBSCRIPTION, payload);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllSubscriptionPlan = async (options) => {
  try {
    return await mongoService.findAll(
      modelName.SUBSCRIPTION,
      { isDeleted: false },
      {},
      options
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateSubscriptionPlan = async (query, payload) => {
  try {
    return await mongoService.updateOne(
      modelName.SUBSCRIPTION,
      query,
      payload,
      {}
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteSubscriptionPlan = async (query) => {
  try {
    return await mongoService.updateOne(
      modelName.SUBSCRIPTION,
      query,
      { isDeleted: true },
      {}
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findPlanById = async (payload) => {
  try {
    return await mongoService.findOne(modelName.SUBSCRIPTION, payload);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  createSubscriptionPlan,
  getAllSubscriptionPlan,
  updateSubscriptionPlan,
  findPlanById,
  deleteSubscriptionPlan,
};
