const router = require("express").Router();

const userRoutes = require("./user.routes");
const adminRoutes = require("./admin.routes");
const contactRoutes = require("./contact.routes");
const interactionsRoutes = require("./interaction.routes");
const dashboardRoutes = require("./dashboard.routes");
const notificationRoutes = require("./notification.routes");
const templateRoutes = require("./template.routes");

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/contact", contactRoutes);
router.use("/interactions", interactionsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notification", notificationRoutes);
router.use("/template", templateRoutes);

module.exports = router;
