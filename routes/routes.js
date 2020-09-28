const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

router.use('/', viewController);

module.exports = router;
