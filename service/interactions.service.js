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

const add_new_interaction = async (payload) => {
    try {
        return mongoService.createOne(modelName.INTERACTION, payload);
    } catch (error) {
        return error
    }
}

const get_all_interactions = async (query, project) => {
    try {
        return mongoService.findAll(modelName.INTERACTION, query, project);
    } catch (error) {
        return error
    }
}

const get_single_interaction = async (query) => {
    try {
        return mongoService.findOne(modelName.INTERACTION, query);
    } catch (error) {
        return error
    }
}

const get_interaction_counts = async (query) => {
    try {
        return mongoService.countDocument(modelName.INTERACTION, query);
    } catch (error) {
        return error
    }
}

const update_interaction = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.INTERACTION, query, payload);
    } catch (error) {
        return error
    }
}

module.exports = {
    add_folder,
    get_folder_list,
    get_single_folder,
    update_folder,
    add_new_interaction,
    get_all_interactions,
    get_single_interaction,
    get_interaction_counts,
    update_interaction,
}