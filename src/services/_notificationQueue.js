const Queue = require('bull');
const emailService = require('./emailService');
const smsService = require('./smsService');
const pushService = require('./pushService');
const Notification = require('../models/notification');
const logger = require('../utils/logger');
const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);
const notificationStream = 'notificationStream'; // Stream name
const notificationQueue = new Queue('notifications', process.env.REDIS_URL);

async function addNotificationToStream(notificationData) {
  await redisClient.xadd(notificationStream, '*', 'data', JSON.stringify(notificationData));
}

notificationQueue.process(async (job) => {
  const notificationData = job.data;

  logger.info(`Processing notification: ${notificationData._id}`);
  console.log(notificationData, "this is notification");

  try {
    // Fetch the latest notification object from the database
    const notification = await Notification.findById(notificationData._id);
    if (!notification) {
      throw new Error(`Notification not found: ${notificationData._id}`);
    }

    if (notification.status === 'Failed') {
      logger.info(`Notification already marked as failed: ${notification._id}`);
      // Remove the job from Redis cache if it's marked as failed
      await job.remove();
      return;
    }

    switch (notification.channel) {
      case 'email':
        await emailService.send(notification);
        break;
      case 'sms':
        await smsService.send(notification);
        break;
      case 'push':
        await pushService.send(notification);
        break;
      default:
        throw new Error('Invalid notification channel');
    }

    // Mark as sent if successful
    await Notification.findByIdAndUpdate(notification._id, {
      status: 'Sent',
      updatedAt: new Date(),
    });

    logger.info(`Notification sent successfully: ${notification._id}`);
  } catch (error) {
    logger.error(`Error processing notification: ${notificationData._id}`, error);
    console.log('Retry logic triggered.');

    // Fetch the notification again to ensure retryCount is up to date
    const notification = await Notification.findById(notificationData._id);

    if (!notification) {
      logger.error(`Notification not found for retry: ${notificationData._id}`);
      await job.remove();
      return;
    }

    if (notification.retryCount < 3) {
      const retryDelay = Math.pow(2, notification.retryCount) * 1000; // Exponential backoff

      // Increment retry count
      await Notification.findByIdAndUpdate(notification._id, {
        retryCount: notification.retryCount + 1,
        lastRetry: new Date(),
        updatedAt: new Date(),
      });

      // Add back to stream with delay
      await addNotificationToStream({ _id: notification._id, retryCount: notification.retryCount + 1 });

      logger.info(`Scheduled retry for notification: ${notification._id}`);
    } else {
      // Mark as failed after 3 retries
      await Notification.findByIdAndUpdate(notification._id, {
        status: 'Failed',
        updatedAt: new Date(),
      });

      // Remove the job from Redis cache
      await job.remove();
      logger.error(`Notification failed after 3 retries: ${notification._id}`);
    }
  }
});

// Consumer to read from the Redis stream
async function consumeNotifications() {
  let lastId = '0'; // The stream ID from where to start consuming

  while (true) {
    try {
      const result = await redisClient.xread('BLOCK', 0, 'STREAMS', notificationStream, lastId);

      const [stream, messages] = result[0];
      for (const [id, fields] of messages) {
        const notificationData = JSON.parse(fields[1]);

        logger.info(`Received notification: ${notificationData._id}`);
        // Add to the queue for processing
        await notificationQueue.add(notificationData);

        // Update lastId to keep track of the stream's position
        lastId = id;
      }
    } catch (error) {
      logger.error('Error consuming notifications', error);
    }
  }
}

consumeNotifications();

module.exports = { notificationQueue, addNotificationToStream };
