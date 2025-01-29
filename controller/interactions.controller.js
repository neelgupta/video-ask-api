const { default: mongoose } = require("mongoose");
const {
  response400,
  response201,
  response200,
} = require("../lib/response-messages");
const {
  uploadVideoToCloudinary,
  copyVideoInCloudinary,
} = require("../lib/uploader/upload");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  organization_services,
  interactions_services,
  contact_services,
} = require("../service");
const {
  msg,
  CloudFolder,
  nodeType,
  answerType,
  openEndedType,
  generateUUID,
  getDateRangeForFilter,
} = require("../utils/constant");

const addFolder = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id } = req.body;
  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  req.body.added_by = Id;

  const data = await interactions_services.add_folder(req.body);

  return response201(res, msg.folderAdded, data);
});

const getFolderList = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const data = await interactions_services.get_folder_list(
    { organization_id, is_deleted: false },
    { __v: 0, updatedAt: 0 }
  );

  if (data?.length) {
    await Promise.all(
      data.map(async (val) => {
        const interactionCounts =
          await interactions_services.get_interaction_counts({
            organization_id,
            folder_id: val._id,
            is_deleted: false,
          });

        val.count = interactionCounts;
      })
    );
  }

  return response200(res, msg.fetch_success, data);
});

const updateFolder = catchAsyncError(async (req, res) => {
  const { folder_id } = req.body;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  await interactions_services.update_folder({ _id: folder_id }, req.body);

  return response200(res, msg.update_success, []);
});

const deleteFolder = catchAsyncError(async (req, res) => {
  const { folder_id } = req.params;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  await interactions_services.update_folder(
    { _id: folder_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

const createInteraction = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id, folder_id, flows } = req.body;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    organization_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  req.body.added_by = Id;
  req.body.language = organizationData?.language;
  req.body.font = organizationData?.font;
  req.body.primary_color = organizationData?.primary_color;
  req.body.secondary_color = organizationData?.secondary_color;
  req.body.background_color = organizationData?.background_color;
  req.body.border_radius = organizationData?.border_radius;

  const interactionData = await interactions_services.add_new_interaction(
    req.body
  );

  if (flows?.length) {
    let targetId;
    let sourceId;
    await Promise.all(
      flows.map(async (val) => {
        if (val.type === nodeType.Start) {
          const nodeData = await interactions_services.add_Node({
            interaction_id: interactionData._id,
            type: val.type,
            position: val.position,
            title: val.title,
            added_by: Id,
            answer_format: val.answer_format || {},
            index: 0,
          });
          sourceId = nodeData._id;
          // targetId = nodeData._id;
        }

        if (val.type === nodeType.End) {
          const nodeData = await interactions_services.add_Node({
            interaction_id: interactionData._id,
            type: val.type,
            position: val.position,
            title: val.title,
            added_by: Id,
            answer_format: val.answer_format || {},
            index: 1,
          });
          // sourceId = nodeData._id;
          targetId = nodeData._id;
        }
      })
    );

    if (targetId && sourceId) {
      await interactions_services.add_Edge({
        interaction_id: interactionData._id,
        source: sourceId,
        target: targetId,
        added_by: Id,
      });
    }
  }

  return response201(res, msg.interactionAdded, interactionData);
});

const getInteractionList = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { folder_id } = req.params;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  const data = await interactions_services.get_all_interactions(
    { folder_id, is_deleted: false },
    { updatedAt: 0, __v: 0 }
  );

  if (data?.length) {
    await Promise.all(
      data.map(async (val) => {
        const getNodes = await interactions_services.get_flow_list({
          interaction_id: val._id,
          is_deleted: false,
        });
        if (getNodes?.length) {
          const nodesWithThumbnails = getNodes.filter(
            (node) => node.video_thumbnail
          );
          val.thumbnailUrl = nodesWithThumbnails?.length
            ? nodesWithThumbnails[0].video_thumbnail
            : "";
        } else {
          val.thumbnailUrl = "";
        }
      })
    );
  }
  return response200(res, msg.fetch_success, data);
});

const updateInteraction = catchAsyncError(async (req, res) => {
  const { folder_id, interaction_id } = req.body;

  if (folder_id) {
    const folderData = await interactions_services.get_single_folder({
      _id: folder_id,
      is_deleted: false,
    });
    if (!folderData) return response400(res, msg.folderIsNotExists);
  }

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    // is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  await interactions_services.update_interaction(
    { _id: interaction_id },
    req.body
  );

  return response200(res, msg.update_success, []);
});

const deleteInteraction = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  await interactions_services.update_interaction(
    { _id: interaction_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

const createNode = catchAsyncError(async (req, res) => {
  const Id = req.user;
  //  added_by, flow_type, video_thumbnail, video_url, video_align, overlay_text, text_size, fade_reveal
  const { interaction_id, sourceId, targetId, positionX, positionY } = req.body;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const sourceData = await interactions_services.get_single_node({
    _id: sourceId,
  });
  if (!sourceData) return response400(res, msg.sourceNotFound);

  const targetData = await interactions_services.get_single_node({
    _id: targetId,
  });
  if (!targetData) return response400(res, msg.targetNotFound);

  const folderData = await interactions_services.get_single_folder({
    _id: interactionData.folder_id,
    is_deleted: false,
  });

  req.body.added_by = Id;
  req.body.answer_type = answerType.OpenEnded;
  req.body.answer_format = {
    options: ["Audio", "Video", "Text"],
    time_limit: "10",
    delay: "0",
    contact_form: false,
  };
  req.body.position = {
    x: positionX,
    y: positionY,
  };

  if (req.file) {
    const uploadedFile = await uploadVideoToCloudinary(
      req.file,
      `${CloudFolder}/${Id}/${folderData?.folder_name}/${interaction_id}`
    );
    req.body.video_thumbnail = uploadedFile.thumbnailUrl;
    req.body.video_url = uploadedFile.videoUrl;
    req.body.video_size = uploadedFile?.fileSize;

    await organization_services.update_organization(
      { _id: interactionData.organization_id },
      { $inc: { storage_occupied: uploadedFile?.fileSize } }
    );
  }

  // Get all nodes for the interaction and sort by index
  const nodes = await interactions_services.get_flow_list({ interaction_id });
  nodes.sort((a, b) => a.index - b.index);

  // Find the insertion point (source node index + 1)
  const sourceIndex = sourceData.index;
  const newNodeIndex = sourceIndex + 1;

  // Increment indices of subsequent nodes
  const updatedNodes = nodes?.map((node) => {
    if (node.index >= newNodeIndex) {
      node.index += 1;
    }
    return node;
  });

  // Update the indices in the database
  await Promise.all(
    updatedNodes?.map((node) =>
      interactions_services.update_Node(
        { _id: node._id },
        { index: node.index }
      )
    )
  );

  req.body.index = newNodeIndex;
  let newNode = await interactions_services.add_Node(req.body);
  if (newNode) {
    const updateSource = await interactions_services.update_Edge(
      { source: sourceId, target: targetId },
      { source: newNode._id }
    );

    const newEdge = await interactions_services.add_Edge({
      interaction_id: interaction_id,
      source: sourceId,
      target: newNode._id,
      added_by: Id,
    });
  }
  // if (newNode) {
  //   const newEdge = await interactions_services.add_Edge({
  //     interaction_id: interaction_id,
  //     source: sourceId,
  //     target: targetId,
  //     added_by: Id,
  //   });
  //   const updateSource = await interactions_services.update_Edge(
  //     { source: sourceId },
  //     { target: newNode._id }
  //   );
  //   const updateTarget = await interactions_services.update_Edge(
  //     { target: targetId },
  //     { source: newNode._id }
  //   );
  // }
  return response201(res, msg.flowCreated, newNode);
});

const getNodes = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  const interactionData = await interactions_services.getNodesList(
    interaction_id
  );
  if (!interactionData?.length)
    return response400(res, msg.interactionIsNotExists);

  return response200(res, msg.fetch_success, interactionData?.[0] || {});
});

