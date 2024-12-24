const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/', notificationController.createNotification);
router.get('/:id', notificationController.getNotification);
router.get('/', notificationController.listNotifications);

module.exports = router;

