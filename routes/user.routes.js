const router = require("express").Router();
const { userController, organizationController } = require("../controller");
const { isAuthenticated, isAuthenticatedUser } = require("../middleware/auth");
const {
  userValidation,
  organizationValidation,
  validateRequest,
  validateFormData,
  profileValidation,
} = require("../utils/validations");
const { swaggerJoi } = require("../utils/joiToSwagger");
const j2s = require("joi-to-swagger");
const { uploadFile, multerErrorHandler } = require("../lib/uploader/upload");

router.post(
  "/sign-up",
  /* #swagger.tags = ['User']
     #swagger.description = 'User signup' */
  swaggerJoi(userValidation.signUpValidator),
  validateRequest(userValidation.signUpValidator),
  userController.userSignup
);

router.post(
  "/invitation",
  validateRequest(userValidation.checkInvitationValidator),
  userController.checkInvitation
);
router.post(
  "/sign-in",
  validateRequest(userValidation.signInValidator),
  userController.userSignIn
);
router.post(
  "/forgot-password",
  validateRequest(userValidation.forgotPasswordValidator),
  userController.forgotPassword
);
router.post(
  "/reset-password",
  validateRequest(userValidation.resetPasswordValidator),
  userController.resetPassword
);

// profile
router.get("/profile", isAuthenticated, userController.getProfile);
router.put(
  "/change-password",
  isAuthenticated,
  validateRequest(profileValidation.changePasswordValidator),
  userController.changePassword
);
router.put(
  "/update-profile",
  isAuthenticated,
  validateRequest(profileValidation.updateProfileValidator),
  userController.updateProfile
);
router.post(
  "/delete-account",
  isAuthenticated,
  validateRequest(userValidation.deleteAccountValidator),
  userController.deleteAccount
);

// organization routes
router.post(
  "/add-organization",
  isAuthenticated,
  validateRequest(organizationValidation.addOrganizationValidator),
  organizationController.addOrganization
);
router.get(
  "/get-my-organizations",
  isAuthenticated,
  organizationController.getOrganizationList
);
router.get(
  "/organization/:Id",
  isAuthenticated,
  organizationController.getOrganizationDetails
);
router.put(
  "/update-organization",
  isAuthenticated,
  validateRequest(organizationValidation.updateOrganizationValidator),
  organizationController.updateOrganization
);
router.delete(
  "/delete-organization/:organization_id",
  isAuthenticated,
  organizationController.deleteOrganization
);

// Library
router.post(
  "/upload-media",
  isAuthenticated,
  uploadFile.single("media"),
  multerErrorHandler,
  validateFormData(organizationValidation.uploadMediaValidator),
  organizationController.uploadMedia
);

router.delete(
  "/delete-media/:media_id",
  isAuthenticated,
  organizationController.deleteMedia
);

// organization member routes
router.post(
  "/add-member",
  isAuthenticated,
  validateRequest(organizationValidation.addOrganizationMemberValidator),
  organizationController.addMember
);
router.get(
  "/get-member-list/:organization_id",
  isAuthenticated,
  validateRequest(organizationValidation.getOrganizationMemberValidator),
  organizationController.getMembers
);
router.put(
  "/update-member",
  isAuthenticated,
  validateRequest(organizationValidation.updateOrganizationMemberValidator),
  organizationController.updateMember
);
router.delete(
  "/delete-member/:member_id",
  isAuthenticated,
  organizationController.deleteMember
);

// address routes
router.post(
  "/add-address",
  isAuthenticated,
  validateRequest(organizationValidation.addAddressValidator),
  organizationController.addAddress
);
router.get(
  "/get-address-list",
  isAuthenticated,
  organizationController.getAddresses
);
router.put(
  "/update-address",
  isAuthenticated,
  validateRequest(organizationValidation.updateAddressValidator),
  organizationController.updateAddress
);
router.delete(
  "/delete-address/:address_id",
  isAuthenticated,
  organizationController.deleteAddress
);

// payment method routes
router.post(
  "/add-payment_method",
  isAuthenticated,
  validateRequest(organizationValidation.addPaymentMethodValidator),
  organizationController.addPaymentMethod
);
router.get(
  "/get-payment_methods/:organization_id",
  isAuthenticated,
  organizationController.getPaymentMethods
);
router.put(
  "/update-payment-method",
  isAuthenticated,
  validateRequest(organizationValidation.updatePaymentMethodValidator),
  organizationController.updatePaymentMethod
);
router.delete(
  "/delete-payment-method/:payment_method_id",
  isAuthenticated,
  organizationController.deletePaymentMethod
);

// referral routes
router.post(
  "/add-referrals",
  isAuthenticated,
  validateRequest(organizationValidation.addReferralValidator),
  organizationController.addReferral
);
router.get(
  "/get-referrals/:organization_id",
  isAuthenticated,
  organizationController.getReferrals
);

// get Subscription plans
router.get(
  "/get-plans",
  isAuthenticated,
  organizationController.getSubscriptionPlans
);

router.post(
  "/purchase-plan",
  isAuthenticated,
  isAuthenticatedUser("user"),
  validateRequest(userValidation.addSubscriptionsValidator),
  userController.addSubscriptions
);

const organizationSwaggerSchemas = (swaggerDoc) => {
  swaggerDoc.components.schemas.addOrganizationSwaggerSchema = j2s(
    organizationValidation.addOrganizationValidator
  ).swagger;
  swaggerDoc.components.schemas.updateOrganizationSwaggerSchema = j2s(
    organizationValidation.updateOrganizationValidator
  ).swagger;
  swaggerDoc.components.schemas.addOrganizationMemberSwaggerSchema = j2s(
    organizationValidation.addOrganizationMemberValidator
  ).swagger;
  swaggerDoc.components.schemas.updateOrganizationMemberSwaggerSchema = j2s(
    organizationValidation.updateOrganizationMemberValidator
  ).swagger;
  swaggerDoc.components.schemas.getOrganizationMemberSwaggerSchema = j2s(
    organizationValidation.getOrganizationMemberValidator
  ).swagger;
};

module.exports = { organizationSwaggerSchemas };
module.exports = router;