const getLogicNode = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;
  const { selectedNodeId } = req.query;

  const interactionData = await interactions_services.getLogicNodesList(
    interaction_id,
    selectedNodeId
  );
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  return response200(res, msg.fetch_success, interactionData || []);
});

const updateCordinates = catchAsyncError(async (req, res) => {
  const { nodes } = req.body;

  if (nodes?.length) {
    for (const val of nodes) {
      const nodeData = await interactions_services.get_single_node({
        _id: val.node_id,
        is_deleted: false,
      });
      if (!nodeData) {
        return response400(res, msg.nodeNotExists);
      }
      await interactions_services.update_Node({ _id: val.node_id }, val);
    }
  }

  return response200(res, msg.update_success, []);
});

// async function updateIndexes(affectedNodeIds) {
//   const visited = new Set();
//   const queue = [...affectedNodeIds];

//   while (queue.length > 0) {
//     const currentNodeId = queue.shift();
//     if (visited.has(currentNodeId)) continue;

//     visited.add(currentNodeId);

//     // Find all edges connected to the current node
//     const connectedEdges = await interactions_services.find_all_edges({
//       $or: [{ source: currentNodeId }, { target: currentNodeId }],
//     });
//     console.log("🚀 ~ updateIndexes ~ connectedEdges:", connectedEdges)

//     for (const edge of connectedEdges) {
//       const connectedNodeId = edge.source === currentNodeId ? edge.target : edge.source;
//       if (!visited.has(connectedNodeId)) queue.push(connectedNodeId);
//     }

//     // Update the index for the current node
//     const incomingEdges = await interactions_services.find_Edge({ target: currentNodeId });
//     console.log("🚀 ~ updateIndexes ~ incomingEdges:", incomingEdges)
//     const updatedIndex = incomingEdges?.length; // Number of incoming edges
//     await interactions_services.update_Node({ _id: currentNodeId }, { index: updatedIndex });
//   }
// }

// const updateIndexes = async (interactionId) => {
//   // Fetch all nodes and edges for the interaction
//   const nodes = await interactions_services.get_nodes({ interaction_id: interactionId, is_deleted: false });
//   const edges = await interactions_services.get_edges({ interaction_id: interactionId, is_deleted: false });

//   // Create a graph from the edges
//   const adjacencyList = {};
//   nodes.forEach(node => adjacencyList[node._id.toString()] = []);
//   edges.forEach(edge => {
//     adjacencyList[edge.source.toString()].push(edge.target.toString());
//   });

//   console.log("🚀 ~ updateIndexes ~ adjacencyList:", adjacencyList)

//   // Find the root node (no incoming edges)
//   const incomingEdges = {};
//   edges.forEach(edge => {
//     incomingEdges[edge.target.toString()] = true;
//   });
//   console.log("🚀 ~ updateIndexes ~ incomingEdges:", incomingEdges)
//   const rootNode = nodes.find(node => !incomingEdges[node._id.toString()]);

//   if (!rootNode) throw new Error("Root node not found");

//   // Perform BFS to calculate indexes
//   const queue = [{ nodeId: rootNode._id.toString(), index: 1 }];
//   const nodeIndexes = {};
//   while (queue.length > 0) {
//     const { nodeId, index } = queue.shift();
//     nodeIndexes[nodeId] = index;

//     adjacencyList[nodeId].forEach((childId, idx) => {
//       queue.push({ nodeId: childId, index: index + idx + 1 });
//     });
//   }

//   // Update the indexes in the database
//   const updatePromises = Object.keys(nodeIndexes).map(nodeId =>
//     interactions_services.update_Node({ _id: nodeId }, { index: nodeIndexes[nodeId] })
//   );
//   await Promise.all(updatePromises);
// };

const updateIndexes = async (sourceId, selectedTargetNode, interaction_id) => {
  const nodes = await interactions_services.get_flow_list({
    interaction_id,
    type: "Question",
  });
  nodes.sort((a, b) => a.index - b.index);

  const targetNode = await interactions_services.get_single_node({
    _id: selectedTargetNode,
    is_deleted: false,
  });

  const sourceNode = await interactions_services.get_single_node({
    _id: sourceId,
    is_deleted: false,
  });

  const filterNode = nodes.reduce(
    (acc, val) => {
      if (val.type === "End") {
        acc.endNode = val;
        return acc;
      }
      if (val.index <= sourceNode.index) {
        acc.static = [...acc.static, val];
        return acc;
      }
      if (val.index >= targetNode.index) {
        acc.change = [...acc.change, val];
        return acc;
      }
      acc.last = [...acc.last, val];
      return acc;
    },
    { static: [], last: [], change: [], endNode: {} }
  );

  let newNodes = [];
  if (filterNode?.change?.length > 0) {
    const newChange = filterNode.change.map((ele, index) => {
      return {
        ...ele,
        index: sourceNode.index + index + 1,
      };
    });
    const newLast = filterNode?.last?.map((ele, index) => {
      return {
        ...ele,
        index: sourceNode.index + newChange.length + index + 1,
      };
    });
    newNodes = [...newNodes, ...newChange, ...newLast];
  }
  if (newNodes?.length) {
    await Promise.all(
      newNodes.map(async (val) => {
        await interactions_services.update_Node(
          { _id: val?._id },
          { index: val.index }
        );
      })
    );
  }
  return;
};

