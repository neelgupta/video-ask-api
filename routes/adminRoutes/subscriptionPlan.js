const { adminController } = require("../../controller");
const router = require("express").Router();

router.post("/", adminController.postSubscriptionPlan);
router.get("/", adminController.getSubscriptionPlan);
router.put("/:id", adminController.updateSubscriptionPlan);
router.delete("/:id", adminController.deleteSubscriptionPlan);

module.exports = router;
