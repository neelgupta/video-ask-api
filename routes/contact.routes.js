const router = require("express").Router();

const { validateRequest, contactValidation } = require("../utils/validations");
const { contactController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");

router.post(
  "/add",
  isAuthenticated,
  validateRequest(contactValidation.addContactValidator),
  contactController.addContact
);

router.get(
  "/get-list/:organization_id",
  isAuthenticated,
  contactController.getContactList
);

router.put(
  "/update",
  isAuthenticated,
  validateRequest(contactValidation.updateContactValidator),
  contactController.updateContact
);

router.delete(
  "/delete/:contact_id",
  isAuthenticated,
  contactController.deleteContact
);

router.post(
  "/create-anonymous",
  isAuthenticated,
  validateRequest(contactValidation.createAnonymousContactValidator),
  contactController.createAnonymousContact
);

router.post(
  "/assign-anonymous",
  isAuthenticated,
  validateRequest(contactValidation.assignAnonymousContactValidator),
  contactController.assignContact
);

router.get(
  "/filter-contact/:organization_id",
  isAuthenticated,
  contactController.filterContact
);

router.get(
  "/contact-conversation/:contact_id",
  isAuthenticated,
  contactController.getContactConversation
);

router.delete(
  "/remove-conversation/:answer_id",
  isAuthenticated,
  contactController.deleteConversation
);

module.exports = router;
