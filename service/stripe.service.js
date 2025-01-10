const stripe = require("stripe")(
  "sk_test_51Mo53GSF7jse029jHMjdSJqH60MGgJZTO056vmY690KRkjdA2AtniAV9qJH4zcMaZTuVg8flAjGWVbTsSu7z1qrD00tKIJTDPd"
);

// for create customer in the stripe
const createCustomer = async (payload) => {
  try {
    const customer = await stripe.customers.create({
      email: payload.email,
    });
    return customer;
  } catch (error) {
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
    console.log("product", product);
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
    const { cardNumber, cardMonth, cardYear, cardCVC } = payload;
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber,
        exp_month: cardMonth,
        exp_year: cardYear,
        cvc: cardCVC,
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
      items: [{ price: priceId }], // The price_id for the plan
      payment_behavior: "default_incomplete", // Create subscription with incomplete status
      expand: ["latest_invoice.payment_intent"], // Expand to include the payment intent
    });

    const paymentIntent = subscription?.latest_invoice?.payment_intent;
    // const clientSecret = subscription;
    // console.log("🚀 ~ createSubscription ~ clientSecret:", clientSecret)

    if (paymentIntent?.status === "requires_confirmation") {
      const confirmedIntent = await stripe.paymentIntents.confirm(
        paymentIntent.id
      );
      // console.log(
      //   "🚀 ~ createSubscription ~ confirmedIntent:",
      //   confirmedIntent
      // );

      if (confirmedIntent.status === "succeeded") {
        console.log("Payment succeeded, subscription is active.");
        // Fetch the updated subscription status
        const updatedSubscription = await stripe.subscriptions.retrieve(
          subscription.id
        );
        return updatedSubscription;
      } else if (confirmedIntent.status === "requires_action") {
        console.log("Additional action required for payment confirmation.");
        const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id,{
          payment_method: 'pm_card_visa',
          // return_url: 'https://www.example.com',
        });
        console.log("🚀 ~ createSubscription ~ confirmedIntent:", confirmedIntent)
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
};
