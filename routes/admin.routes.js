const { adminController } = require("../controller");
const { swaggerJoi } = require("../utils/joiToSwagger");
const { userValidation, validateRequest } = require("../utils/validations");
const subscriptionPlan = require("./adminRoutes/subscriptionPlan");
const router = require("express").Router();

router.post(
  "/login",

  swaggerJoi(userValidation.signInValidator),
  validateRequest(userValidation.signInValidator),
  adminController.adminSigning
);

router.use("/subscription-plan", subscriptionPlan);

module.exports = router;
