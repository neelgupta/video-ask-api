const { adminController } = require("../controller");
const { swaggerJoi } = require("../utils/joiToSwagger");
const { userValidation, validateRequest } = require("../utils/validations");

const router = require("express").Router();

router.post("/login",
    /* #swagger.tags = ['Admin']
     #swagger.description = 'Admin signing' */
    swaggerJoi(userValidation.signInValidator),
    validateRequest(userValidation.signInValidator),
    adminController.adminSigning,
)

module.exports = router;