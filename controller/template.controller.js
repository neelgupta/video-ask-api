const { default: mongoose } = require("mongoose");
const { response400, response200 } = require("../lib/response-messages");
const { copyVideoInCloudinary } = require("../lib/uploader/upload");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  organization_services,
  interactions_services,
  template_service,
} = require("../service");
const {
  msg,
  CloudFolder,
  answerType,
  interactionType,
} = require("../utils/constant");

const addShardTemplate = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.body;
  console.log("interaction_id", interaction_id);

  const interactionData = await interactions_services.getNodesList(
    interaction_id
  );
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const oldInteraction = interactionData[0];
  const newInteraction = await template_service.add_new_shard_interaction({
    interaction_type: interactionType.Template,
    ...(({
      is_lead_crm,
      title,
      language,
      font,
      primary_color,
      secondary_color,
      background_color,
      border_radius,
    }) => ({
      is_lead_crm,
      title,
      language,
      font,
      primary_color,
      secondary_color,
      background_color,
      border_radius,
    }))(oldInteraction),
  });

  if (!oldInteraction?.nodes?.length) return;

  const { nodes, edges } = oldInteraction;
  let nodeIds = [],
    nodeIdMapping = {},
    endNode = nodes.find((node) => node.type === "End");

  const processNode = async (node) => {
    node.interaction_id = newInteraction._id;
    if (node.video_url) {
      const videoData = await copyVideoInCloudinary(
        node.video_url,
        `${CloudFolder}/template/${newInteraction._id}`
      );
      Object.assign(node, {
        video_url: videoData?.videoUrl,
        video_thumbnail: videoData?.thumbnailUrl,
        video_size: videoData?.fileSize,
      });
    }
    const { _id, createdAt, updatedAt, __v, added_by, ...rest } = node;
    const newNode = await template_service.add_Shard_Node(rest);
    nodeIds.push(newNode._id);
    nodeIdMapping[_id] = newNode._id;
  };

  await Promise.all(nodes.filter((node) => node !== endNode).map(processNode));
  if (endNode) await processNode(endNode);

  await Promise.all(
    edges.map(async (edge) => {
      edge.interaction_id = newInteraction._id;
      Object.assign(edge, {
        source: nodeIdMapping[edge.source] || edge.source,
        target: nodeIdMapping[edge.target] || edge.target,
      });
      const { _id, createdAt, updatedAt, __v, added_by, ...rest } = edge;
      await template_service.add_Shard_Edge(rest);
    })
  );

  await Promise.all(
    nodes
      .filter(({ answer_type }) =>
        ["nps", "multiple-choice"].includes(answer_type)
      )
      .map(async (node) => {
        const key = node.answer_type === "nps" ? "nps_choices" : "choices";
        node.answer_format[key].forEach((choice) => {
          if (choice.targetedNodeId)
            choice.targetedNodeId = nodeIdMapping[choice.targetedNodeId];
        });
        await template_service.update_Shard_Node(
          { _id: nodeIdMapping[node._id] },
          { [`answer_format.${key}`]: node.answer_format[key] }
        );
      })
  );

  return response200(res, msg.fetch_success);
});

const copyTemplate = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { interaction_id, folder_id } = req.body;

  const folderData = await interactions_services.get_single_folder({
    _id: folder_id,
    is_deleted: false,
  });
  if (!folderData) return response400(res, msg.folderIsNotExists);

  const interactionData = await template_service.get_Shard_Template(
    interaction_id
  );
  if (!interactionData) return response400(res, msg.interactionIsNotExists);

  const oldInteraction = interactionData[0];

  const newInteraction = await interactions_services.add_new_interaction({
    organization_id: folderData.organization_id,
    interaction_type: oldInteraction.interaction_type,
    is_lead_crm: oldInteraction.is_lead_crm,
    title: `${oldInteraction.title}`,
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

  if (!oldInteraction?.nodes?.length) return;

  const { nodes, edges } = oldInteraction;
  let nodeIds = [],
    nodeIdMapping = {},
    endNode = nodes.find((node) => node.type === "End");

  const processNode = async (node) => {
    node.interaction_id = newInteraction._id;
    const { _id, createdAt, updatedAt, __v, ...rest } = node;
    const newNode = await interactions_services.add_Node({
      ...rest,
      added_by: Id,
    });
    nodeIds.push(newNode._id);
    nodeIdMapping[_id] = newNode._id;
  };

  await Promise.all(nodes.filter((node) => node !== endNode).map(processNode));
  if (endNode) await processNode(endNode);

  await Promise.all(
    edges.map(async (edge) => {
      edge.interaction_id = newInteraction._id;
      Object.assign(edge, {
        source: nodeIdMapping[edge.source] || edge.source,
        target: nodeIdMapping[edge.target] || edge.target,
      });
      const { _id, createdAt, updatedAt, __v, ...rest } = edge;
      await interactions_services.add_Edge({ ...rest, added_by: Id });
    })
  );

  await Promise.all(
    nodes
      .filter(({ answer_type }) =>
        ["nps", "multiple-choice"].includes(answer_type)
      )
      .map(async (node) => {
        const key = node.answer_type === "nps" ? "nps_choices" : "choices";
        node.answer_format[key].forEach((choice) => {
          if (choice.targetedNodeId)
            choice.targetedNodeId = nodeIdMapping[choice.targetedNodeId];
        });
        await interactions_services.update_Node(
          { _id: nodeIdMapping[node._id] },
          { [`answer_format.${key}`]: node.answer_format[key] }
        );
      })
  );

  return response200(res, msg.TemplateAdd, {
    interaction_id: newInteraction?._id,
  });
});

const getTemplate = catchAsyncError(async (req, res) => {
  const { interaction_id } = req.params;

  const interactionData = await template_service.get_Shard_Template(
    interaction_id
  );
  if (!interactionData?.length)
    return response400(res, msg.interactionIsNotExists);

  return response200(res, msg.fetch_success, interactionData?.[0] || {});
});

module.exports = {
  addShardTemplate,
  getTemplate,
  copyTemplate,
};
