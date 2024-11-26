const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const add_folder = async (payload) => {
    try {
        return mongoService.createOne(modelName.FOLDER, payload);
    } catch (error) {
        return error
    }
}

const get_folder_list = async (query, project) => {
    try {
        return mongoService.findAll(modelName.FOLDER, query, project);
    } catch (error) {
        return error
    }
}

const get_single_folder = async (query) => {
    try {
        return mongoService.findOne(modelName.FOLDER, query);
    } catch (error) {
        return error
    }
}

const update_folder = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.FOLDER, query, payload);
    } catch (error) {
        return error
    }
}

module.exports = { add_folder, get_folder_list, get_single_folder, update_folder }