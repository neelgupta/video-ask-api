const catchAsyncError = require("../middleware/catchAsyncError");
const {
  response200,
  response400,
  response201,
} = require("../lib/response-messages");
const {
  msg,
  hashPassword,
  validatePassword,
  generateUUID,
  defaultOrganization,
  decryptToken,
  memberInvitationStatus,
  userType,
  memberRole,
  invitationTokenType,
  generateResetPasswordToken,
  frontBaseUrl,
  defaultFolderName,
  subscriptionsStatus,
  addressType,
} = require("../utils/constant");
const {
  user_services,
  organization_services,
  interactions_services,
  subscription_services,
  stripe_service,
} = require("../service");
const { forgotPasswordMail } = require("../utils/emailTemplates");
const stripe = require("stripe")(
  "sk_test_51Mo53GSF7jse029jHMjdSJqH60MGgJZTO056vmY690KRkjdA2AtniAV9qJH4zcMaZTuVg8flAjGWVbTsSu7z1qrD00tKIJTDPd"
);

// sign-up
const userSignup = catchAsyncError(async (req, res) => {
  let { email, password, memberId, referralId } = req.body;

  const user = await user_services.findUser({ email, is_deleted: false });
  if (user) return response400(res, msg.emailIsExists);

  req.body.user_type = userType.USER;
  req.body.is_member = false;
  req.body.member_role = memberRole.Admin;

  let memberData;
  if (memberId) {
    memberData = await organization_services.get_single_member({
      _id: memberId,
      is_deleted: false,
    });
    if (!memberData) return response400(res, msg.memberNotExists);

    if (memberData?.invitation_status === memberInvitationStatus.Completed)
      return response400(res, msg.memberIsAlreadyRegistered);

    if (memberData?.member_email !== email) {
      const organizationMemberUUID = generateUUID("ORG");
      const addMember = await organization_services.add_member({
        organization_id: memberData?.organization_id,
        member_uuid: organizationMemberUUID,
        member_name: req.body.user_name,
        member_email: email,
        member_role: memberData?.member_role,
      });

      if (addMember) memberId = addMember?._id;
    }
    req.body.user_type = userType.MEMBER;
    req.body.is_member = true;
    req.body.member_role = memberData.member_role;
  }

  if (referralId) {
    const referralData = await organization_services.referral_list({
      _id: referralId,
      is_deleted: false,
    });
    if (referralData?.length) {
      await organization_services.update_referral(
        { _id: referralId },
        {
          referral_status: memberInvitationStatus.Completed,
          referral_token: null,
        }
      );
    }
  }

  req.body.password = hashPassword(password);
  const userData = await user_services.registerUser(req.body);

  const organizationUUID = generateUUID("ORG");
  const organizationRequest = {
    organization_name: defaultOrganization,
    members: { userId: [userData._id], role: memberRole.Admin },
    added_by: userData._id,
    organization_uuid: organizationUUID,
    branding: "flow-ai",
    language: "english",
    primary_color: "#7B5AFF",
    secondary_color: "#B3A1FF",
    background_color: "#FFFFFF",
    font: "Arial",
    border_radius: 10,
  };

  const organizationData = await organization_services.add_organization(
    organizationRequest
  );
  await interactions_services.add_folder({
    organization_id: organizationData._id,
    added_by: userData._id,
    folder_name: defaultFolderName,
    is_default: true,
  });

  if (memberId && memberData) {
    await organization_services.update_member(
      { _id: memberId },
      {
        invitation_status: memberInvitationStatus.Completed,
        invitation_token: null,
      }
    );
    await organization_services.update_organization(
      { _id: memberData?.organization_id },
      {
        $addToSet: {
          members: { userId: userData._id, role: memberRole.Member },
        },
      }
    );
  } else {
    const organizationMemberUUID = generateUUID("ORG");
    await organization_services.add_member({
      organization_id: organizationData._id,
      member_uuid: organizationMemberUUID,
      member_name: req.body.user_name,
      member_email: email,
      member_role: memberRole.Admin,
      invitation_status: memberInvitationStatus.Completed,
      added_by: userData?._id,
      is_parent: true,
    });
  }

  return response200(res, msg.signupSuccess, []);
});

// sign-in
const userSignIn = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const user = await user_services.findUser({ email, is_deleted: false });
  if (!user) return response400(res, msg.invalidCredentials);

  const validPassword = validatePassword(password, user.password);
  if (!validPassword) return response400(res, msg.invalidCredentials);

  const token = await user_services.create_jwt_token(user);
  return response200(res, msg.loginSuccess, { role: user.user_type, token });
});

