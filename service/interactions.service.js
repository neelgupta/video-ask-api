const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const add_folder = async (payload) => {
  try {
    return mongoService.createOne(modelName.FOLDER, payload);
  } catch (error) {
    return error;
  }
};

const get_folder_list = async (query, project) => {
  try {
    return mongoService.findAll(modelName.FOLDER, query, project);
  } catch (error) {
    return error;
  }
};

const get_single_folder = async (query) => {
  try {
    return mongoService.findOne(modelName.FOLDER, query);
  } catch (error) {
    return error;
  }
};

const update_folder = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.FOLDER, query, payload);
  } catch (error) {
    return error;
  }
};

const add_new_interaction = async (payload) => {
  try {
    return mongoService.createOne(modelName.INTERACTION, payload);
  } catch (error) {
    return error;
  }
};

const get_all_interactions = async (query, project) => {
  try {
    return mongoService.findAll(modelName.INTERACTION, query, project);
  } catch (error) {
    return error;
  }
};

const get_single_interaction = async (query, projection = {}) => {
  try {
    return mongoService.findOne(modelName.INTERACTION, query, projection);
  } catch (error) {
    return error;
  }
};

const get_interaction_counts = async (query) => {
  try {
    return mongoService.countDocument(modelName.INTERACTION, query);
  } catch (error) {
    return error;
  }
};

const update_interaction = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.INTERACTION, query, payload);
  } catch (error) {
    return error;
  }
};

const add_flow = async (payload) => {
  try {
    return mongoService.createOne(modelName.NODE, payload);
  } catch (error) {
    return error;
  }
};

const get_single_node = async (query) => {
  try {
    return mongoService.findOne(modelName.NODE, query);
  } catch (error) {
    return error;
  }
};

const get_flow_list = async (query, project) => {
  try {
    return mongoService.findAll(modelName.NODE, query, project);
  } catch (error) {
    return error;
  }
};

const update_Node = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.NODE, query, payload);
  } catch (error) {
    return error;
  }
};

const add_Node = async (payload) => {
  try {
    return mongoService.createOne(modelName.NODE, payload);
  } catch (error) {
    return error;
  }
};

const add_Edge = async (payload) => {
  try {
    return mongoService.createOne(modelName.EDGE, payload);
  } catch (error) {
    return error;
  }
};

const update_Edge = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.EDGE, query, payload);
  } catch (error) {
    return error;
  }
};

// delete permanently
const remove_Edge = async (query) => {
  try {
    return mongoService.deleteDocument(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

// delete permanently
remove_multiple_Edge = async (query) => {
  try {
    return mongoService.deleteManyDocument(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

// delete permanently
const remove_Node = async (query) => {
  try {
    return mongoService.deleteManyDocument(modelName.NODE, query);
  } catch (error) {
    return error;
  }
};

// delete permanently
const remove_interaction = async (query) => {
  try {
    return mongoService.deleteDocument(modelName.INTERACTION, query);
  } catch (error) {
    return error;
  }
};

const getNodesList = async (interactionId) => {
  try {
    let pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(interactionId),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "nodes",
          localField: "_id",
          foreignField: "interaction_id",
          as: "nodes",
          pipeline: [
            { $match: { is_deleted: false } },
            { $sort: { index: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "edges",
          localField: "_id",
          foreignField: "interaction_id",
          as: "edges",
          pipeline: [{ $match: { is_deleted: false } }],
        },
      },
    ];
    return await mongoService.aggregation(modelName.INTERACTION, pipeline);
  } catch (error) {
    throw error;
  }
};

const getLibrary = async (query, search) => {
  if (query.length) {
    query.map((ele) => {
      return new mongoose.Types.ObjectId(ele);
    });
  }
  let matchQuery = {
    interaction_id: { $in: query },
    type: "Question",
    video_thumbnail: { $exists: true },
    is_deleted: false,
  };

  if (search) {
    matchQuery = { ...matchQuery, title: { $regex: search, $options: "i" } };
  }
  try {
    let pipeline = [
      { $match: matchQuery },
      {
        $project: {
          video_thumbnail: 1,
          interaction_id: 1,
          title: 1,
        },
      },
    ];
    return await mongoService.aggregation(modelName.NODE, pipeline);
  } catch (error) {
    throw error;
  }
};

const find_Edge = async (query) => {
  try {
    return mongoService.findOne(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

const add_answer = async (payload) => {
  try {
    return mongoService.createOne(modelName.NODE_ANSWER, payload);
  } catch (error) {
    return error;
  }
};

const get_answer = async (query) => {
  try {
    return mongoService.findOne(modelName.NODE_ANSWER, query);
  } catch (error) {
    return error;
  }
};

const update_answer = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.NODE_ANSWER, query, payload);
  } catch (error) {
    return error;
  }
};

const get_interaction_answer = async (match) => {
  try {
    let pipeline = [
      {
        $match: {
          interaction_id: new mongoose.Types.ObjectId(match.interactionId),
          is_deleted: false,
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
          pipeline: [{ $project: { updatedAt: 0, __v: 0, added_by: 0 } }],
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
          interaction_id: { $first: "$interaction_id" },
          is_deleted: { $first: "$is_deleted" },
          contact_id: { $first: "$contact_id" },
          createdAt: { $first: "$createdAt" },
          answers: {
            $push: "$answers",
          },
        },
      },
      {
        $lookup: {
          from: "contacts",
          localField: "contact_id",
          foreignField: "_id",
          as: "contact_details",
          pipeline: [
            {
              $project: {
                updatedAt: 0,
                __v: 0,
                is_deleted: 0,
                is_favorite: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$contact_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $lookup: {
      //     from: "interactions",
      //     localField: "interaction_id",
      //     foreignField: "_id",
      //     as: "interaction_details",
      //     pipeline: [
      //       {
      //         $project: {
      //           organization_id: 1,
      //           interaction_type: 1,
      //           is_lead_crm: 1,
      //           title: 1,
      //           is_collect_contact: 1,
      //           language: 1,
      //           folder_id: 1,
      //           contact_details: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$interaction_details",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
    ];
    return await mongoService.aggregation(modelName.NODE_ANSWER, pipeline);
  } catch (error) {
    return error;
  }
};

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
  add_flow,
  get_flow_list,
  get_single_node,
  update_Node,
  add_Node,
  add_Edge,
  getNodesList,
  update_Edge,
  getLibrary,
  find_Edge,
  remove_Edge,
  remove_Node,
  remove_interaction,
  add_answer,
  update_answer,
  get_answer,
  get_interaction_answer,
};
