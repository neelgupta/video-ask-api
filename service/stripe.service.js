const stripe = require("stripe")(
  "sk_test_51Mo53GSF7jse029jHMjdSJqH60MGgJZTO056vmY690KRkjdA2AtniAV9qJH4zcMaZTuVg8flAjGWVbTsSu7z1qrD00tKIJTDPd"
);
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");
const mongoose = require("mongoose");

// for create customer in the stripe
const createCustomer = async (payload) => {
  try {
    const { name, email, shippingAddress } = payload;

    const customer = await stripe.customers.create({
      name: name,
      email: email,
      shipping: {
        name: name,
        address: {
          line1: shippingAddress?.line1,
          line2: shippingAddress?.line2,
          // city: "surat",
          state: shippingAddress?.state,
          postal_code: shippingAddress?.postal_code,
          country: shippingAddress?.country,
        },
      },
    });

    return customer;
  } catch (error) {
    console.log("🚀 ~ createCustomer ~ error:", error);
    return error;
  }
};

// for create product (subscription plan) in stripe
const createStripePlan = async (payload) => {
  try {
    const product = await stripe.products.create({
      name: payload.name,
    });
    return product;
  } catch (error) {
    return error;
  }
};

// for get subscription plans
const getStripePlan = async (planId) => {
  try {
    return await stripe.products.retrieve(planId);
  } catch (error) {
    return error;
  }
};

// for update subscription plan details
const updateStripePlan = async (planId, payload) => {
  try {
    const product = await stripe.products.update(planId, payload);
    return product;
  } catch (error) {
    return error;
  }
};

// for remove Subscription Plan
const removeSubscriptionPlan = async (planId) => {
  try {
    const subscription = await stripe.products.del(planId);
    return subscription;
  } catch (error) {
    return error;
  }
};

// for create subscription plan price
const createStripePrice = async (payload) => {
  try {
    const price = await stripe.prices.create({
      product: payload.product_id,
      currency: payload.currency,
      unit_amount: payload.amount,
      recurring: {
        interval: "month",
        interval_count: 1,
      },
      // product_data: {
      //   name: "Gold Plan",
      // },
    });
    return price;
  } catch (error) {
    console.log("🚀 ~ createStripePrice ~ error:", error);
    return error;
  }
};

// for get subscription stripe
const getStripePrice = async (priceId) => {
  try {
    return await stripe.prices.retrieve(priceId);
  } catch (error) {
    return error;
  }
};

// for update subscription price
const updateStripePrice = async (priceId, payload) => {
  try {
    const price = await stripe.prices.update(priceId, {
      metadata: {
        order_id: "6735",
      },
    });
    return price;
  } catch (error) {
    return error;
  }
};

const generatePaymentMethod = async (payload) => {
  try {
    const { cardNumber, cardMonth, cardYear, cardCVC, billing_details } =
      payload;

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber,
        exp_month: cardMonth,
        exp_year: cardYear,
        cvc: cardCVC,
      },
      billing_details: {
        address: {
          line1: billing_details?.line1,
          line2: billing_details?.line2,
          // city: billing_details.line1,
          state: billing_details?.state,
          postal_code: billing_details?.postal_code,
          country: billing_details?.country,
        },
      },
    });

    return paymentMethod;
  } catch (error) {
    console.log("🚀 ~ generatePaymentMethod ~ error:", error);
    return error;
  }
};

const createSubscription = async (customerId, paymentMethodId, priceId) => {
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the payment method as default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      default_payment_method: paymentMethodId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    const paymentIntent = subscription?.latest_invoice?.payment_intent;

    if (paymentIntent?.status === "requires_confirmation") {
      const confirmedIntent = await stripe.paymentIntents.confirm(
        paymentIntent.id
      );

      if (confirmedIntent.status === "succeeded") {
        console.log("Payment succeeded, subscription is active.");
        // Fetch the updated subscription status
        const updatedSubscription = await stripe.subscriptions.retrieve(
          subscription.id
        );
        return updatedSubscription;
      } else if (confirmedIntent.status === "requires_action") {
        console.log("Additional action required for payment confirmation.");
        // const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id,{
        //   payment_method: 'pm_card_visa',
        // });
        return {
          subscription,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
        };
      } else {
        console.error("Payment failed or incomplete:", confirmedIntent.status);
        throw new Error("Payment failed or incomplete.");
      }
    }

    return subscription;
  } catch (error) {
    console.log("🚀 ~ createSubscription ~ error:", error);
    return error;
  }
};

