const { dashboardController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const router = require("express").Router();

router.get(
  "/dashboard-count/:organization_id",
  isAuthenticated,
  dashboardController.getDashboardCount
);

module.exports = router;
