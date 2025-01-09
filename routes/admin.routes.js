const { adminController } = require("../controller");
const { isAuthenticated, isAuthenticatedUser } = require("../middleware/auth");
const { swaggerJoi } = require("../utils/joiToSwagger");
const {
  userValidation,
  validateRequest,
  adminValidation,
} = require("../utils/validations");
const router = require("express").Router();

router.post(
  "/login",
  swaggerJoi(userValidation.signInValidator),
  validateRequest(userValidation.signInValidator),
  adminController.adminSigning
);

router.get(
  "/get-subscription-plans",
  isAuthenticated,
  isAuthenticatedUser("admin"),
  adminController.getAllSubscriptionPlan
);

router.post(
  "/add-subscription-plan",
  isAuthenticated,
  isAuthenticatedUser("admin"),
  validateRequest(adminValidation.addPlanValidator),
  adminController.addSubscriptionPlan
);

router.put(
  "/update-subscription-plan",
  isAuthenticated,
  isAuthenticatedUser("admin"),
  validateRequest(adminValidation.updatePlanValidator),
  adminController.updateSubscriptionPlan
);

router.delete(
  "/delete-subscription-plan/:plan_id",
  isAuthenticated,
  isAuthenticatedUser("admin"),
  adminController.deleteSubscriptionPlan
);

module.exports = router;
