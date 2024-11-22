const { adminController } = require("../controller");
const { swaggerJoi } = require("../utils/joiToSwagger");
const { userValidation, validateRequest, adminValidation } = require("../utils/validations");
const router = require("express").Router();

router.post("/login",
  swaggerJoi(userValidation.signInValidator),
  validateRequest(userValidation.signInValidator),
  adminController.adminSigning
);

router.post("/add-subscription-plan", validateRequest(adminValidation.addPlanValidator), adminController.addSubscriptionPlan);
router.get("/get-subscription-plan", adminController.getSubscriptionPlan);
router.post("/update-subscription-plan", validateRequest(adminValidation.updatePlanValidator), adminController.updateSubscriptionPlan);
router.post("/delete-subscription-plan/:id", adminController.deleteSubscriptionPlan);


module.exports = router;