const retrieve_stripe_subscription = async (subscriptionId) => {
  try {
    const data = await stripe.subscriptions.retrieve(subscriptionId);
    return data;
  } catch (error) {
    return error;
  }
};

const update_stripe_subscription = async (subscriptionId, payload) => {
  try {
    const data = await stripe.subscriptions.update(subscriptionId, payload);
    return data;
  } catch (error) {
    return error;
  }
};

const webHookService = async (event) => {
  try {
    console.log("inside the webhook");
    // Handle the event using a switch case
    // const { type, data } = event;

    switch (event.type) {
      case "customer.created":
        const customerCreated = event.data.object;
        // Then define and call a function to handle the event customer.created
        break;
      case "customer.deleted":
        const customerDeleted = event.data.object;
        // Then define and call a function to handle the event customer.deleted
        break;
      case "customer.updated":
        const customerUpdated = event.data.object;
        // Then define and call a function to handle the event customer.updated
        break;
      case "customer.subscription.created":
        // Then define and call a function to handle the event customer.subscription.created
        const customerSubscriptionCreated = event.data.object;
        console.log(
          "🚀 ~ webHookService ~ customerSubscriptionCreated:==================================>",
          customerSubscriptionCreated
        );
        break;
      case "customer.subscription.deleted":
        const customerSubscriptionDeleted = event.data.object;
        // Then define and call a function to handle the event customer.subscription.deleted
        break;
      case "customer.subscription.paused":
        const customerSubscriptionPaused = event.data.object;
        // Then define and call a function to handle the event customer.subscription.paused
        break;
      case "customer.subscription.pending_update_applied":
        const customerSubscriptionPendingUpdateApplied = event.data.object;
        // Then define and call a function to handle the event customer.subscription.pending_update_applied
        break;
      case "customer.subscription.pending_update_expired":
        const customerSubscriptionPendingUpdateExpired = event.data.object;
        // Then define and call a function to handle the event customer.subscription.pending_update_expired
        break;
      case "customer.subscription.resumed":
        const customerSubscriptionResumed = event.data.object;
        // Then define and call a function to handle the event customer.subscription.resumed
        break;
      case "customer.subscription.updated":
        const customerSubscriptionUpdated = event.data.object;
        // Then define and call a function to handle the event customer.subscription.updated
        break;
      case "subscription_schedule.aborted":
        const subscriptionScheduleAborted = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.aborted
        break;
      case "subscription_schedule.canceled":
        const subscriptionScheduleCanceled = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.canceled
        break;
      case "subscription_schedule.completed":
        const subscriptionScheduleCompleted = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.completed
        break;
      case "subscription_schedule.created":
        const subscriptionScheduleCreated = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.created
        break;
      case "subscription_schedule.expiring":
        const subscriptionScheduleExpiring = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.expiring
        break;
      case "subscription_schedule.released":
        const subscriptionScheduleReleased = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.released
        break;
      case "subscription_schedule.updated":
        const subscriptionScheduleUpdated = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.updated
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event?.data?.object; // contains the payment intent object
        console.log("PaymentIntent was successful:", paymentIntent);
        if (paymentIntent) {
          const {
            customer,
            client_secret,
            id,
            latest_charge,
            status,
            created,
          } = paymentIntent;

          const userData = await mongoService.findOne(modelName.USER, {
            customer_id: customer,
            is_deleted: false,
          });

          if (userData) {
            console.log("inside the userData")
            const subscriptionData = await mongoService.findOne(
              modelName.SUBSCRIPTIONS,
              {
                user_id: userData?._id,
                stripe_payment_intent: id,
                stripe_client_secret: client_secret,
              }
            );

            if (subscriptionData) {
              console.log("inside the subscription plan",subscriptionData)
              await mongoService.updateOne(
                modelName.SUBSCRIPTIONS,
                {
                  user_id: userData?._id,
                  stripe_payment_intent: id,
                  stripe_client_secret: client_secret,
                },
                {
                  status,
                  stripe_charge_id: latest_charge,
                }
              );

              await mongoService.updateOne(
                modelName.USER,
                { _id: userData?._id },
                { current_subscription_id: subscriptionData?._id }
              );
            }
          }
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

module.exports = {
  createCustomer,
  createStripePlan,
  getStripePlan,
  updateStripePlan,
  removeSubscriptionPlan,
  createStripePrice,
  getStripePrice,
  updateStripePrice,
  generatePaymentMethod,
  createSubscription,
  retrieve_stripe_subscription,
  webHookService,
  update_stripe_subscription,
};