const manageMultiChoiceEdge = async (
  selectedNodeId,
  targets,
  interactionId,
  userId
) => {
  try {
    const existingEdges = await interactions_services.find_all_edges({
      source: selectedNodeId,
    });
    const existingTargets = existingEdges?.map((edge) =>
      edge.target.toString()
    );

    // Extract new targets from request
    const newTargets = targets.map((t) => t.targetedNodeId);

    let targetsToAdd = [];
    let newTargetIds = [];
    targets.map((t) => {
      if (
        !existingTargets?.includes(t.targetedNodeId) &&
        !newTargetIds.includes(t.targetedNodeId.toString())
      ) {
        targetsToAdd.push({
          source: selectedNodeId,
          target: t.targetedNodeId,
          interaction_id: interactionId,
          added_by: userId,
        });
        newTargetIds.push(t.targetedNodeId.toString());
      }
      return;
    });
    if (targetsToAdd?.length)
      await interactions_services.add_many_edge(targetsToAdd);

    let targetsToDelete = [];
    existingEdges?.map((edge) => {
      if (!newTargets.includes(edge.target.toString())) {
        targetsToDelete.push(edge._id);
      }
      return;
    });

    if (targetsToDelete?.length)
      await interactions_services.delete_edge({
        _id: { $in: targetsToDelete },
      });
  } catch (error) {
    console.log("🚀 ~ manageMultiChoiceEdge ~ error:", error);
    return error;
  }
};

const updateIndexesForMultiple = async (sourceId, targets, interaction_id) => {
  try {
    const nodes = await interactions_services.get_flow_list({
      interaction_id,
      type: "Question",
    });

    const sourceNode = await interactions_services.get_single_node({
      _id: sourceId,
      is_deleted: false,
    });

    const targetedIdArrays = targets.map((ele) => ele.targetedNodeId);

    nodes.sort((a, b) => a.index - b.index);
    const maxIndex = nodes.length;

    const { first, targeted, lastNode } = nodes.reduce(
      (acc, val) => {
        if (sourceNode.index >= val.index) {
          acc.first = [...acc.first, val];
          return acc;
        }
        if (targetedIdArrays.includes(val._id.toString())) {
          acc.targeted = [...acc.targeted, val];
          return acc;
        }
        acc.lastNode = [...acc.lastNode, val];
        return acc;
      },
      { first: [], targeted: [], lastNode: [] }
    );

    const newNodes = [
      ...first,
      ...targeted.map((node, idx) => ({
        ...node,
        index: sourceNode.index + 1 + idx,
      })),
      ...lastNode.map((node, idx) => ({
        ...node,
        index: sourceNode.index + 1 + targeted.length + idx,
      })),
    ];

    const isValid = newNodes.every((ele) => ele.index < maxIndex + 1);

    if (newNodes?.length && isValid) {
      await Promise.all(
        newNodes.map(async (val) => {
          await interactions_services.update_Node(
            { _id: val?._id },
            { index: val.index }
          );
        })
      );
    }
    return;
  } catch (error) {
    console.log("error", error);
  }
};

const disableIntermediateNodes = async (
  interactionId,
  startNodeId,
  endNodeId
) => {
  // Fetch all nodes and edges in the interaction
  const allNodes = await interactions_services.get_flow_list({
    interaction_id: interactionId,
    is_deleted: false,
  });

  const allEdges = await interactions_services.get_all_edges({
    interaction_id: interactionId,
    is_deleted: false,
  });

  if (allNodes?.length && allEdges?.length) {
    // Build a graph representation
    const graph = {};
    allNodes.forEach((node) => {
      graph[node._id.toString()] = [];
    });

    allEdges.forEach((edge) => {
      if (!edge.is_deleted) {
        const source = edge.source.toString();
        const target = edge.target.toString();
        if (graph[source]) {
          graph[source].push(target);
        }
      }
    });

    // Function to check if a node is connected to the end node
    const isConnectedToEndNode = (nodeId, visited = new Set()) => {
      if (nodeId === endNodeId) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);

      const neighbors = graph[nodeId] || [];
      for (const neighbor of neighbors) {
        if (isConnectedToEndNode(neighbor, visited)) {
          return true;
        }
      }
      return false;
    };

    // Identify and update nodes
    const updatePromises = allNodes.map((node) => {
      const nodeId = node._id.toString();
      const shouldDisable =
        nodeId !== startNodeId &&
        nodeId !== endNodeId &&
        !isConnectedToEndNode(nodeId);
      return interactions_services.update_Node(
        { _id: node._id },
        { is_disabled: shouldDisable }
      );
    });

    // await Promise.all(updatePromises);
  }
};

