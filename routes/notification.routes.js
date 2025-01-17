const router = require("express").Router();

const { validateRequest, contactValidation } = require("../utils/validations");
const { contactController, notificationController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");

router.get(
  "/get-team-invitation",
  isAuthenticated,
  notificationController.getTeamInvitation
);

router.put(
  "/update-team-status",
  isAuthenticated,
  notificationController.updateTeamInvitation
);

router.put(
  "/leave-team",
  isAuthenticated,
  notificationController.leaveInvitation
);
module.exports = router;
