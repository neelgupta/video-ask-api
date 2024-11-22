const router = require("express").Router();

const { validateRequest, contactValidation } = require("../utils/validations");
const { contactController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");

router.post("/add", isAuthenticated, validateRequest(contactValidation.addContactValidator), contactController.addContact);
router.get("/get-list/:organization_id", isAuthenticated, contactController.getContactList);
router.put("/update", isAuthenticated, validateRequest(contactValidation.updateContactValidator), contactController.updateContact);
router.delete("/delete/:contact_id", isAuthenticated, contactController.deleteContact);

module.exports = router;