const handelRedirectEdge = async (nodeData, targets, interactionId, userId) => {
  try {
    const uniqueTargets = [
      ...new Map(targets.map((t) => [t.redirection_url, t])).values(),
    ];

    const existingRedirectNodes = await interactions_services.get_flow_list({
      type: "Redirect",
      interaction_id: interactionId,
      is_deleted: false,
    });

    const newTargetUrlWithId = await Promise.all(
      uniqueTargets.map(async (target) => {
        if (!target?.redirection_url) return null;

        const existingNode = existingRedirectNodes.find(
          (node) => node.redirection_url === target.redirection_url
        );

        if (existingNode) {
          return { ...target, _id: existingNode._id.toString() };
        }

        const newRedirectNode = await interactions_services.add_Node({
          interaction_id: interactionId,
          type: "Redirect",
          position: {
            x: nodeData?.position?.x + Math.random() * 200 + 200,
            y:
              nodeData?.position?.y +
              (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 200 + 200),
          },
          redirection_url: target.redirection_url,
          title: "Redirect",
          added_by: userId,
          answer_format: {},
        });

        return { ...target, _id: newRedirectNode?._id?.toString() };
      })
    );

    const uniqueData = [
      ...new Map(
        newTargetUrlWithId.filter(Boolean).map((t) => [t._id, t])
      ).values(),
    ];

    await Promise.all(
      uniqueData.map((target) =>
        interactions_services.add_Edge({
          interaction_id: interactionId,
          source: nodeData._id,
          target: target._id,
          added_by: userId,
        })
      )
    );
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
};

const handelEmptyRedirectNode = async (interactionId) => {
  const existingRedirectNode = await interactions_services.get_flow_list({
    type: "Redirect",
    interaction_id: interactionId,
    is_deleted: false,
  });
  await Promise.all(
    existingRedirectNode.map(async (redirect) => {
      const existingEdges = await interactions_services.find_all_edges({
        target: redirect._id,
        interaction_id: interactionId,
        is_deleted: false,
      });
      if (existingEdges.length === 0) {
        await interactions_services.remove_Node({ _id: redirect._id });
      }
    })
  );
};

const updateEdges = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const {
    selectedNodeId,
    interactionId,
    newTargetId,
    targets,
    redirection_url,
  } = req.body;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interactionId,
    is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const nodeData = await interactions_services.get_single_node({
    _id: selectedNodeId,
    is_deleted: false,
  });
  if (!nodeData) return response400(res, msg.nodeNotExists);

  if (
    [answerType.MultipleChoice, answerType.NPS].includes(nodeData?.answer_type)
  ) {
    const targetedToNode = targets.filter(
      (target) => target?.targetedNodeId !== null
    );
    const targetedToRedirect = targets.filter(
      (target) => target?.redirection_url !== null
    );

    await manageMultiChoiceEdge(
      selectedNodeId,
      targetedToNode,
      interactionId,
      Id
    );

    await handelRedirectEdge(nodeData, targetedToRedirect, interactionId, Id);

    // Update `choices` in the node
    const choices =
      nodeData?.answer_type === "nps"
        ? nodeData.answer_format.nps_choices
        : nodeData.answer_format.choices;

    const updatedChoices = (choices || []).map((choice) => {
      const updatedTarget = targets?.find((t) => t.index === choice.index);
      if (updatedTarget) {
        return {
          ...choice,
          targetedNodeId: updatedTarget.targetedNodeId,
          redirection_url: updatedTarget.redirection_url,
        };
      }
      return choice;
    });

    // Save the updated node
    await interactions_services.update_Node(
      { _id: selectedNodeId },
      {
        ...(nodeData?.answer_type === "nps"
          ? { "answer_format.nps_choices": updatedChoices }
          : { "answer_format.choices": updatedChoices }),
      }
    );

    await updateIndexesForMultiple(
      selectedNodeId,
      targetedToNode,
      interactionId
    );
  } else {
    const selectedNodeIndex = nodeData?.index;
    if (redirection_url) {
      const redirectUrlAlreadyExists =
        await interactions_services.get_single_node({
          interaction_id: interactionData._id,
          type: "Redirect",
          redirection_url,
          is_deleted: false,
        });

      if (redirectUrlAlreadyExists) {
        await interactions_services.update_Node(
          { _id: selectedNodeId },
          {
            redirection_url: redirection_url,
          }
        );

        await interactions_services.add_Edge({
          interaction_id: interactionData._id,
          source: selectedNodeId,
          target: redirectUrlAlreadyExists._id,
          added_by: Id,
        });

        const parentEdgeData = await interactions_services.single_Edge({
          source: selectedNodeId,
        });

        await interactions_services.remove_Edge({ _id: parentEdgeData._id });
      } else {
        const newNode = await interactions_services.add_Node({
          interaction_id: interactionData._id,
          type: "Redirect",
          position: {
            x:
              nodeData?.position?.x +
              (Math.floor(Math.random() * (400 - 200 + 1)) + 200),
            y:
              nodeData?.position?.y +
              (Math.random() < 0.5 ? 1 : -1) *
                (Math.floor(Math.random() * (400 - 200 + 1)) + 200),
          },
          title: "untitled",
          redirection_url: redirection_url,
          added_by: Id,
          answer_format: {},
        });

        await interactions_services.update_Node(
          { _id: selectedNodeId },
          {
            redirection_url: redirection_url,
          }
        );

        await interactions_services.add_Edge({
          interaction_id: interactionData._id,
          source: selectedNodeId,
          target: newNode._id,
          added_by: Id,
        });

        const parentEdgeData = await interactions_services.single_Edge({
          source: selectedNodeId,
        });

        await interactions_services.remove_Edge({ _id: parentEdgeData._id });
      }
    } else {
      const findSourceEdge = await interactions_services.single_Edge({
        source: selectedNodeId,
      });

      const findRedirectEdge = await interactions_services.get_all_edges({
        target: findSourceEdge.target,
      });

      if (findRedirectEdge?.length === 1) {
        await interactions_services.update_Node(
          {
            interaction_id: interactionId,
            _id: findRedirectEdge?.[0]?.target,
            type: "Redirect",
          },
          { is_deleted: true }
        );
      }

      await interactions_services.update_Node(
        { _id: selectedNodeId },
        { redirection_url: "" }
      );

      await interactions_services.update_Edge(
        { source: selectedNodeId },
        { target: newTargetId }
      );
      await updateIndexes(selectedNodeId, newTargetId, interactionId);
    }
    // await disableIntermediateNodes(interactionId, selectedNodeId, newTargetId,selectedNodeIndex);
  }
  await handelEmptyRedirectNode(interactionId);

  return response200(res, msg.update_success, []);
});

const changeNodeEdge = catchAsyncError(async (req, res) => {
  const { selectedNodeId, interactionId, newTargetId } = req.body;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interactionId,
    is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const nodeData = await interactions_services.get_single_node({
    _id: selectedNodeId,
    is_deleted: false,
  });
  if (!nodeData) return response400(res, msg.nodeNotExists);

  const targetNode = await interactions_services.get_single_node({
    _id: newTargetId,
    is_deleted: false,
  });
  if (!targetNode) return response400(res, msg.targetNodeNotExists);

  const edgeData = await interactions_services.find_Edge({
    target: targetNode._id,
  });

  return response200(res, msg.fetch_success, []);
});

