const router = require("express").Router();
const { userController, organizationController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const { userValidation, organizationValidation, validateRequest } = require("../utils/validations");
const { swaggerJoi } = require("../utils/joiToSwagger");

router.post(
  "/sign-up",
  /* #swagger.tags = ['User']
     #swagger.description = 'User signup' */
  swaggerJoi(userValidation.signUpValidator),
  validateRequest(userValidation.signUpValidator),
  userController.userSignup
);

router.post("/sign-in", validateRequest(userValidation.signInValidator), userController.userSignIn);

// organization routes
router.post("/add-organization", isAuthenticated, validateRequest(organizationValidation.addOrganizationValidator), organizationController.addOrganization);
router.get("/get-my-organizations", isAuthenticated, organizationController.getOrganizationList);
router.put("/update-organization", isAuthenticated, validateRequest(organizationValidation.updateOrganizationValidator), organizationController.updateOrganization);
router.delete("/delete-organization/:organization_id", isAuthenticated, organizationController.deleteOrganization);

// organization member routes
router.post("/add-member", isAuthenticated, validateRequest(organizationValidation.addOrganizationMemberValidator), organizationController.addMember);
router.get("/get-member-list/:organization_id", isAuthenticated, validateRequest(organizationValidation.getOrganizationMemberValidator), organizationController.getMembers);
router.put("/update-member", isAuthenticated, validateRequest(organizationValidation.updateOrganizationMemberValidator), organizationController.updateMember);
router.delete("/delete-member/:member_id", isAuthenticated, organizationController.deleteMember);


module.exports = router;
