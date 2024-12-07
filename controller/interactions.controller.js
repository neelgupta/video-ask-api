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
const { organization_services, interactions_services } = require("../service");
const { msg, CloudFolder, nodeType } = require("../utils/constant");

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
    { folder_id, is_deleted: false, added_by: Id },
    { updatedAt: 0, __v: 0 }
  );

  await Promise.all(
    data.map(async (val) => {
      const getNodes = await interactions_services.get_flow_list({
        interaction_id: val._id,
      });
      const nodesWithThumbnails = getNodes.filter(
        (node) => node.video_thumbnail
      );
      val.thumbnailUrl = nodesWithThumbnails?.length
        ? nodesWithThumbnails[0].video_thumbnail
        : "";
    })
  );
  return response200(res, msg.fetch_success, data);
});

const updateInteraction = catchAsyncError(async (req, res) => {
  const { folder_id, interaction_id } = req.body;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  const interactionData = await interactions_services.get_single_interaction({
    _id: interaction_id,
    is_deleted: false,
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
  }

  const newNode = await interactions_services.add_Node(req.body);
  if (newNode) {
    const newEdge = await interactions_services.add_Edge({
      interaction_id: interaction_id,
      source: sourceId,
      target: targetId,
      added_by: Id,
    });
    const updateSource = await interactions_services.update_Edge(
      { source: sourceId },
      { target: newNode._id }
    );
    const updateTarget = await interactions_services.update_Edge(
      { target: targetId },
      { source: newNode._id }
    );
  }

  return response201(res, msg.flowCreated, newNode);
});

const getNodes = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  const interactionData = await interactions_services.getNodesList(
    interaction_id
  );
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  return response200(res, msg.fetch_success, interactionData?.[0] || {});
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

const updateNode = catchAsyncError(async (req, res) => {
  const { flow_id } = req.body;

  const flowData = await interactions_services.get_single_node({
    _id: flow_id,
    is_deleted: false,
  });
  if (!flowData) return response400(res, msg.nodeNotExists);

  const interactionData = await interactions_services.get_single_interaction({
    _id: flowData?.interaction_id,
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
  }

  await interactions_services.update_Node({ _id: flow_id }, req.body);

  return response200(res, msg.update_success, []);
});

const removeNode = catchAsyncError(async (req, res) => {
  const { flow_id } = req.body;

  const flowData = await interactions_services.get_single_node({
    _id: flow_id,
    is_deleted: false,
  });
  if (!flowData) return response400(res, msg.nodeNotExists);

  await interactions_services.update_Node(
    { _id: flow_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
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

  const results = await interactions_services.getLibrary(
    interActionIds,
    search
  );
  return response200(res, msg.fetch_success, results);
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
    language: oldInteraction.language,
    folder_id: folder_id,
    added_by: Id,
  });

  if (interactionData?.length && interactionData?.[0]?.nodes?.length) {
    const nodes = interactionData?.[0]?.nodes;

    let startNodeId = null; // Start node ID
    let endNodeId = null; // End node ID
    let firstIntermediateNodeId = null; // To track the third node

    for (const [index, val] of nodes.entries()) {
      val.interaction_id = newInteraction._id;
      val.added_by = Id;

      // Exclude unnecessary fields
      const { _id, createdAt, updatedAt, __v, ...rest } = val;

      // Add the node and get its ID
      const newNode = await interactions_services.add_Node(rest);
      const currentNodeId = newNode._id;

      // Track start and end nodes
      if (index === 0) {
        startNodeId = currentNodeId;
      } else if (index === nodes.length - 1) {
        endNodeId = currentNodeId;
      } else {
        // Handle intermediate node (third node)
        if (!firstIntermediateNodeId) {
          firstIntermediateNodeId = currentNodeId;

          // Update first node's target to point to the third node
          await interactions_services.update_Edge(
            { interaction_id: newInteraction._id, source: startNodeId },
            { target: firstIntermediateNodeId }
          );

          // Update end node's source to point to the third node
          await interactions_services.update_Edge(
            { interaction_id: newInteraction._id, target: endNodeId },
            { source: firstIntermediateNodeId }
          );
        }
      }
    }

    // Ensure proper edge connections:
    // Start Node → Third Node
    if (startNodeId && firstIntermediateNodeId) {
      await interactions_services.add_Edge({
        interaction_id: newInteraction._id,
        source: startNodeId,
        target: firstIntermediateNodeId,
        added_by: Id,
      });
    }

    // Third Node → End Node
    if (firstIntermediateNodeId && endNodeId) {
      await interactions_services.add_Edge({
        interaction_id: newInteraction._id,
        source: firstIntermediateNodeId,
        target: endNodeId,
        added_by: Id,
      });
    }
  }


  return response200(res, msg.fetch_success, newInteraction);
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
  removeNode,
  createDefaultFlow,
  updateCordinates,
  getMediaLibrary,
  copyInteraction,
};