const updateNode = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { node_id } = req.body;

  const nodeData = await interactions_services.get_single_node({
    _id: node_id,
    is_deleted: false,
  });
  if (!nodeData) return response400(res, msg.nodeNotExists);

  const interactionData = await interactions_services.get_single_interaction({
    _id: nodeData?.interaction_id,
    is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const folderData = await interactions_services.get_single_folder({
    _id: interactionData.folder_id,
    is_deleted: false,
  });

  if (req.file) {
    const uploadedFile = await uploadVideoToCloudinary(
      req.file,
      `${CloudFolder}/${Id}/${folderData.folder_name}`
    );
    req.body.video_thumbnail = uploadedFile.thumbnailUrl;
    req.body.video_url = uploadedFile.videoUrl;
    req.body.video_size = uploadedFile?.fileSize;

    if (nodeData?.video_size) {
      await organization_services.update_organization(
        { _id: interactionData.organization_id },
        { $inc: { storage_occupied: -nodeData?.video_size } }
      );

      await organization_services.update_organization(
        { _id: interactionData.organization_id },
        { $inc: { storage_occupied: uploadedFile?.fileSize } }
      );
    }
  }

  await interactions_services.update_Node({ _id: node_id }, req.body);

  return response200(res, msg.update_success, []);
});

const removeNode = catchAsyncError(async (req, res) => {
  const { node_id } = req.params;

  const nodeData = await interactions_services.get_single_node({
    _id: node_id,
    is_deleted: false,
  });
  if (!nodeData) return response400(res, msg.nodeNotExists);

  const interactionData = await interactions_services.get_single_interaction({
    _id: nodeData?.interaction_id,
    is_deleted: false,
  });

  const sourceEdge = await interactions_services.find_Edge({
    source: nodeData._id,
    is_deleted: false,
  });

  const targetEdge = await interactions_services.find_Edge({
    target: nodeData._id,
    is_deleted: false,
  });

  if (sourceEdge && targetEdge) {
    const updateEdgeTarget = await interactions_services.update_Edge(
      { _id: targetEdge._id },
      { target: sourceEdge.target }
    );

    const removeEdge = await interactions_services.remove_Edge({
      _id: sourceEdge._id,
    });

    await interactions_services.update_Node(
      { _id: node_id },
      { is_deleted: true }
    );

    if (nodeData?.video_size) {
      await organization_services.update_organization(
        { _id: interactionData.organization_id },
        { $inc: { storage_occupied: -nodeData?.video_size } }
      );
    }

    // Re index remaining nodes
    const remainingNodes = await interactions_services.get_flow_list({
      interaction_id: nodeData.interaction_id,
      is_deleted: false,
    });
    remainingNodes.sort((a, b) => a.index - b.index);

    // Update indices to maintain sequential order
    let newIndex = 0;
    for (const node of remainingNodes) {
      if (node.index !== newIndex) {
        await interactions_services.update_Node(
          { _id: node._id },
          { index: newIndex }
        );
      }
      newIndex++;
    }

    return response200(res, msg.delete_success, []);
  } else {
    return response400(res, msg.someThingsWrong);
  }
});

const createDefaultFlow = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { interaction_id, flows } = req.body;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
  });
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  if (flows?.length) {
    let targetId;
    let sourceId;
    await Promise.all(
      flows.map(async (val) => {
        // const payload = { interaction_id: interactionData._id, added_by: Id, title: val.title };
        // let targetId;
        // let sourceId;
        if (val.type === nodeType.Start) {
          const nodeData = await interactions_services.add_Node({
            interaction_id: interaction_id,
            type: val.type,
            position: val.position,
            title: val.title,
            added_by: Id,
            answer_format: {},
          });
          sourceId = nodeData._id;
        }

        if (val.type === nodeType.End) {
          const nodeData = await interactions_services.add_Node({
            interaction_id: interaction_id,
            type: val.type,
            position: val.position,
            title: val.title,
            added_by: Id,
            answer_format: {},
          });
          targetId = nodeData._id;
        }

        // // const flowData = await interactions_services.add_flow(payload);

        // if (nodeData) {

        //     if (val.type === nodeType.Start && nodeData) {
        //         sourceId = nodeData._id
        //     };
        //     if (val.type === nodeType.End && nodeData) {
        //         console.log("before", targetId)
        //         // console.log("helllo ", nodeData._id)
        //         targetId = nodeData._id;
        //         console.log("after", targetId)
        //     }
        //     console.log("outer", targetId)
        // if (targetId && sourceId) {
        //     console.log("test",)
        //     await interactions_services.add_Edge({ interaction_id, source: sourceId, target: targetId, added_by: Id });
        // }
        // }
      })
    );

    if (targetId && sourceId) {
      await interactions_services.add_Edge({
        interaction_id,
        source: sourceId,
        target: targetId,
        added_by: Id,
      });
    }
  }

  return response200(res, msg.fetch_success, []);
});

const getMediaLibrary = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;
  const { search } = req.query;

  const interActions = await interactions_services.get_all_interactions({
    organization_id,
  });
  let interActionIds = [];
  interActions.map((val) => {
    interActionIds.push(val._id);
  });

  const results = await interactions_services.getNodeLibrary(
    interActionIds,
    search
  );

  if (results?.length) results.map((val) => (val.type = "Node"));

  const data = await interactions_services.getLibrary(
    {
      organization_id,
      is_deleted: false,
    },
    {
      organization_id: 1,
      video_thumbnail: 1,
      video_url: 1,
      is_connected_with_node: 1,
      added_by: 1,
    }
  );

  if (data?.length) data.map((val) => (val.type = "Media"));

  let result = [...results, ...data];

  return response200(res, msg.fetch_success, result);
});

const getTargetNode = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;
  const { selectedNodeId } = req.query;
  const targetNodeId = await interactions_services.getTargetNodeId(
    interaction_id,
    selectedNodeId
  );

  return response200(res, msg.fetch_success, targetNodeId);
});

const getArchivedInteractions = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  let interactionList = await interactions_services.get_all_interactions({
    organization_id,
    is_deleted: true,
  });

  if (interactionList?.length) {
    await Promise.all(
      interactionList.map(async (val) => {
        const getNodes = await interactions_services.get_flow_list({
          interaction_id: val._id,
          is_deleted: false,
        });

        if (getNodes?.length) {
          const nodesWithThumbnails = getNodes.filter(
            (node) => node.video_thumbnail
          );
          val.thumbnailUrl = nodesWithThumbnails?.length
            ? nodesWithThumbnails[0].video_thumbnail
            : "";
        } else {
          val.thumbnailUrl = "";
        }
      })
    );
  }

  return response200(res, msg.fetch_success, interactionList);
});

