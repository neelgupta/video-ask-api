const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const add_contact = async (payload) => {
    try {
        return mongoService.createOne(modelName.CONTACT, payload);
    } catch (error) {
        return error
    }
}

const get_all_contacts = async (query, project, options) => {
    try {
        return mongoService.findAll(modelName.CONTACT, query, project, options);
    } catch (error) {
        return error
    }
}

const get_single_contact = async (query) => {
    try {
        return mongoService.findOnePopulate(modelName.CONTACT, query);
    } catch (error) {
        return error
    }
}

const update_contact = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.CONTACT, query, payload);
    } catch (error) {
        return error
    }
}

const contact_count = async (query) => {
    try {
        return mongoService.countDocument(modelName.CONTACT, query);
    } catch (error) {
        return error
    }
}


module.exports = { add_contact, get_all_contacts, get_single_contact, update_contact, contact_count }