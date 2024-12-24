const logger = require('../utils/logger');

exports.send = async (notification) => {
// If you want to test failer increase 0.2 value ;
const shouldFail = Math.random() < 0.2; // Simulate failure 20% of the time

if (shouldFail) {
  throw new Error('Simulated sms service failure');
}

  // Mock SMS sending
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info(`SMS sent to ${notification.userId}: ${notification.content}`);
      resolve();
    }, 1000);
  });
};