// remove permanently
const removeForeverInteraction = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: true,
  });

  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const removeEdges = await interactions_services.remove_Edge({
    interaction_id,
  });
  const removeNodes = await interactions_services.remove_Node({
    interaction_id,
  });

  await interactions_services.remove_interaction({ _id: interaction_id });

  return response200(res, msg.delete_success, []);
});

const updateNodeAnswerFormat = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { node_id, answer_type, answer_format } = req.body;

  const nodeData = await interactions_services.get_single_node({
    _id: node_id,
    is_deleted: false,
  });
  if (!nodeData) return response400(res, msg.nodeNotExists);

  if (
    answer_type === answerType.MultipleChoice &&
    nodeData?.answer_type !== answerType.MultipleChoice
  ) {
    req.body.answer_format.choices = answer_format?.choices?.map((item) => ({
      ...item,
      targetedNodeId: new mongoose.Types.ObjectId(item.targetedNodeId),
    }));
    await manageMultiChoiceEdge(
      node_id,
      answer_format?.choices,
      nodeData?.interaction_id,
      Id
    );
  }

  // This is for if new options add in same answer_type = MultipleChoice

  if (
    answer_type === answerType.MultipleChoice &&
    nodeData?.answer_type === answerType.MultipleChoice
  ) {
    const targetedToNode = answer_format.choices.filter(
      (target) => target?.targetedNodeId !== null
    );
    const targetedToRedirect = answer_format.choices.filter(
      (target) => target?.redirection_url !== null
    );

    await manageMultiChoiceEdge(
      node_id,
      targetedToNode,
      nodeData?.interaction_id,
      Id
    );

    await handelRedirectEdge(
      nodeData,
      targetedToRedirect,
      nodeData?.interaction_id,
      Id
    );
  }

  if (answer_type === answerType.NPS) {
    req.body.answer_format.nps_choices = answer_format?.nps_choices?.map(
      (item) => ({
        ...item,
        targetedNodeId: new mongoose.Types.ObjectId(item.targetedNodeId),
      })
    );
    await manageMultiChoiceEdge(
      node_id,
      answer_format?.nps_choices,
      nodeData?.interaction_id,
      Id
    );
  }
  await interactions_services.update_Node({ _id: node_id }, req.body);

  // this is for reset all edges if type is change from MultipleChoice or NPS to other
  if (
    (nodeData?.answer_type === answerType.MultipleChoice &&
      answer_type !== answerType.MultipleChoice) ||
    (nodeData?.answer_type === answerType.NPS && answer_type !== answerType.NPS)
  ) {
    const nodeEdge = await interactions_services.find_all_edges({
      source: node_id,
    });
    const nextNodeId = await interactions_services.get_single_node({
      interaction_id: nodeData?.interaction_id,
      index: nodeData?.index + 1,
    });

    if (nodeEdge.length) {
      let edgeIds = nodeEdge.map((val) => val._id);
      await interactions_services.delete_edge({ _id: { $in: edgeIds } });
      await interactions_services.add_Edge({
        source: node_id,
        target: nextNodeId,
        interaction_id: nodeData?.interaction_id,
        added_by: Id,
      });
    }
  }

  const existingRedirectNode = await interactions_services.get_flow_list({
    type: "Redirect",
    interaction_id: nodeData.interaction_id,
    is_deleted: false,
  });

  await handelEmptyRedirectNode(nodeData.interaction_id);

  return response200(res, msg.update_success, []);
});

const getInteractionContactDetails = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  const interactionData = await interactions_services.get_single_interaction(
    {
      _id: interaction_id,
      is_deleted: false,
    },
    { contact_details: 1 }
  );

  return response200(res, msg.fetch_success, interactionData);
});

const collectAnswer = catchAsyncError(async (req, res) => {
  const {
    answer_id,
    interaction_id,
    node_id,
    node_answer_type,
    type,
    contact_details,
    answer,
  } = req.body;

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
  });

  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const nodeData = await interactions_services.get_single_node({
    _id: node_id,
    is_deleted: false,
    type: nodeType.Question,
  });
  if (!nodeData) return response400(res, msg.nodeTypeQuestion);

  if (node_answer_type !== nodeData.answer_type) {
    return response400(res, msg.answerTypeNotMatched);
  }

  if (answer_id) {
    const answerData = await interactions_services.get_answer({
      _id: answer_id,
      is_deleted: false,
    });
    if (!answerData) return response400(res, "Answer details not exists");
  }

  let answer_details = {};
  if (node_answer_type === answerType.OpenEnded) {
    if (!type) return response400(res, "Open ended answer type is required");

    let tempType = [openEndedType.audio, openEndedType.video];
    if (tempType.includes(type)) {
      if (req.file) {
        const uploadedFile = await uploadVideoToCloudinary(
          req.file,
          `${CloudFolder}/${interaction_id}/ans/${node_id}`
        );
        answer_details.ansThumbnail = uploadedFile.thumbnailUrl;
        answer_details.answer = uploadedFile.videoUrl;
        answer_details.type = type;
      }
    } else {
      answer_details.answer = answer;
      answer_details.type = type;
    }
  }

  if (node_answer_type === answerType.FileUpload) {
    if (req.file) {
      const uploadedFile = await uploadVideoToCloudinary(
        req.file,
        `${CloudFolder}/${interaction_id}/ans/${node_id}`
      );
      answer_details.answer = uploadedFile.videoUrl;
    }
  }

  if (
    node_answer_type === answerType.MultipleChoice ||
    node_answer_type === answerType.Button ||
    node_answer_type === answerType.NPS
  ) {
    const ansType = ["true", "false"];
    if (ansType.includes(answer)) {
      answer_details.answer = answer === "true" ? true : false;
    } else {
      answer_details.answer = answer;
    }
  }

  let answerId;
  req.body.answers = [
    {
      node_id,
      node_answer_type,
      answer_details,
    },
  ];

  delete req.body.node_id;
  delete req.body.node_answer_type;
  delete req?.body?.type;

  if (contact_details) {
    const { name, email, phone, product } = contact_details;
    if (email) {
      const contactIsExists = await contact_services.get_single_contact({
        contact_email: email,
        organization_id: interactionData.organization_id,
        is_deleted: false,
      });
      if (contactIsExists) {
        req.body.contact_id = contactIsExists._id;
      } else {
        const contactUUID = generateUUID("CON");
        const newContact = await contact_services.add_contact({
          organization_id: interactionData.organization_id,
          contact_uuid: contactUUID,
          contact_name: name,
          contact_email: email,
          phone_number: phone,
          product_name: product,
        });
        req.body.contact_id = newContact._id;
      }
    } else {
      const contactUUID = generateUUID("CON");
      const newContact = await contact_services.add_contact({
        organization_id: interactionData.organization_id,
        contact_uuid: contactUUID,
        contact_name: name,
        contact_email: email,
        phone_number: phone,
        product_name: product,
      });
      req.body.contact_id = newContact._id;
    }
  }

  if (answer_id) {
    await interactions_services.update_answer(
      { _id: answer_id },
      {
        $push: { answers: req.body.answers },
        contact_id: req.body.contact_id,
      }
    );
    answerId = answer_id;
  } else {
    const result = await interactions_services.add_answer(req.body);
    answerId = result._id;
  }

  let isMultiple = false;
  let isRedirect = false;
  let target = null;
  if ([answerType.MultipleChoice, answerType.NPS].includes(node_answer_type)) {
    isMultiple = true;
  } else {
    isRedirect = true;
    target = nodeData?.redirection_url;
    if (!nodeData?.redirection_url) {
      isRedirect = false;
      const edges = await interactions_services.get_all_edges({
        interaction_id,
        source: node_id,
      });
      if (edges.length > 0) {
        const targetNode = await interactions_services.get_single_node({
          interaction_id,
          _id: edges?.[0].target,
        });
        target = targetNode._id;
      }
    }
  }

  return response201(res, msg.answerSuccess, {
    answerId,
    contactId: req.body.contact_id,
    isMultiple,
    isRedirect,
    target,
  });
});

