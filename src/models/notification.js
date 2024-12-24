const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  channel: { type: String, required: true, enum: ['email', 'sms', 'push'] },
  content: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Sent', 'Failed'] },
  retryCount: { type: Number, default: 0 },
  lastRetry: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date },
});

notificationSchema.index({ status: 1, retryCount: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

