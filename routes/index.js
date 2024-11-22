const router = require("express").Router();

const userRoutes = require("./user.routes");
const adminRoutes = require("./admin.routes");
const contactRoutes = require("./contact.routes");

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/contact", contactRoutes);

module.exports = router