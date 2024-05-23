const express = require('express');
const router = express.Router();
const { modulesController } = require('../controller');

router.post('/', modulesController.createOrUpdateModule);
router.post('/get-questionId', modulesController.getQuestionIdByQuestionText)
router.get('/:userId', modulesController.getAllModulesByUserId)

module.exports = router;
