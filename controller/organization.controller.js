const catchAsyncError = require("../middleware/catchAsyncError");
const {
  organization_services,
  user_services,
  subscription_services,
  interactions_services,
} = require("../service");
const {
  msg,
  generateUUID,
  generateEncryptedToken,
  frontBaseUrl,
  memberRole,
  invitationTokenType,
  CloudFolder,
} = require("../utils/constant");
const {
  response400,
  response200,
  response201,
} = require("../lib/response-messages");
const {
  sendInvitation,
  referralInvitation,
} = require("../utils/emailTemplates");
const { uploadVideoToCloudinary } = require("../lib/uploader/upload");

const addOrganization = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_name } = req.body;

  const organizationExists = await organization_services.get_organization({
    organization_name,
    is_deleted: false,
    added_by: Id,
  });
  if (organizationExists) return response400(res, msg.organizationExists);

  const organizationUUID = generateUUID("ORG");
  req.body = {
    ...req.body,
    added_by: Id,
    organization_uuid: organizationUUID,
    members: [{ userId: Id, role: memberRole.Owner }],
  };

  const data = await organization_services.add_organization(req.body);

  return response201(res, msg.organizationCreated, data);
});

const getOrganizationList = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const data = await organization_services.get_organization_list(
    { "members.userId": Id, is_deleted: false },
    { members: 0, __v: 0, updatedAt: 0 }
  );

  return response200(res, msg.fetch_success, data);
});

const getOrganizationDetails = catchAsyncError(async (req, res) => {
  const { Id } = req.params;

  const organizationData = await organization_services.get_organization(
    { _id: Id, is_deleted: false },
    { path: "members.userId", select: { email: 1 } }
  );

  return response200(res, msg.fetch_success, organizationData);
});

const updateOrganization = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id, organization_name, replay_to_email } = req.body;

  const organizationData = await organization_services.get_organization(
    { _id: organization_id, is_deleted: false, added_by: Id },
    "members.userId"
  );
  if (!organizationData) return response400(res, msg.organizationNotExists);

  if (replay_to_email) {
    let emails = [];
    if (organizationData?.members?.length)
      organizationData.members.map((val) => emails.push(val?.userId?.email));
    if (!emails.includes(replay_to_email))
      return response400(res, msg.validMemberEmail);
  }

  if (organization_name) {
    const organizationNameExists = await organization_services.get_organization(
      { _id: { $ne: organization_id }, organization_name, is_deleted: false }
    );
    if (organizationNameExists) return response400(res, msg.organizationExists);
  }

  const data = await organization_services.update_organization(
    { _id: organization_id },
    req.body
  );

  return response200(res, msg.update_success, data);
});

const deleteOrganization = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id } = req.params;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
    added_by: Id,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  await organization_services.update_organization(
    { _id: organization_id },
    { is_deleted: true }
  );

  await organization_services.update_many_member(
    { organization_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

const addMember = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id, member_email, member_phone, member_name } = req.body;
  const userData = await user_services.findUser({ _id: Id });

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
    added_by: Id,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const memberEmailExists = await organization_services.get_single_member({
    organization_id,
    member_email,
    is_deleted: false,
  });
  if (memberEmailExists) return response400(res, msg.emailIsExists);

  const memberPhoneExists = await organization_services.get_single_member({
    organization_id,
    member_phone,
    is_deleted: false,
  });
  if (memberPhoneExists) return response400(res, msg.phoneExists);

  const organizationMemberUUID = generateUUID("ORG");
  req.body = { ...req.body, added_by: Id, member_uuid: organizationMemberUUID };

  const data = await organization_services.add_member(req.body);

  // const invitationExpires = Date.now() + 15 * 60 * 1000;
  const payload = JSON.stringify({
    memberId: data._id,
    userId: Id,
    timestamp: Date.now(),
    type: invitationTokenType.Team_Member,
  });
  const inviteToken = await generateEncryptedToken(payload);
  const emailUrl = `${frontBaseUrl}/signup/${inviteToken}`;

  await sendInvitation({
    email: member_email,
    member_name,
    invitation_link: emailUrl,
    user_name: userData.user_name,
  });

  await organization_services.update_member(
    { _id: data._id },
    { invitation_token: inviteToken }
  );
  const response = { invitationToken: inviteToken, data };

  return response201(res, msg.memberCreated, response);
});

