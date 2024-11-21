const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const createSubscriptionPlan = async (payload) => {
  try {
    return await mongoService.createOne(modelName.SUBSCRIPTION_PLAN, payload);
  } catch (error) {
    throw error;
  }
};

const getAllSubscriptionPlan = async (options) => {
  try {
    return await mongoService.findAll(
      modelName.SUBSCRIPTION_PLAN,
      {},
      {},
      options
    );
  } catch (error) {
    throw error;
  }
};

const updateSubscriptionPlan = async (query, payload) => {
  try {
    return await mongoService.updateOne(
      modelName.SUBSCRIPTION_PLAN,
      query,
      payload,
      {}
    );
  } catch (error) {
    throw error;
  }
};

const deleteSubscriptionPlan = async (query) => {
  try {
    return await mongoService.updateOne(
      modelName.SUBSCRIPTION_PLAN,
      query,
      { isDeleted: true },
      {}
    );
  } catch (error) {
    throw error;
  }
};

const findPlanById = async (payload) => {
  try {
    return await mongoService.findOne(modelName.SUBSCRIPTION_PLAN, payload);
  } catch (error) {
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
