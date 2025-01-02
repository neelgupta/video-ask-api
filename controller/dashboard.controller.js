const { response200 } = require("../lib/response-messages");
const catchAsyncError = require("../middleware/catchAsyncError");
const { interactions_services, contact_services } = require("../service");
const { msg } = require("../utils/constant");

const getDashboardCount = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;
  const resData = {
    landed: 0,
    completed: 0,
    contacts_collected: 0,
  };

  const interactions = await interactions_services.get_all_interaction(
    organization_id
  );

  const contacts = await interactions_services.get_all_contact({
    organization_id: organization_id,
    is_deleted: false,
  });

  if (contacts.length > 0) {
    resData.contacts_collected = contacts?.length || 0;
  }

  if (interactions.length > 0) {
    const landed = await interactions_services.get_all_answer(interactions, {});
    const completed = await interactions_services.get_all_answer(interactions, {
      is_completed_interaction: true,
    });

    resData.landed = landed?.length || 0;
    resData.completed = completed?.length || 0;
  }

  return response200(res, msg.fetchSuccessfully, resData);
});

const getDashboardContact = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;

  const matchQuery = { organization_id, is_deleted: false };

  const contactData = await contact_services.get_all_contacts(
    matchQuery,
    { __v: 0, updatedAt: 0 },
    { sort: { createdAt: -1 }, limit: 5 }
  );

  return response200(res, msg.fetchSuccessfully, contactData);
});

const getDashboardInteraction = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;
  const { search } = req.query;

  const limit = parseInt(req.query?.limit || "5");
  const skip = parseInt(req.query?.page || "0") * limit;

  const interactions =
    await interactions_services.get_dashboard_recent_interaction(
      organization_id,
      search,
      skip,
      limit
    );

  return response200(res, msg.fetchSuccessfully, interactions?.[0]);
});

module.exports = {
  getDashboardCount,
  getDashboardContact,
  getDashboardInteraction,
};