const getMembers = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;
  const { search, limit, offset } = req.query;
  let matchQuery = { organization_id, is_deleted: false };

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  if (search) {
    matchQuery["$or"] = [
      { member_name: { $regex: search, $options: "i" } },
      { member_uuid: { $regex: search, $options: "i" } },
    ];
  }

  let options = {};
  if (limit || offset) {
    options = {
      limit: limit || 100,
      skip: offset || 0,
      sort: { createdAt: -1 },
    };
  }

  const data = await organization_services.get_members(
    matchQuery,
    { updatedAt: 0, __v: 0 },
    options
  );
  const count = await organization_services.get_member_counts(matchQuery);

  const response = { count, organizationData, members: data };

  return response200(res, msg.fetch_success, response);
});

const updateMember = catchAsyncError(async (req, res) => {
  const { organization_id, member_id, member_email, member_phone } = req.body;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const memberData = await organization_services.get_single_member({
    _id: member_id,
    is_deleted: false,
  });
  if (!memberData) return response400(res, msg.memberNotExists);

  if (member_email) {
    const memberEmailExists = await organization_services.get_single_member({
      _id: { $ne: member_id },
      organization_id,
      member_email,
      is_deleted: false,
    });
    if (memberEmailExists) return response400(res, msg.emailIsExists);
  }

  if (member_phone) {
    const memberPhoneExists = await organization_services.get_single_member({
      _id: { $ne: member_id },
      organization_id,
      member_phone,
      is_deleted: false,
    });
    if (memberPhoneExists) return response400(res, msg.phoneExists);
  }

  const data = await organization_services.update_member(
    { _id: member_id },
    req.body
  );

  return response200(res, msg.update_success, data);
});

const deleteMember = catchAsyncError(async (req, res) => {
  const { member_id } = req.params;

  const memberData = await organization_services.get_single_member({
    _id: member_id,
    is_deleted: false,
  });
  if (!memberData) return response400(res, msg.memberNotExists);

  await organization_services.update_member(
    { _id: member_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

const addAddress = catchAsyncError(async (req, res) => {
  const { organization_id } = req.body;
  const Id = req.user;
  req.body.user_id = Id;

  const addressData = await organization_services.get_address_list({
    organization_id,
    is_deleted: false,
  });
  if (!addressData?.length) req.body.is_primary = true;

  const data = await organization_services.add_address(req.body);

  return response201(res, msg.addressCreated, data);
});

const getAddresses = catchAsyncError(async (req, res) => {
  const Id = req.user;

  const data = await organization_services.get_address_list(
    { user_id: Id, is_deleted: false },
    { updatedAt: 0, __v: 0 }
  );

  return response200(res, msg.fetch_success, data);
});

const updateAddress = catchAsyncError(async (req, res) => {
  const { address_id } = req.body;

  const addressData = await organization_services.get_address_list({
    _id: address_id,
    is_deleted: false,
  });

  if (!addressData?.length) return response400(res, msg.addressNotExists);

  const data = await organization_services.update_address(
    { _id: address_id },
    req.body
  );

  return response200(res, msg.update_success, data);
});

const deleteAddress = catchAsyncError(async (req, res) => {
  const { address_id } = req.params;

  const addressData = await organization_services.get_address_list({
    _id: address_id,
    is_deleted: false,
  });
  if (!addressData?.length) return response400(res, msg.addressNotExists);

  await organization_services.update_address(
    { _id: address_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

const addReferral = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id, referral_email } = req.body;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
    added_by: Id,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const referralEmailExists = await organization_services.referral_list({
    organization_id,
    is_deleted: false,
    referral_email,
    added_by: Id,
  });
  if (referralEmailExists?.length) return response400(res, msg.referralExists);

  req.body.added_by = Id;
  const referralData = await organization_services.add_referral(req.body);
  const userData = await user_services.findUser({ _id: Id });

  const payload = JSON.stringify({
    referralId: referralData._id,
    userId: Id,
    timestamp: Date.now(),
    type: invitationTokenType.Referral,
  });

  const inviteToken = await generateEncryptedToken(payload);
  const emailUrl = `${frontBaseUrl}/signup/${inviteToken}`;

  await referralInvitation({
    email: referral_email,
    invitation_link: emailUrl,
    user_name: userData.user_name,
  });

  const data = await organization_services.update_referral(
    { _id: referralData._id },
    { referral_token: inviteToken }
  );

  return response201(res, msg.referralSuccess, data);
});

const getReferrals = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id } = req.params;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
    added_by: Id,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const referralData = await organization_services.referral_list(
    { organization_id, is_deleted: false, added_by: Id },
    { __v: 0, updatedAt: 0 }
  );

  return response200(res, msg.fetch_success, referralData);
});

const getSubscriptionPlans = catchAsyncError(async (req, res) => {
  const data = await subscription_services.getAllSubscriptionPlan({
    is_deleted: false,
    is_active: true,
  });

  return response200(res, msg.fetch_success, data);
});

const addPaymentMethod = catchAsyncError(async (req, res) => {
  const { organization_id } = req.body;
  const Id = req.user;

  const paymentMethodData = await organization_services.get_payment_method_list(
    { organization_id, is_deleted: false }
  );
  if (!paymentMethodData?.length) req.body.is_primary = true;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
    added_by: Id,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  req.body.user_id = Id;

  const data = await organization_services.add_payment_method(req.body);

  return response201(res, msg.paymentMethodAdd, data);
});

const getPaymentMethods = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;
  const Id = req.user;

  const data = await organization_services.get_payment_method_list(
    { organization_id, user_id: Id, is_deleted: false },
    { updatedAt: 0, __v: 0 }
  );

  return response200(res, msg.fetch_success, data);
});

