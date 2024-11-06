const router = require("express").Router();
const { userController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const { userValidation, validateRequest } = require("../utils/validations");
const { swaggerJoi } = require("../utils/joiToSwagger");

router.post(
  "/sign-up",
  /* #swagger.tags = ['User']
     #swagger.description = 'User signup' */
  swaggerJoi(userValidation.signUpValidator),
  validateRequest(userValidation.signUpValidator),
  userController.userSignup
);

router.post(
  "/sign-in",
  validateRequest(userValidation.signInValidator),
  userController.userSignIn
);
router.put("/update", isAuthenticated, userController.updateOne);
router.get("/fetch-all", isAuthenticated, userController.fetchAll);
router.put("/update-all", isAuthenticated, userController.updateManyUser);
router.put(
  "/get-by-aggregation",
  isAuthenticated,
  userController.fetchAllAggregation
);
router.get("/fetch-post", isAuthenticated, userController.fetchAllPost);

module.exports = router;
