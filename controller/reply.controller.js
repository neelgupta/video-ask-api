const { default: mongoose } = require("mongoose");
const {
  response400,
  response200,
  response201,
} = require("../lib/response-messages");
const { uploadVideoToCloudinary } = require("../lib/uploader/upload");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  organization_services,
  interactions_services,
  reply_service,
  user_services,
  direct_message_answer_service,
} = require("../service");
const {
  msg,
  CloudFolder,
  frontBaseUrl,
  encrypt,
  getCloudFolderPath,
} = require("../utils/constant");
const contact_services = require("../service/contact.service");
const { sendReply } = require("../utils/emailTemplates");
const { DiffieHellman } = require("crypto");

const addReply = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const {
    interaction_id,
    organization_id,
    answer_format,
    contact_id,
    answer_id,
    reply_id,
    direct_node_id,
    type,
  } = req.body;
  console.log("type", type);

  const userData = await user_services.getUserSubscriptionPlan(
    { _id: Id },
    {
      path: "current_subscription_id",
      populate: { path: "subscription_plan_id" },
    }
  );

  let folderData;
  let interactionData;
  if (type === "reply") {
    const answerData = await interactions_services.get_answer({
      _id: answer_id,
      is_deleted: false,
    });
    if (!answerData) return response400(res, msg.answerNotExists);

    // Validate interaction exists
    interactionData = await interactions_services.get_single_interaction({
      _id: interaction_id,
      is_deleted: false,
    });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);

    folderData = await interactions_services.get_single_folder({
      _id: interactionData.folder_id,
      is_deleted: false,
    });
    if (!folderData) return response400(res, msg.folderNotExists);
  }

  let replyNodeData = null;
  let answerData = null;
  if (type === "reply-message") {
    replyNodeData = await reply_service.findOneReplyNode({
      _id: direct_node_id,
      is_deleted: false,
    });
    if (!replyNodeData) return response400(res, msg.replyNodeNotExists);
    answerData = await direct_message_answer_service.get_direct_message_answer({
      _id: reply_id,
      is_deleted: false,
    });
    if (!answerData) return response400(res, msg.answerNotExists);
  }

  // Validate source node exists
  const organization = await organization_services.get_organization({
    _id: organization_id,
  });
  if (!organization) return response400(res, msg.organizationNotExists);

  const contact = await contact_services.get_single_contact({
    _id: contact_id,
    is_deleted: false,
  });
  if (!contact) return response400(res, msg.contactNotExists);

  req.body.added_by = Id;
  req.body.answer_format = JSON.parse(answer_format);
  req.body.contact_id = contact._id;

  if (req.file) {
    const cloudFolderPath = getCloudFolderPath({
      path_type: type === "reply" ? "replyNode" : "replyMessageNode",
      organization_id: organization_id,
      user_id: Id,
    });
    const uploadedFile = await uploadVideoToCloudinary({
      file: req.file,
      folderPath: cloudFolderPath,
      type: "node",
      organization_id: organization_id,
    });
    req.body.video_thumbnail = uploadedFile.thumbnailUrl;
    req.body.video_url = uploadedFile.videoUrl;
    req.body.video_size = uploadedFile?.fileSize;

    await organization_services.update_organization(
      { _id: organization_id },
      { $inc: { storage_occupied: uploadedFile?.fileSize } }
    );
  }

  if (type === "direct-message") {
    // req.body.type = "direct_message";
    req.body.node_style = {
      primary_color: organization.primary_color,
      secondary_color: organization.secondary_color,
      background_color: organization.background_color,
      border_radius: organization.border_radius,
      font_size: organization.font_size,
      language: organization.language,
      font_family: organization.font_family,
    };
  }

  //   Create new reply node
  const newNode = await reply_service.createReplyNode(req.body);

  const inviteToken = await encrypt({
    id: newNode._id,
    type,
  });
  console.log("inviteToken", inviteToken);
  await sendReply({
    email: contact.contact_email,
    member_name: contact.contact_name,
    user_name: userData.user_name,
    invitation_link: `${frontBaseUrl}/view-flow/${inviteToken}`,
    reply_name: newNode.title,
    reply_text:
      type === "reply"
        ? `${userData.user_name} has reply to you for ${interactionData.title} flow answer.`
        : type === "direct-message"
        ? `You have a new message from ${userData.user_name}`
        : `You have a new reply from ${userData.user_name}`,
  });

  return response200(res, `${contact.contact_email} Reply sent successfully`, {
    reply_node_id: newNode._id,
  });
});

const getDirectMessageAnswerByContact = catchAsyncError(async (req, res) => {
  const { contactId } = req.params;

  const contact = await contact_services.get_single_contact({
    _id: contactId,
    is_deleted: false,
  });
  if (!contact) return response400(res, msg.contactNotExists);

  const answer =
    await direct_message_answer_service.get_direct_message_answer_by_contact(
      contact._id
    );
  console.log("answer", answer);
  return response200(res, "Direct message answer fetched successfully", {
    ...contact,
    messageList: answer,
  });
});

module.exports = {
  addReply,
  getDirectMessageAnswerByContact,
};
