const { interactionsController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const { swaggerJoi } = require("../utils/joiToSwagger");
const { validateRequest, interactionsValidation } = require("../utils/validations");
const router = require("express").Router();

router.post("/add-folder", isAuthenticated, validateRequest(interactionsValidation.addFolderValidator), interactionsController.addFolder);
router.get("/get-folders/:organization_id", isAuthenticated, interactionsController.getFolderList);
router.put("/update-folder", isAuthenticated, validateRequest(interactionsValidation.updateFolderValidator), interactionsController.updateFolder);
router.delete("/delete-folder/:folder_id", isAuthenticated, interactionsController.deleteFolder);

// Interactions
router.post("/add-interactions", isAuthenticated, validateRequest(interactionsValidation.addInteractionValidator), interactionsController.createInteraction);

module.exports = router;
