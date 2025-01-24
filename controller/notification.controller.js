const { default: mongoose } = require("mongoose");
const {
  response400,
  response201,
  response200,
} = require("../lib/response-messages");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  notification_service,
  user_services,
  organization_services,
} = require("../service");
const { msg } = require("../utils/constant");

const getTeamInvitation = catchAsyncError(async (req, res) => {
  const user_id = req.user;

  const user = await user_services.findUser({
    _id: user_id,
    is_deleted: false,
  });

  if (!user) return response400(res, "User not found!");

  const notification = await notification_service.get_team_invitation(
    user.email
  );

  return response200(res, msg.fetch_success, notification);
});

const updateTeamInvitation = catchAsyncError(async (req, res) => {
  const { member_id, invitation_status } = req.body;
  const user_id = req.user;

  const member = await organization_services.find_member({ _id: member_id });
  if (!member) response400(res, "Member is not found!.");

  const user = await user_services.findUser({ _id: user_id });
  if (!user) response400(res, "User is not found!.");

  const organization = await organization_services.get_organization_list({
    "members.userId": member.added_by,
  });

  if (organization.length > 0 && invitation_status !== "reject") {
    await organization_services.update_organization(
      { _id: organization?.[0]._id },
      { $push: { members: { userId: user_id, role: member?.member_role } } }
    );
  }

  await organization_services.update_member(
    { _id: member_id },
    { invitation_status }
  );

  return response200(res, msg.update_success, []);
});

const leaveInvitation = catchAsyncError(async (req, res) => {
  const { member_id, organization_id } = req.body;
  const user_id = req.user;

  const member = await organization_services.find_member({ _id: member_id });
  if (!member) response400(res, "Member is not found!.");

  const user = await user_services.findUser({ _id: user_id });
  if (!user) response400(res, "User is not found!.");

  await organization_services.update_organization(
    { _id: organization_id },
    { $pull: { members: { userId: user_id, role: member?.member_role } } }
  );

  await organization_services.update_member(
    { _id: member_id },
    { invitation_status: "leave" }
  );

  return response200(res, msg.update_success, []);
});

module.exports = {
  getTeamInvitation,
  updateTeamInvitation,
  leaveInvitation,
};
