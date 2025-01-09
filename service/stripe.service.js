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
    return error;
  }
};

const createSubscription = async (payload) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: payload.customerId,
      items: [{ price: payload.priceId }],
      expand: ["latest_invoice.payment_intent"], // Expands to include payment details
    });
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
