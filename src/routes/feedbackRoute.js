const { feedbackController } = require("../controller");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");


const router = require("express").Router();

router
    .route("/")
    .post(ensureAuthenticated, feedbackController.postFeedback);
router
    .route("/:userId")
    .get(ensureAuthenticated, feedbackController.getFeedbackByUserId)

module.exports = router;
