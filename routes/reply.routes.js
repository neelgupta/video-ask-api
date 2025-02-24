const router = require("express").Router();
const { replyController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");
const { multerErrorHandler, uploadFile } = require("../lib/uploader/upload");
router.post(
  "/send-reply",
  isAuthenticated,
  uploadFile.single("video"),
  multerErrorHandler,
  replyController.addReply
);

router.get(
  "/get-direct-message-contact/:contactId",
  isAuthenticated,
  replyController.getDirectMessageAnswerByContact
);

module.exports = router;
