const { dashboardController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const router = require("express").Router();

router.get(
  "/dashboard-count/:organization_id",
  isAuthenticated,
  dashboardController.getDashboardCount
);

router.get(
  "/dashboard-contact/:organization_id",
  isAuthenticated,
  dashboardController.getDashboardContact
);

router.get(
  "/dashboard-interaction/:organization_id",
  isAuthenticated,
  dashboardController.getDashboardInteraction
);

module.exports = router;
