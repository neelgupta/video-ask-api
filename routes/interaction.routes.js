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
router.post("/create-node",
    isAuthenticated,
    uploadFile.single('video'),
    multerErrorHandler,
    validateFormData(interactionsValidation.createNodeValidator),
    interactionsController.createNode
);

router.get("/get-nodes/:interaction_id", isAuthenticated, interactionsController.getNodes);

router.put("/update-node",
    isAuthenticated,
    uploadFile.single('video'),
    multerErrorHandler,
    validateFormData(interactionsValidation.updateNodeValidator),
    interactionsController.updateNode
);
router.delete("/delete-nodes/:node_id", isAuthenticated, interactionsController.removeNode);


router.post("/create-default-flow",
    isAuthenticated,
    validateRequest(interactionsValidation.createDefaultFlow),
    interactionsController.createDefaultFlow
);


module.exports = router;