const updatePaymentMethod = catchAsyncError(async (req, res) => {
  const { payment_method_id } = req.body;

  const paymentMethodData = await organization_services.get_payment_method_list(
    { _id: payment_method_id, is_deleted: false }
  );

  if (!paymentMethodData?.length)
    return response400(res, msg.paymentMethodNotEXists);

  const data = await organization_services.update_payment_method(
    { _id: payment_method_id },
    req.body
  );

  return response200(res, msg.update_success, data);
});

const deletePaymentMethod = catchAsyncError(async (req, res) => {
  const { payment_method_id } = req.params;

  const paymentMethodData = await organization_services.get_payment_method_list(
    { _id: payment_method_id, is_deleted: false }
  );
  if (!paymentMethodData?.length)
    return response400(res, msg.paymentMethodNotEXists);

  await organization_services.update_payment_method(
    { _id: payment_method_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

const uploadMedia = catchAsyncError(async (req, res) => {
  const { organization_id } = req.body;
  const Id = req.user;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
    added_by: Id,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  req.body.added_by = Id;
  if (req.file) {
    const uploadedFile = await uploadVideoToCloudinary(
      req.file,
      `${CloudFolder}/${Id}/library/${organization_id}`
    );
    req.body.video_thumbnail = uploadedFile.thumbnailUrl;
    req.body.video_url = uploadedFile.videoUrl;
  }

  const data = await interactions_services.addLibrary(req.body);

  return response201(res, msg.libraryUpload, data);
});

const deleteMedia = catchAsyncError(async (req, res) => {
  const { media_id } = req.params;

  const mediaData = await interactions_services.getLibrary({
    _id: media_id,
    is_deleted: false,
  });

  if (!mediaData?.length) return response400(res, msg.notFound);

  await interactions_services.deleteLibrary({ _id: media_id });

  return response200(res, msg.mediaDelete, []);
});

module.exports = {
  addOrganization,
  getOrganizationList,
  getOrganizationDetails,
  updateOrganization,
  deleteOrganization,
  addMember,
  getMembers,
  updateMember,
  deleteMember,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  addReferral,
  getReferrals,
  getSubscriptionPlans,
  addPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  uploadMedia,
  deleteMedia,
};
