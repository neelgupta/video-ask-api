const router = require("express").Router();

const { validateRequest, contactValidation } = require("../utils/validations");
const {
  contactController,
  notificationController,
  templateController,
} = require("../controller");
const { isAuthenticated } = require("../middleware/auth");

router.post("/add-shard-template", templateController.addShardTemplate);
router.post("/copy-template", isAuthenticated, templateController.copyTemplate);
router.get(
  "/get-template/:interaction_id",
  isAuthenticated,
  templateController.getTemplate
);

module.exports = router;
