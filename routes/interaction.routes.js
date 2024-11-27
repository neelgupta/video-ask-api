const { interactionsController } = require("../controller");
const { multerErrorHandler, uploadFile } = require("../lib/uploader/upload");
const { isAuthenticated } = require("../middleware/auth");
const { swaggerJoi } = require("../utils/joiToSwagger");
const { validateRequest, interactionsValidation, validateFormData } = require("../utils/validations");
const router = require("express").Router();

router.post("/add-folder", isAuthenticated, validateRequest(interactionsValidation.addFolderValidator), interactionsController.addFolder);
router.get("/get-folders/:organization_id", isAuthenticated, interactionsController.getFolderList);
router.put("/update-folder", isAuthenticated, validateRequest(interactionsValidation.updateFolderValidator), interactionsController.updateFolder);
router.delete("/delete-folder/:folder_id", isAuthenticated, interactionsController.deleteFolder);

// Interactions
router.post("/add-interactions", isAuthenticated, validateRequest(interactionsValidation.addInteractionValidator), interactionsController.createInteraction);
router.get("/get-interactions/:folder_id", isAuthenticated, interactionsController.getInteractionList);
router.put("/update-interactions", isAuthenticated, validateRequest(interactionsValidation.updateInteractionValidator), interactionsController.updateInteraction);
router.delete("/delete-interactions/:interaction_id", isAuthenticated, interactionsController.deleteInteraction);

// flow
router.post("/create-flow",
    isAuthenticated,
    uploadFile.single('video'),
    multerErrorHandler,
    validateFormData(interactionsValidation.createFlowValidator),
    interactionsController.createFlow
);

router.get("/get-flows/:interaction_id", isAuthenticated, interactionsController.getFlows);

router.put("/update-flow",
    isAuthenticated,
    uploadFile.single('video'),
    multerErrorHandler,
    validateFormData(interactionsValidation.updateFlowValidator),
    interactionsController.updateFlow
);
router.delete("/delete-flow/:flow_id", isAuthenticated, interactionsController.removeFlow);


module.exports = router;
