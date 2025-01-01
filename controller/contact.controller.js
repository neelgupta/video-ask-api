const {
  response400,
  response201,
  response200,
} = require("../lib/response-messages");
const catchAsyncError = require("../middleware/catchAsyncError");
const { contact_services, organization_services } = require("../service");
const { msg, generateUUID } = require("../utils/constant");

const addContact = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { organization_id, contact_email, phone_number, country_code } =
    req.body;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const contactEmailExists = await contact_services.get_single_contact({
    organization_id,
    contact_email,
    is_deleted: false,
  });
  if (contactEmailExists) return response400(res, msg.emailIsExists);

  if (phone_number) {
    const phoneNumberExists = await contact_services.get_single_contact({
      organization_id,
      phone_number,
      is_deleted: false,
    });
    if (phoneNumberExists) return response400(res, msg.phoneExists);
  }

  req.body.contact_uuid = generateUUID("CON");
  req.body.added_by = Id;

  const data = await contact_services.add_contact(req.body);

  return response201(res, msg.contactAddSuccess, data);
});

const getContactList = catchAsyncError(async (req, res) => {
  const { organization_id } = req.params;
  const { type, search } = req.query;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  let matchQuery = { organization_id, is_deleted: false };
  let sortQuery = {};

  if (type === "recent") {
    sortQuery = { sort: { createdAt: -1 } };
  } else if (type === "favorites") {
    matchQuery = { ...matchQuery, is_favorite: true };
  }

  if (search) {
    matchQuery["$or"] = [
      { contact_name: { $regex: search, $options: "i" } },
      { contact_uuid: { $regex: search, $options: "i" } },
    ];
  }

  const contactCount = await contact_services.contact_count(matchQuery);

  const contactData = await contact_services.get_all_contacts(
    matchQuery,
    { __v: 0, updatedAt: 0 },
    sortQuery
  );

  const response = { count: contactCount, contactData };

  return response200(res, msg.fetch_success, response);
});

const updateContact = catchAsyncError(async (req, res) => {
  const {
    organization_id,
    contact_id,
    contact_email,
    phone_number,
    country_code,
  } = req.body;

  const organizationData = await organization_services.get_organization({
    _id: organization_id,
    is_deleted: false,
  });
  if (!organizationData) return response400(res, msg.organizationNotExists);

  const contactData = await contact_services.get_single_contact({
    _id: contact_id,
    is_deleted: false,
  });
  if (!contactData) return response400(res, msg.contactNotFound);

  if (contact_email) {
    const contactEmailExists = await contact_services.get_single_contact({
      _id: { $ne: contact_id },
      organization_id,
      contact_email,
      is_deleted: false,
    });
    if (contactEmailExists) return response400(res, msg.emailIsExists);
  }

  if (phone_number) {
    const phoneNumberExists = await contact_services.get_single_contact({
      _id: { $ne: contact_id },
      organization_id,
      phone_number,
      is_deleted: false,
    });
    if (phoneNumberExists) return response400(res, msg.phoneExists);
  }

  await contact_services.update_contact({ _id: contact_id }, req.body);

  return response200(res, msg.update_success, []);
});

const deleteContact = catchAsyncError(async (req, res) => {
  const { contact_id } = req.params;

  const contactData = await contact_services.get_single_contact({
    _id: contact_id,
    is_deleted: false,
  });
  if (!contactData) return response400(res, msg.contactNotFound);

  await contact_services.update_contact(
    { _id: contact_id },
    { is_deleted: true }
  );

  return response200(res, msg.delete_success, []);
});

module.exports = { addContact, getContactList, updateContact, deleteContact };
