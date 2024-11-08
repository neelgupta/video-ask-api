const { adminController } = require("../../controller");
const router = require("express").Router();

router.get("/", adminController.getSubscriptionPlan);
router.post("/", adminController.postSubscriptionPlan);
router.put("/:id", adminController.updateSubscriptionPlan);
router.delete("/:id", adminController.deleteSubscriptionPlan);

module.exports = router;
