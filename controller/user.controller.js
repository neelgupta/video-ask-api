const catchAsyncError = require("../middleware/catchAsyncError");
const { response200, response400 } = require("../lib/response-messages");
const { msg, hashPassword, validatePassword, generateUUID, defaultOrganization, decryptToken, memberInvitationStatus, userType, memberRole } = require("../utils/constant");
const { user_services, organization_services } = require("../service");

// sign-up
const userSignup = catchAsyncError(async (req, res) => {
  let { email, password, memberId } = req.body;

  const user = await user_services.findUser({ email });
  if (user) return response400(res, msg.emailIsExists);

  req.body.user_type = userType.USER;
  req.body.is_member = false;
  req.body.member_role = memberRole.Admin;

  let memberData;
  if (memberId) {
    memberData = await organization_services.get_single_member({ _id: memberId, is_deleted: false });
    if (!memberData) return response400(res, msg.memberNotExists);

    if (memberData?.invitation_status === memberInvitationStatus.Completed) return response400(res, msg.memberIsAlreadyRegistered);

    if (memberData?.member_email !== email) {
      const organizationMemberUUID = generateUUID("ORG");
      const addMember = await organization_services.add_member({
        organization_id: memberData?.organization_id,
        member_uuid: organizationMemberUUID,
        member_name: req.body.user_name,
        member_email: email,
        member_role: memberData?.member_role,
      });

      if (addMember) memberId = addMember?._id
    }
    req.body.user_type = userType.MEMBER;
    req.body.is_member = true;
    req.body.member_role = memberData.member_role;
  }

  req.body.password = hashPassword(password);
  const userData = await user_services.registerUser(req.body);

  const organizationUUID = generateUUID("ORG");
  const organizationRequest = { organization_name: defaultOrganization, members: { userId: [userData._id], role: memberRole.Admin }, added_by: userData._id, organization_uuid: organizationUUID, }
  const organizationData = await organization_services.add_organization(organizationRequest);

  if (memberId && memberData) {
    await organization_services.update_member({ _id: memberId, }, { invitation_status: memberInvitationStatus.Completed, invitation_token: null });
    await organization_services.update_organization({ _id: memberData?.organization_id }, { $addToSet: { members: { userId: userData._id, role: memberRole.Member } } });
  } else {
    const organizationMemberUUID = generateUUID("ORG");
    await organization_services.add_member({
      organization_id: organizationData._id,
      member_uuid: organizationMemberUUID,
      member_name: req.body.user_name,
      member_email: email,
      member_role: memberRole.Admin,
      invitation_status: memberInvitationStatus.Completed,
      added_by: userData?._id,
    });
  }

  return response200(res, msg.signupSuccess, []);
});

// sign-in
const userSignIn = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const user = await user_services.findUser({ email });
  if (!user) return response400(res, msg.invalidCredentials);

  const validPassword = validatePassword(password, user.password);
  if (!validPassword) return response400(res, msg.invalidCredentials);

  const token = await user_services.create_jwt_token(user);
  return response200(res, msg.loginSuccess, { token, user });
});

// check valid invitation token
const checkInvitation = catchAsyncError(async (req, res) => {
  const { invitation_token } = req.body;

  const decryptedData = await decryptToken(invitation_token);

  if (!decryptedData.memberId && !decryptedData.userId) return response400(res, msg.invitationTokenInvalid);

  const memberData = await organization_services.get_single_member({ _id: decryptedData.memberId, is_deleted: false }, { __v: 0, updatedAt: 0 });
  if (!memberData) return response400(res, msg.memberNotExists);

  if (memberData.invitation_status === memberInvitationStatus.Completed) return response400(res, msg.invitationTokenExpired);

  return response200(res, msg.fetch_success, memberData);
});

// get profile Information
const getProfile = catchAsyncError(async (req, res) => {
  const Id = req.user;

  const profileDetails = await user_services.fetchUser({ _id: Id, is_deleted: false }, { password: 0, updatedAt: 0, __v: 0 });
  const organizationList = await organization_services.get_organization_list({ "members.userId": Id, is_deleted: false }, { members: 0, __v: 0, updatedAt: 0, });

  const response = { profile: profileDetails?.[0], organizations: organizationList };

  return response200(res, msg.fetch_success, response);
});

// change Password 
const changePassword = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { old_password, new_password } = req.body;

  const userData = await user_services.fetchUser({ is_deleted: false, _id: Id });

  const validPassword = validatePassword(old_password, userData?.[0]?.password);
  if (!validPassword) return response400(res, msg.oldPasswordWrong);

  const password = hashPassword(new_password);
  await user_services.updateUser({ _id: Id }, { password });

  return response200(res, msg.passwordChangeSuccess, []);
});

const updateProfile = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { user_name, email } = req.body;

  if (email) {
    const emailExists = await user_services.findUser({ _id: { $ne: Id }, email, is_deleted: false });
    if (emailExists) return response400(res, msg.emailIsExists);
  }

  await user_services.updateUser({ _id: Id, }, { user_name, email });

  return response200(res, msg.profileUpdateSuccess, []);
});

module.exports = {
  userSignup,
  userSignIn,
  checkInvitation,
  getProfile,
  changePassword,
  updateProfile,
};
