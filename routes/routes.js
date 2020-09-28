const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

router.use('/', viewController);
router.use('/auth', authController);

module.exports = router;
