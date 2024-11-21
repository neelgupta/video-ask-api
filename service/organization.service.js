const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

// for add organization
const add_organization = async (payload) => {
    try {
        return mongoService.createOne(modelName.ORGANIZATION, payload);
    } catch (error) {
        return error
    }
}

// for get single organization
const get_organization = async (query, populate) => {
    try {
        return mongoService.findOnePopulate(modelName.ORGANIZATION, query, {}, {}, populate)
    } catch (error) {
        return error
    }
}

// for get organization list
const get_organization_list = async (query, project) => {
    try {
        return mongoService.findAll(modelName.ORGANIZATION, query, project);
    } catch (error) {
        return error
    }
}

// for update organization
const update_organization = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.ORGANIZATION, query, payload);
    } catch (error) {
        return error
    }
}

// for add member in the organization
const add_member = async (payload) => {
    try {
        return mongoService.createOne(modelName.ORGANIZATION_MEMBER, payload);
    } catch (error) {
        return error
    }
}

// for get member list with options and projection
const get_members = async (query, project, options) => {
    try {
        return mongoService.findAll(modelName.ORGANIZATION_MEMBER, query, project, options);
    } catch (error) {
        return error
    }
}

// for get member counts
const get_member_counts = async (query) => {
    try {
        return mongoService.countDocument(modelName.ORGANIZATION_MEMBER, query);
    } catch (error) {
        return error
    }
}

// for get single member details
const get_single_member = async (query, project) => {
    try {
        return mongoService.findOne(modelName.ORGANIZATION_MEMBER, query, project);
    } catch (error) {
        return error
    }
}

// for update single member details
const update_member = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.ORGANIZATION_MEMBER, query, payload);
    } catch (error) {
        return error
    }
}

// for update many member details
const update_many_member = async (query, payload) => {
    try {
        return mongoService.updateMany(modelName.ORGANIZATION_MEMBER, query, payload);
    } catch (error) {
        return error
    }
}

const add_address = async (payload) => {
    try {
        return mongoService.createOne(modelName.ADDRESS, payload);
    } catch (error) {
        return error
    }
}

const get_address_list = async (query, project) => {
    try {
        return mongoService.findAll(modelName.ADDRESS, query, project)
    } catch (error) {
        return error
    }
}

const update_address = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.ADDRESS, query, payload);
    } catch (error) {
        return error
    }
}

const delete_address = async (query, payload) => {
    try {
        return mongoService.updateOne(modelName.ADDRESS, query, payload);
    } catch (error) {
        return error
    }
}

module.exports = {
    add_organization,
    get_organization,
    get_organization_list,
    update_organization,
    add_member,
    get_members,
    get_member_counts,
    get_single_member,
    update_member,
    update_many_member,
    add_address,
    get_address_list,
    update_address,
    delete_address,
}