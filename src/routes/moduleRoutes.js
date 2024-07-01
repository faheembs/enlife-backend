const express = require("express");
const router = express.Router();
const { modulesController } = require("../controller");

router.post("/", modulesController.createOrUpdateModule);
router.post("/get-questionId", modulesController.getQuestionIdByQuestionText);
router.get("/:userId", modulesController.getAllModulesByUserId);
router.get("/max/:userId", modulesController.getMaxModulesByUserId);
router.get("/moudle1-evaluation/:userId", modulesController.getModule1Evaluation);

router.post("/assessment", modulesController.postAssessmentByModuleId);
router.post("/assessment-for-module3", modulesController.postAssessmentForModule3);
router.post("/assessment-for-module5", modulesController.postAssessmentForModule5);

router.post("/regenerate", modulesController.regenarateResponse);

module.exports = router;
