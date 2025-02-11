const copyInteractionT = catchAsyncError(async (req, res) => {
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
