const router = require("express").Router();
const { userController, organizationController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const { userValidation, organizationValidation, validateRequest, profileValidation } = require("../utils/validations");
const { swaggerJoi } = require("../utils/joiToSwagger");
const j2s = require("joi-to-swagger")

router.post(
  "/sign-up",
  /* #swagger.tags = ['User']
     #swagger.description = 'User signup' */
  swaggerJoi(userValidation.signUpValidator),
  validateRequest(userValidation.signUpValidator),
  userController.userSignup
);

router.post("/invitation", validateRequest(userValidation.checkInvitationValidator), userController.checkInvitation);
router.post("/sign-in", validateRequest(userValidation.signInValidator), userController.userSignIn);


// profile
router.get("/profile", isAuthenticated, userController.getProfile);
router.put("/change-password", isAuthenticated, validateRequest(profileValidation.changePasswordValidator), userController.changePassword);
router.put("/update-profile", isAuthenticated, validateRequest(profileValidation.updateProfileValidator), userController.updateProfile);


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

const organizationSwaggerSchemas = (swaggerDoc) => {
  swaggerDoc.components.schemas.addOrganizationSwaggerSchema = j2s(organizationValidation.addOrganizationValidator).swagger;
  swaggerDoc.components.schemas.updateOrganizationSwaggerSchema = j2s(organizationValidation.updateOrganizationValidator).swagger;
  swaggerDoc.components.schemas.addOrganizationMemberSwaggerSchema = j2s(organizationValidation.addOrganizationMemberValidator).swagger;
  swaggerDoc.components.schemas.updateOrganizationMemberSwaggerSchema = j2s(organizationValidation.updateOrganizationMemberValidator).swagger;
  swaggerDoc.components.schemas.getOrganizationMemberSwaggerSchema = j2s(organizationValidation.getOrganizationMemberValidator).swagger;
};

module.exports = { organizationSwaggerSchemas };
module.exports = router;