const getInteractionAnswers = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  let interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
  });

  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const data = await interactions_services.get_interaction_answer({
    interactionId: interaction_id,
  });

  const nodeList = await interactions_services.get_flow_list({
    interaction_id,
    is_deleted: false,
  });

  if (nodeList?.length) {
    const nodesWithThumbnails = nodeList.filter(
      (node) => node?.video_thumbnail
    );
    interactionData.thumbnailUrl = nodesWithThumbnails?.length
      ? nodesWithThumbnails?.[0]?.video_thumbnail
      : "";
  } else {
    interactionData.thumbnailUrl = "";
  }

  return response200(res, msg.fetch_success, {
    interactionData,
    contactData: data,
  });
});

const getNodeWiseAnswers = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  let interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
  });

  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const data = await interactions_services.node_wise_answer({
    interactionId: interaction_id,
  });

  return response200(res, msg.fetch_success, data);
});

const createNewEdgeConnections = catchAsyncError(async (req, res) => {
  const { body } = req;
  const Id = req.user;
  let interactionData = await interactions_services.get_single_interaction({
    _id: body.interaction_id,
    is_deleted: false,
  });

  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const findEdge = await interactions_services.find_Edge({
    source: body.source,
    target: body.target,
    is_deleted: false,
  });

  if (findEdge) return response400(res, msg.existEdge);

  if (body.source && body.target) {
    await interactions_services.add_Edge({
      ...body,
      added_by: Id,
    });
    await interactions_services.remove_Edge({
      interaction_id: body.interaction_id,
      source: body.source,
    });
  }

  return response200(res, msg.createNewEdge, findEdge);
});

const getAllInteraction = catchAsyncError(async (req, res) => {
  const { organization_id, filterType } = req.params;

  const { startDate, endDate } = getDateRangeForFilter(filterType);

  const intList = await interactions_services.get_all_interaction(
    organization_id
  );

  if (intList?.length < 0) return response200(res, msg.fetch_success, intList);

  const data = await interactions_services.get_all_interaction_answer(
    intList,
    startDate,
    endDate,
    filterType,
    organization_id
  );

  return response200(res, msg.fetch_success, data);
});

const updateIsCompletedInt = catchAsyncError(async (req, res) => {
  const answerId = req.body.answer_id;

  const answerData = await interactions_services.get_answer({
    _id: answerId,
    is_deleted: false,
  });

  if (!answerData) return response400(res, msg.answerNotFound);

  await interactions_services.update_answer(
    { _id: answerId },
    {
      is_completed_interaction: true,
    }
  );

  return response200(res, msg.update_success, []);
});

