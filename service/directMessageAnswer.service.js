const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const add_direct_message_answer = async (payload) => {
  try {
    return mongoService.createOne(modelName.DIRECT_MESSAGE_ANSWER, payload);
  } catch (error) {
    return error;
  }
};

const update_direct_message_answer = async (query, payload) => {
  try {
    return mongoService.updateOne(
      modelName.DIRECT_MESSAGE_ANSWER,
      query,
      payload
    );
  } catch (error) {
    return error;
  }
};

const get_direct_message_node = async (query) => {
  try {
    return mongoService.findOne(modelName.REPLY_NODE, query);
  } catch (error) {
    return error;
  }
};

const get_direct_message_answer = async (query) => {
  try {
    return mongoService.findOne(modelName.DIRECT_MESSAGE_ANSWER, query);
  } catch (error) {
    return error;
  }
};

const get_direct_message_answer_by_contact = async (contactId) => {
  console.log("contactId", contactId);
  try {
    const pipeline = [
      {
        $match: {
          contact_id: new mongoose.Types.ObjectId(contactId),
          type: "direct-message",
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "direct_message_answers",
          localField: "_id",
          foreignField: "direct_node_id",
          as: "reply",
          pipeline: [
            {
              $project: {
                _id: 1,
                answers: 1,
                direct_node_id: 1,
                is_deleted: 1,
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
                from: "reply_nodes",
                localField: "answers.node_id",
                foreignField: "_id",
                as: "answers.nodeDetails",
                pipeline: [
                  {
                    $project: {
                      updatedAt: 0,
                      __v: 0,
                      added_by: 0,
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
                direct_node_id: {
                  $first: "$direct_node_id",
                },
                is_deleted: { $first: "$is_deleted" },
                answers: {
                  $push: "$answers",
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$reply",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          contact_id: 1,
          organization_id: 1,
          type: 1,
          node_style: 1,
          video_thumbnail: 1,
          title: 1,
          video_url: 1,
          createdAt: 1,
          reply: 1,
        },
      },
    ];
    return mongoService.aggregation(modelName.REPLY_NODE, pipeline);
  } catch (error) {
    return error;
  }
};

module.exports = {
  add_direct_message_answer,
  update_direct_message_answer,
  get_direct_message_node,
  get_direct_message_answer,
  get_direct_message_answer_by_contact,
};