// for got password
const forgotPassword = catchAsyncError(async (req, res) => {
  const { email } = req.body;

  const userData = await user_services.findUser({ email, is_deleted: false });

  if (!userData) return response400(res, msg.validMemberEmail);

  const { resetPasswordToken, resetPasswordExpires } =
    generateResetPasswordToken();

  const resetPasswordUrl = `${frontBaseUrl}/resetpassword/${resetPasswordToken}`;

  await forgotPasswordMail({
    email,
    name: userData.user_name,
    resetPasswordUrl,
  });

  await user_services.updateUser(
    { _id: userData._id },
    {
      reset_password_token: resetPasswordToken,
      reset_password_expires: resetPasswordExpires,
    }
  );

  return response200(res, msg.forgotPassword, []);
});

// reset Password
const resetPassword = catchAsyncError(async (req, res) => {
  const { resetPasswordToken, password } = req.body;

  const userData = await user_services.findUser({
    is_deleted: false,
    reset_password_token: resetPasswordToken,
    reset_password_expires: { $gt: Date.now() },
  });

  if (!userData) return response400(res, msg.invalidResetPasswordToken);

  const HashedPassword = hashPassword(password);

  await user_services.updateUser(
    { _id: userData._id },
    {
      password: HashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    }
  );

  return response200(res, msg.passwordRestSuccess);
});

// check valid invitation token
const checkInvitation = catchAsyncError(async (req, res) => {
  const { invitation_token } = req.body;

  const decryptedData = await decryptToken(invitation_token);

  if (
    decryptedData?.userId &&
    decryptedData?.type === invitationTokenType.Team_Member
  ) {
    if (!decryptedData?.memberId)
      return response400(res, msg.invitationTokenInvalid);

    const memberData = await organization_services.get_single_member(
      { _id: decryptedData.memberId, is_deleted: false },
      { __v: 0, updatedAt: 0 }
    );
    if (!memberData) return response400(res, msg.memberNotExists);

    if (memberData.invitation_status === memberInvitationStatus.Completed)
      return response400(res, msg.invitationTokenExpired);

    return response200(res, msg.fetch_success, memberData);
  } else if (
    decryptedData?.userId &&
    decryptedData?.type === invitationTokenType.Referral
  ) {
    if (!decryptedData?.referralId)
      return response400(res, msg.invitationTokenInvalid);

    const referralData = await organization_services.referral_list(
      { _id: decryptedData.referralId, is_deleted: false },
      { __v: 0, updatedAt: 0 }
    );
    const referral = referralData?.[0];
    if (!referral) return response400(res, msg.memberNotExists);

    if (referral.invitation_status === memberInvitationStatus.Completed)
      return response400(res, msg.invitationTokenExpired);

    return response200(res, msg.fetch_success, referral);
  } else {
    return response400(res, msg.invitationTokenInvalid);
  }
});

// get profile Information
const getProfile = catchAsyncError(async (req, res) => {
  const Id = req.user;

  const profileDetails = await user_services.fetchUser(
    { _id: Id, is_deleted: false },
    { password: 0, updatedAt: 0, __v: 0 },
    {
      path: "current_subscription_id",
      select: "subscription_plan_id start_date end_date",
    }
  );
  
  const organizationList = await organization_services.get_organization_list(
    { "members.userId": Id, is_deleted: false },
    { members: 0, __v: 0, updatedAt: 0 }
  );

  const response = {
    profile: profileDetails,
    organizations: organizationList,
  };

  return response200(res, msg.fetch_success, response);
});

// change Password
const changePassword = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { old_password, new_password } = req.body;

  const userData = await user_services.fetchUser({
    is_deleted: false,
    _id: Id,
  });

  const validPassword = validatePassword(old_password, userData?.[0]?.password);
  if (!validPassword) return response400(res, msg.oldPasswordWrong);

  const password = hashPassword(new_password);
  await user_services.updateUser({ _id: Id }, { password });

  return response200(res, msg.passwordChangeSuccess, []);
});

// update profile
const updateProfile = catchAsyncError(async (req, res) => {
  const Id = req.user;
  const { user_name, email } = req.body;

  if (email) {
    const emailExists = await user_services.findUser({
      _id: { $ne: Id },
      email,
      is_deleted: false,
    });
    if (emailExists) return response400(res, msg.emailIsExists);
  }

  await user_services.updateUser({ _id: Id }, { user_name, email });

  return response200(res, msg.profileUpdateSuccess, []);
});

// delete account
const deleteAccount = catchAsyncError(async (req, res) => {
  const userId = req.user;
  const { password } = req.body;

  const userData = await user_services.findUser({
    _id: userId,
    is_deleted: false,
  });

  const validPassword = validatePassword(password, userData.password);
  if (!validPassword) return response400(res, msg.invalidCredentials);

  await user_services.updateUser({ _id: userId }, { is_deleted: true });

  return response200(res, msg.accountDeleted, []);
});

