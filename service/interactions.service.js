const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName, answerType } = require("../utils/constant");

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
    const data = await mongoService.createOne(modelName.EDGE, payload);
    return data;
  } catch (error) {
    return error;
  }
};

const update_Edge = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.EDGE, query, payload);
  } catch (error) {
    return error;
  }
};

const single_Edge = async (query) => {
  try {
    return await mongoService.findOne(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

const get_all_edges = async (query) => {
  try {
    return await mongoService.findAll(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

// delete permanently
const remove_Edge = async (query) => {
  try {
    return await mongoService.deleteDocument(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

// delete permanently
const remove_multiple_Edge = async (query) => {
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

const update_edge_and_node = async (edgeId, newSourceId, newTargetId) => {
  try {
    // Find the edge to update
    const edge = await mongoService.findOne(modelName.EDGE, { _id: edgeId });
    if (!edge) throw new Error("Edge not found");

    const { source: oldSourceId, target: oldTargetId } = edge;

    // Update the edge with new source and target
    edge.source = newSourceId || oldSourceId;
    edge.target = newTargetId || oldTargetId;
    await edge.save();

    // Find all connected nodes
    const affectedNodes = await findConnectedNodes([
      oldSourceId,
      oldTargetId,
      newSourceId,
      newTargetId,
    ]);

    // Update indexes of only the connected nodes
    for (let nodeId of affectedNodes) {
      const incomingEdges = await Edge.find({ target: nodeId });
      const node = await Node.findById(nodeId);
      node.index = incomingEdges.length; // Update index based on connected edges
      await node.save();
    }

    return { success: true, message: "Edge and node indexes updated" };
  } catch (error) {
    console.error("Error updating edge and node indexes:", error);
    return { success: false, error: error.message };
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
    let data = await mongoService.aggregation(modelName.INTERACTION, pipeline);

    if (data?.length && data?.[0]?.nodes?.length) {
      await Promise.all(
        data?.[0]?.nodes?.map(async (val) => {
          val.allowedToEditAnswerType = true;
          const answerData = await mongoService.findOne(modelName.NODE_ANSWER, {
            "answers.node_id": val._id,
            is_deleted: false,
          });
          if (answerData) {
            val.allowedToEditAnswerType = false;
          }
        })
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
};

const getTargetNodeByIndex = async (selectedIndex, selectedNodeId) => {
  try {
    const edges = await find_all_edges({ source: selectedNodeId });

    // Fetch all target nodes connected by these edges
    const targetNodes = await Promise.all(
      edges.map((edge) => {
        return get_single_node({
          _id: edge.target,
          type: "Question",
          is_deleted: false,
        });
      })
    );
    // Filter out null nodes (if any) and sort by `index`
    const validTargetNodes = targetNodes
      .filter((node) => node)
      .sort((a, b) => a.index - b.index);

    console.log("validTargetNodes", validTargetNodes);
    if (!!validTargetNodes.length) {
      const nextTargetNode = validTargetNodes.find(
        (node) => node.index > selectedIndex
      );
      return nextTargetNode?._id;
    }

    const defaultNode = await get_single_node({
      index: selectedIndex + 1,
      type: "Question",
      is_deleted: false,
    });

    return defaultNode._id;
  } catch (error) {
    console.error("Error in getTargetNodeByIndex:", error.message);
    throw error;
  }
};

const getLogicNodesList = async (interactionId, selectedNodeId) => {
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
            {
              $match: {
                is_deleted: false,
                _id: { $ne: new mongoose.Types.ObjectId(selectedNodeId) },
                $and: [
                  { type: { $ne: "Redirect" } },
                  { type: { $ne: "Start" } },
                ],
              },
            },
            { $sort: { index: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "nodes",
          localField: "_id",
          foreignField: "interaction_id",
          as: "selectedNode",
          pipeline: [
            {
              $match: {
                is_deleted: false,
                _id: new mongoose.Types.ObjectId(selectedNodeId),
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$selectedNode",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          nodes: 1,
          selectedNode: "$selectedNode.answer_format",
          selectedNodeType: "$selectedNode.answer_type",
          selectedNodeIndex: "$selectedNode.index",
        },
      },
    ];
    let data = await mongoService.aggregation(modelName.INTERACTION, pipeline);

    if (data?.length && data?.[0]?.nodes?.length) {
      await Promise.all(
        data?.[0]?.nodes?.map(async (val) => {
          val.allowedToEditAnswerType = true;
          const answerData = await mongoService.findOne(modelName.NODE_ANSWER, {
            "answers.node_id": val._id,
            is_deleted: false,
          });
          if (answerData) {
            val.allowedToEditAnswerType = false;
          }
        })
      );
    }

    let targetNode;
    if (
      [answerType.MultipleChoice, answerType.NPS].includes(
        data?.[0]?.selectedNodeType
      )
    ) {
      targetNode = await getTargetNodeByIndex(
        data[0]?.selectedNodeIndex,
        selectedNodeId
      );
    } else {
      let data = await mongoService.findOne(modelName.EDGE, {
        source: selectedNodeId,
      });
      targetNode = data?.target;
    }

    return {
      nodeList: data[0]?.nodes,
      targetNodeId: targetNode,
      selectedNode: data[0]?.selectedNode,
    };
  } catch (error) {
    throw error;
  }
};

const getTargetNodeId = async (interactionId, selectedNodeId) => {
  try {
    const node = await get_single_node({
      _id: selectedNodeId,
      interaction_id: interactionId,
      is_deleted: false,
    });
    let targetNodeData;
    if (
      [answerType.MultipleChoice, answerType.NPS].includes(node?.answer_type)
    ) {
      const targetNode = await getTargetNodeByIndex(
        node?.index,
        selectedNodeId
      );
      targetNodeData = await get_single_node({ _id: targetNode });
    } else {
      let data = await mongoService.findOne(modelName.EDGE, {
        source: selectedNodeId,
      });
      if (data?.target) {
        targetNodeData = await get_single_node({ _id: data?.target });
      }
      if (!targetNodeData || targetNodeData.type === "Redirect") {
        targetNodeData = await get_single_node({
          index: node.index + 1,
          interaction_id: interactionId,
          is_deleted: false,
        });
      }
    }
    return targetNodeData;
  } catch (error) {
    throw error;
  }
};

const addLibrary = async (payload) => {
  try {
    return mongoService.createOne(modelName.LIBRARY, payload);
  } catch (error) {
    return error;
  }
};

const getLibrary = async (query, project) => {
  try {
    return mongoService.findAll(modelName.LIBRARY, query, project);
  } catch (error) {
    return error;
  }
};

const editLibrary = async (query, payload) => {
  try {
    return mongoService.updateOne(modelName.LIBRARY, query, payload);
  } catch (error) {
    return error;
  }
};

const deleteLibrary = async (query) => {
  try {
    return mongoService.deleteDocument(modelName.LIBRARY, query);
  } catch (error) {
    return error;
  }
};

const getNodeLibrary = async (query, search) => {
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

const find_all_edges = async (query) => {
  try {
    return mongoService.findAll(modelName.EDGE, query);
  } catch (error) {
    return error;
  }
};

const find_all_with_node = async (query) => {
  try {
    let pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "nodes",
          localField: "source",
          foreignField: "_id",
          as: "source",
        },
      },
      {
        $lookup: {
          from: "nodes",
          localField: "target",
          foreignField: "_id",
          as: "target",
        },
      },
      {
        $unwind: {
          path: "$source",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$target",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    return mongoService.aggregation(modelName.EDGE, pipeline);
  } catch (error) {
    return error;
  }
};

const add_many_edge = async (payload) => {
  try {
    return mongoService.createMany(modelName.EDGE, payload);
  } catch (error) {
    return error;
  }
};

const delete_edge = async (payload) => {
  try {
    return mongoService.deleteManyDocument(modelName.EDGE, payload);
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
    ];
    return await mongoService.aggregation(modelName.NODE_ANSWER, pipeline);
  } catch (error) {
    return error;
  }
};

const node_wise_answer = async (match) => {
  try {
    let pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(match.interactionId),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "nodes",
          localField: "_id",
          foreignField: "interaction_id",
          as: "nodeDetails",
          pipeline: [
            { $match: { type: "Question" } },
            {
              $project: {
                video_thumbnail: 1,
                title: 1,
                video_url: 1,
                index: 1,
                answer_format: 1,
                createdAt: 1,
              },
            },
            { $sort: { index: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "node_answers",
          localField: "_id",
          foreignField: "interaction_id",
          as: "answerDetails",
          pipeline: [
            {
              $match: { is_deleted: false },
            },
            {
              $lookup: {
                from: "contacts",
                localField: "contact_id",
                foreignField: "_id",
                as: "contactDetails",
                pipeline: [
                  {
                    $project: {
                      contact_uuid: 1,
                      contact_name: 1,
                      contact_email: 1,
                      product_name: 1,
                      is_favorite: 1,
                      createdAt: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$contactDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                answers: 1,
                contactDetails: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          organization_id: 1,
          interaction_type: 1,
          title: 1,
          is_collect_contact: 1,
          contact_details: 1,
          nodeDetails: 1,
          answerDetails: 1,
        },
      },
    ];
    let result = await mongoService.aggregation(
      modelName.INTERACTION,
      pipeline
    );

    if (result.length > 0) {
      const interactionData = result[0];
      if (
        interactionData?.nodeDetails?.length &&
        interactionData?.answerDetails?.length
      ) {
        const { nodeDetails, answerDetails } = interactionData;

        // Group answers by node
        const groupedData = nodeDetails.map((node) => {
          const answersForNode = answerDetails.flatMap((detail) =>
            detail.answers
              .filter(
                (answer) =>
                  answer?.node_id?.toString() === node?._id?.toString()
              )
              .map((answer) => ({
                ...answer,
                contactDetails: detail.contactDetails,
              }))
          );

          return {
            ...node,
            answers: answersForNode,
          };
        });

        if (nodeDetails?.length) {
          const nodesWithThumbnails = nodeDetails.filter(
            (node) => node?.video_thumbnail
          );
          interactionData.thumbnailUrl = nodesWithThumbnails?.length
            ? nodesWithThumbnails?.[0]?.video_thumbnail
            : "";
        } else {
          interactionData.thumbnailUrl = "";
        }

        // Replace or append grouped data in the response
        interactionData.groupedNodeAnswers = groupedData;

        delete interactionData.nodeDetails;
        delete interactionData.answerDetails;
      }

      return interactionData;
    }

    return result;
  } catch (error) {
    return error;
  }
};

const get_all_interaction = async (org_id, options = {}) => {
  try {
    let query = {
      is_deleted: false,
      organization_id: new mongoose.Types.ObjectId(org_id),
    };
    return mongoService.findAll(modelName.INTERACTION, query, {}, options);
  } catch (error) {
    return error;
  }
};

const get_all_interaction_answer = async (
  interactionArray,
  startDate,
  endDate,
  tag,
  organization_id
) => {
  try {
    let pipeline = [
      {
        $match: {
          interaction_id: {
            $in: interactionArray.map(
              (obj) => new mongoose.Types.ObjectId(obj._id)
            ),
          },
          ...(tag !== "all"
            ? {
                createdAt: {
                  $gte: startDate,
                  $lte: endDate,
                },
              }
            : {}),
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
              $match: {
                organization_id: new mongoose.Types.ObjectId(organization_id),
              },
            },
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
      // { $match: { contact_details: { $gt: [] } } },
      {
        $unwind: {
          path: "$contact_details",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    return await mongoService.aggregation(modelName.NODE_ANSWER, pipeline);
  } catch (error) {
    return error;
  }
};

const get_all_answer = async (interactions, query) => {
  try {
    let pipeline = [
      {
        $match: {
          interaction_id: {
            $in: interactions.map(
              (obj) => new mongoose.Types.ObjectId(obj._id)
            ),
          },
          ...query,
          is_deleted: false,
        },
      },
    ];
    return await mongoService.aggregation(modelName.NODE_ANSWER, pipeline);
  } catch (error) {
    return error;
  }
};

const get_all_contact = async (query) => {
  try {
    return await mongoService.findAll(modelName.CONTACT, query);
  } catch (error) {
    return error;
  }
};

const get_dashboard_recent_interaction = async (
  organization_id,
  searchText,
  skip,
  limit,
  startDate,
  endDate
) => {
  try {
    let matchQuery = {
      organization_id: new mongoose.Types.ObjectId(organization_id),
      is_deleted: false,
      title: { $regex: searchText || "", $options: "i" },
    };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)),
      };
    }

    // if (startDate) {
    //   matchQuery.createdAt = { $gte: new Date(startDate) };
    // }

    // if (endDate) {
    //   matchQuery.createdAt = {
    //     $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)),
    //   };
    // }

    const pipeline = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "node_answers",
          localField: "_id",
          foreignField: "interaction_id",
          as: "landed",
        },
      },
      {
        $lookup: {
          from: "nodes",
          let: { interactionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$interaction_id", "$$interactionId"],
                    },
                    { $eq: ["$type", "Question"] },
                  ],
                },
              },
            },
          ],
          as: "nodes",
        },
      },
      {
        $addFields: {
          landedCount: { $size: "$landed" },
          interactionCount: { $size: "$nodes" },
          contactCount: {
            $size: {
              $filter: {
                input: "$landed",
                as: "item",
                cond: {
                  $ifNull: ["$$item.contact_id", false],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          landed: 0,
          nodes: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          Records: [{ $skip: skip || 0 }, { $limit: limit || 5 }],
        },
      },
      {
        $addFields: {
          totalRecords: {
            $arrayElemAt: ["$metadata.total", 0],
          },
        },
      },
      {
        $project: {
          metadata: 0,
        },
      },
    ];

    return await mongoService.aggregation(modelName.INTERACTION, pipeline);
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
  addLibrary,
  getLibrary,
  getNodeLibrary,
  editLibrary,
  deleteLibrary,
  find_Edge,
  remove_Edge,
  remove_Node,
  remove_interaction,
  add_answer,
  update_answer,
  get_answer,
  get_interaction_answer,
  node_wise_answer,
  get_all_interaction,
  get_all_interaction_answer,
  get_all_answer,
  get_all_contact,
  get_dashboard_recent_interaction,
  getLogicNodesList,
  update_edge_and_node,
  find_all_edges,
  add_many_edge,
  delete_edge,
  getTargetNodeId,
  find_all_with_node,
  get_all_edges,
  single_Edge,
};
