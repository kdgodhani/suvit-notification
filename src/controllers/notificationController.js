const Notification = require('../models/notification');
const notificationQueue = require('../services/notificationQueue');
const logger = require('../utils/logger');

exports.createNotification = async (req, res) => {
  try {
    const { userId, channel, content, scheduledFor } = req.body;
    const notification = new Notification({
      userId,
      channel,
      content,
      status: 'Pending',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    });
    await notification.save();

    // Add to queue for processing
    const delay = scheduledFor ? new Date(scheduledFor).getTime() - Date.now() : 0;
    // await notificationQueue.add(notification);
    await notificationQueue.add(notification, { delay });

    // console.log("log-11")
    logger.info(`Notification created: ${notification._id}`);
    res.status(201).json(notification);
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({ error: 'Error creating notification' });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    logger.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Error fetching notification' });
  }
};

exports.listNotifications = async (req, res) => {
  try {
    const { status, type, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.channel = type;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    logger.error('Error listing notifications:', error);
    res.status(500).json({ error: 'Error listing notifications' });
  }
};

