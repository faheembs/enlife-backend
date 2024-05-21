const express = require('express');
const router = express.Router();
const { modulesController } = require('../controller');

router.post('/', modulesController.createOrUpdateModule);

module.exports = router;
