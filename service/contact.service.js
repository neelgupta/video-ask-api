const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const add_contact = async (payload) => {
  try {
    return mongoService.createOne(modelName.CONTACT, payload);
  } catch (error) {
    return error;
  }
};

const get_all_contacts = async (query, project, options) => {
  try {
    return mongoService.findAll(modelName.CONTACT, query, project, options);
  } catch (error) {
    return error;
  }
};

const get_single_contact = async (query) => {
  try {
    return mongoService.findOnePopulate(modelName.CONTACT, query);
  } catch (error) {
    return error;
  }
};

const update_contact = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.CONTACT, query, payload);
  } catch (error) {
    return error;
  }
};

const contact_count = async (query) => {
  try {
    return mongoService.countDocument(modelName.CONTACT, query);
  } catch (error) {
    return error;
  }
};

const find_node_answer = async (query) => {
  try {
    return await mongoService.findOne(modelName.NODE_ANSWER, query);
  } catch (error) {
    return error;
  }
};

const remove_contact_answer = async (contact_id) => {
  try {
    return await mongoService.updateMany(
      modelName.NODE_ANSWER,
      { contact_id: new mongoose.Types.ObjectId(contact_id) }, // Filter: Update all active users
      { $set: { contact_id: null } } // Update: Set `active` to false
    );
  } catch (error) {
    return error;
  }
};

const get_conversations = async (query) => {
  try {
    let pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(query.contact_id),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "node_answers",
          localField: "_id",
          foreignField: "contact_id",
          as: "answersDetails",
          pipeline: [
            { $match: { is_deleted: false } },
            {
              $lookup: {
                from: "interactions",
                localField: "interaction_id",
                foreignField: "_id",
                as: "interactionDetails",
              },
            },
            {
              $unwind: {
                path: "$interactionDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$answers",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "nodes",
                localField: "answers.node_id",
                foreignField: "_id",
                as: "answers.nodeDetails",
                pipeline: [
                  {
                    $project: {
                      type: 1,
                      flow_type: 1,
                      video_thumbnail: 1,
                      title: 1,
                      overlay_text: 1,
                      answer_type: 1,
                      createdAt: 1,
                      index: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$answers.nodeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                interactionDetails: { $first: "$interactionDetails" },
                is_deleted: { $first: "$is_deleted" },
                createdAt: { $first: "$createdAt" },
                answers: {
                  $push: "$answers",
                },
              },
            },
            { $project: { updatedAt: 0, __v: 0, added_by: 0 } },
          ],
        },
      },
      { $project: { updatedAt: 0, __v: 0, added_by: 0, is_favorite: 0 } },
    ];
    return await mongoService.aggregation(modelName.CONTACT, pipeline);
  } catch (error) {
    return error;
  }
};

module.exports = {
  add_contact,
  get_all_contacts,
  get_single_contact,
  update_contact,
  contact_count,
  find_node_answer,
  get_conversations,
  remove_contact_answer,
};