const copyInteraction = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { interaction_id, folder_id } = req.body;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  const interactionData = await interactions_services.getNodesList(
    interaction_id
  );
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const oldInteraction = interactionData[0];

  const newInteraction = await interactions_services.add_new_interaction({
    organization_id: oldInteraction.organization_id,
    interaction_type: oldInteraction.interaction_type,
    is_lead_crm: oldInteraction.is_lead_crm,
    title: `${oldInteraction.title} (copy)`,
    is_collect_contact: oldInteraction.is_collect_contact,
    language: oldInteraction?.language,
    folder_id: folder_id,
    added_by: Id,
    font: oldInteraction?.font,
    primary_color: oldInteraction?.primary_color,
    secondary_color: oldInteraction?.secondary_color,
    background_color: oldInteraction?.background_color,
    border_radius: oldInteraction?.border_radius,
  });

  if (interactionData?.length && interactionData?.[0]?.nodes?.length) {
    const nodes = interactionData[0].nodes;

    let nodeIds = [];
    let oldEdgesToUpdate = [];

    let endNode = null;
    let endNodeId;
    const filteredNodes = nodes.filter((node) => {
      if (node.type === "End") {
        endNode = node;
        return false;
      }
      return true;
    });

    const nodeIdMapping = {};
    for (const [index, node] of filteredNodes.entries()) {
      node.interaction_id = newInteraction._id;
      node.added_by = Id;

      if (node?.video_url) {
        const videoData = await copyVideoInCloudinary(
          node?.video_url,
          `${CloudFolder}/${Id}/${folderData?.folder_name}/${newInteraction?._id}`
        );
        node.video_url = videoData?.videoUrl;
        node.video_thumbnail = videoData?.thumbnailUrl;
        node.video_size = videoData?.fileSize;

        await organization_services.update_organization(
          { _id: oldInteraction.organization_id },
          { $inc: { storage_occupied: videoData?.fileSize } }
        );
      }

      const { _id, createdAt, updatedAt, __v, ...rest } = node;

      // Create a new node and get its ID
      const newNode = await interactions_services.add_Node(rest);
      nodeIds.push(newNode?._id);
      nodeIdMapping[node._id] = newNode._id;

      // Track start node (first node)
      if (index === 0) {
        startNodeId = newNode?._id;
      }

      // Track end node (last node) will be handled after all nodes are added
      if (index === filteredNodes.length - 1) {
        endNodeId = newNode?._id;
      }
    }

    // Now, process the "End" node if it exists
    if (endNode) {
      endNode.interaction_id = newInteraction._id;
      endNode.added_by = Id;

      const { _id, createdAt, updatedAt, __v, ...rest } = endNode;
      const newEndNode = await interactions_services.add_Node(rest);
      nodeIds.push(newEndNode._id);
      endNodeId = newEndNode._id;
    }

    // Now that all nodes are created and their IDs are stored, add the 'end' type node
    if (nodeIds.length > 0) {
      const lastNodeId = nodeIds[nodeIds.length - 1];
      // Update the last node to have type 'end'
      const updatedEndNode = await interactions_services.update_Node(
        { _id: lastNodeId },
        { type: "End" }
      );
    }

    const newNodeList = await interactions_services.get_flow_list({
      interaction_id: newInteraction?._id,
    });
    if (newNodeList?.length) {
      await newNodeList?.map(async (val) => {
        if (val.answer_type === answerType.MultipleChoice) {
          const updatedChoices = val?.answer_format?.choices?.map((choice) => {
            return {
              ...choice,
              targetedNodeId:
                nodeIdMapping[choice.targetedNodeId] || choice.targetedNodeId,
            };
          });

          // Update the interaction node with the new choices
          val.answer_format.choices = updatedChoices;
          await interactions_services.update_Node(val._id, {
            answer_format: val.answer_format,
          });
        }

        if (val.answer_type === answerType.NPS) {
          const updatedChoices = val?.answer_format?.nps_choices?.map(
            (choice) => {
              return {
                ...choice,
                targetedNodeId:
                  nodeIdMapping[choice.targetedNodeId] || choice.targetedNodeId,
              };
            }
          );

          // Update the interaction node with the new choices
          val.answer_format.nps_choices = updatedChoices;
          await interactions_services.update_Node(val._id, {
            answer_format: val.answer_format,
          });
        }
      });
    }

    // Now create edges between nodes
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const sourceNodeId = nodeIds[i];
      const targetNodeId = nodeIds[i + 1];

      // Only create an edge if both source and target are valid
      if (sourceNodeId && targetNodeId) {
        // Add edge to the update queue
        oldEdgesToUpdate.push({
          source: sourceNodeId,
          target: targetNodeId,
        });
      } else {
        console.error("Missing source or target node for edge creation");
      }
    }

    // 1) Update existing edges (if necessary) based on new node IDs
    for (const edge of oldEdgesToUpdate) {
      // Ensure both source and target are defined before updating
      if (edge?.source && edge?.target) {
        await interactions_services.update_Edge(
          { interaction_id: newInteraction._id, source: edge.source },
          { target: edge.target }
        );
      } else {
        console.error("Missing source or target in edge", edge);
      }
    }

    // 2) Create new edges between the new nodes (if no existing edges to update)
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const sourceNodeId = nodeIds[i];
      const targetNodeId = nodeIds[i + 1];

      // Create the edge between the nodes
      await interactions_services.add_Edge({
        interaction_id: newInteraction._id,
        source: sourceNodeId,
        target: targetNodeId,
        added_by: Id,
      });
    }
  }

  const oldInteractionEdge = await interactions_services.find_all_with_node({
    interaction_id: new mongoose.Types.ObjectId(interactionData?.[0]?._id),
    is_deleted: false,
  });
  const newInteractionEdge = await interactions_services.find_all_with_node({
    interaction_id: new mongoose.Types.ObjectId(newInteraction?._id),
    is_deleted: false,
  });

  const oldIndexMap = new Map();
  const newIndexMap = new Map();

  // Map old interaction edges
  for (const edge of oldInteractionEdge) {
    const sourceIndex = edge.source.index;
    const targetIndex = edge.target.index;

    if (!oldIndexMap.has(sourceIndex)) {
      oldIndexMap.set(sourceIndex, []);
    }
    oldIndexMap.get(sourceIndex).push(targetIndex);
  }

  // Map new interaction edges
  for (const edge of newInteractionEdge) {
    const sourceIndex = edge.source.index;
    const targetIndex = edge.target.index;

    if (!newIndexMap.has(sourceIndex)) {
      newIndexMap.set(sourceIndex, []);
    }
    if (!newIndexMap.has(targetIndex)) {
      newIndexMap.set(targetIndex, []);
    }

    newIndexMap.get(sourceIndex).push(edge.source._id);
    newIndexMap.get(targetIndex).push(edge.target._id);
  }

  // Delete all existing edges for the new interaction
  await interactions_services.delete_edge({
    interaction_id: newInteraction._id,
  });

  const addedEdges = new Set();
  for (const [oldSourceIndex, oldTargetIndexes] of oldIndexMap.entries()) {
    const newSourceIds = newIndexMap.get(oldSourceIndex);

    if (newSourceIds) {
      for (const newSourceId of newSourceIds) {
        for (const oldTargetIndex of oldTargetIndexes) {
          const newTargetIds = newIndexMap.get(oldTargetIndex);

          if (newTargetIds) {
            for (const newTargetId of newTargetIds) {
              if (newSourceId && newTargetId) {
                // Generate a unique key for the source-target pair
                const edgeKey = `${newSourceId}-${newTargetId}`;
                // Check if the edge has already been added
                if (!addedEdges.has(edgeKey)) {
                  await interactions_services.add_Edge({
                    interaction_id: newInteraction._id,
                    source: newSourceId,
                    target: newTargetId,
                    added_by: req.user,
                  });

                  // Add the edge to the set to prevent future duplicates
                  addedEdges.add(edgeKey);
                }
              }
            }
          }
        }
      }
    }
  }
  return response200(res, msg.fetch_success);
});

module.exports = {
  addFolder,
  getFolderList,
  updateFolder,
  deleteFolder,
  createInteraction,
  getInteractionList,
  updateInteraction,
  deleteInteraction,
  createNode,
  getNodes,
  updateNode,
  updateEdges,
  removeNode,
  createDefaultFlow,
  updateCordinates,
  getMediaLibrary,
  copyInteraction,
  getArchivedInteractions,
  removeForeverInteraction,
  updateNodeAnswerFormat,
  collectAnswer,
  getInteractionContactDetails,
  getInteractionAnswers,
  getNodeWiseAnswers,
  createNewEdgeConnections,
  getAllInteraction,
  updateIsCompletedInt,
  getLogicNode,
  changeNodeEdge,
  getTargetNode,
};