// purchase subscription plan
const addSubscriptions = catchAsyncError(async (req, res) => {
  const userId = req.user;
  const {
    subscription_plan_id,
    plan_type,
    shipping_address_id,
    billing_address_id,
    payment_method_id,
    organization_id,
  } = req.body;

  const userData = await user_services.findUser({ _id: userId });

  if (userData?.current_subscription_id) {
    return response400(res, msg.alreadyActivePlan);
  }

  const shippingAddressData = await organization_services.get_address_details({
    _id: shipping_address_id,
    organization_id: organization_id,
    address_type: addressType.Shipping,
    user_id: userId,
    is_deleted: false,
  });

  if (!shippingAddressData) return response400(res, msg.validShippingAddress);

  const billingAddressData = await organization_services.get_address_details({
    _id: billing_address_id,
    organization_id: organization_id,
    address_type: addressType.Billing,
    user_id: userId,
    is_deleted: false,
  });

  if (!billingAddressData) return response400(res, msg.validBillingAddress);

  const paymentMethodData = await organization_services.get_payment_method({
    _id: payment_method_id,
    is_deleted: false,
  });

  if (!paymentMethodData) return response400(res, msg.invalidPaymentMethod);

  const planData = await subscription_services.findPlanById({
    _id: subscription_plan_id,
    is_deleted: false,
  });

  if (!planData) return response400(res, msg.planNotExists);

  const customerId = userData.customer_id;

  const priceId = planData.stripe_price_id;
  const stripePaymentMethodId = paymentMethodData?.stripe_payment_method_id;

  const purchase = await stripe_service.createSubscription(
    customerId,
    stripePaymentMethodId,
    priceId
  );
  if (!purchase?.clientSecret) {
    return response400(res, msg.paymentFailedOrIncomplete);
  }

  const { subscription, clientSecret } = purchase;

  const { latest_invoice, status } = subscription;

  const subscriptionsId = subscription?.id;
  const startDate = subscription?.current_period_start;
  const endDate = subscription?.current_period_end;
  const paymentIntentId = latest_invoice?.payment_intent?.id;
  const amount = latest_invoice?.payment_intent?.amount;
  const invoiceId = latest_invoice?.id;
  const startD = new Date(startDate * 1000);
  const endD = new Date(endDate * 1000);
  const startIsoString = startD.toISOString();
  const endIsoString = endD.toISOString();

  const data = await user_services.purchase_subscription({
    user_id: userId,
    subscription_plan_id: subscription_plan_id,
    payment_method_id: paymentMethodData?._id,
    stripe_client_secret: clientSecret,
    stripe_subscription_id: subscriptionsId,
    stripe_invoice_id: invoiceId,
    stripe_payment_intent: paymentIntentId,
    stripe_payment_method_id: stripePaymentMethodId,
    amount,
    currency: planData?.currency,
    plan_type: plan_type,
    start_date: startIsoString,
    end_date: endIsoString,
    status: status,
    shipping_address_id,
    billing_address_id,
  });

  // await user_services.updateUser(
  //   { _id: userId },
  //   { current_subscription_id: data._id }
  // );

  const response = {
    clientSecret: clientSecret,
    currentSubscription: data._id,
  };

  return response201(res, msg.clientSecretSuccess, response);
});

const handleConfirmStripePayment = catchAsyncError(async (req, res) => {
  const userId = req.user;
  const { clientSecret, currentSubscription, status } = req.body;

  const currentSubscriptionData = await user_services.get_subscriptions({
    _id: currentSubscription,
    user_id: userId,
    stripe_client_secret: clientSecret,
    status: subscriptionsStatus.incomplete,
  });

  if (!currentSubscriptionData) {
    return response400(res, msg.clientSecretIsWrong);
  }

  const stripeSubscriptionData =
    await stripe_service.retrieve_stripe_subscription(
      currentSubscriptionData.stripe_subscription_id
    );
  if (stripeSubscriptionData?.status === subscriptionsStatus.active) {
    return response400(res, msg.planAlreadyPurchase);
  }

  await user_services.update_subscription(
    { _id: currentSubscription },
    { status }
  );

  await user_services.updateUser(
    { _id: userId },
    { current_subscription_id: currentSubscription }
  );

  return response200(res, msg.planPurchaseSuccess, []);
});

// handle webhooks which is connected with customer and subscription
const handleWebhook = catchAsyncError(async (req, res) => {
  const sig = req.headers["stripe-signature"]; // Get Stripe signature header
  let event;
  const endpointSecret = "whsec_cQstXsFBdE0rahN3CVHf7BP7Ov7c6kbA";
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log("🚀 ~ handleWebhook ~ err.message:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const stripeWebHook = await stripe_service.webHookService(event);

  return response200(res, msg.fetch_success, []);
});

module.exports = {
  userSignup,
  userSignIn,
  forgotPassword,
  resetPassword,
  checkInvitation,
  getProfile,
  changePassword,
  updateProfile,
  deleteAccount,
  addSubscriptions,
  handleConfirmStripePayment,
  handleWebhook,
};
