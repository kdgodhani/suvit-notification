const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');

describe('Notification API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new notification', async () => {
    const res = await request(app)
      .post('/notifications')
      .send({
        userId: 'testuser',
        channel: 'email',
        content: 'Test notification'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('should get a notification', async () => {
    const notification = await request(app)
      .post('/notifications')
      .send({
        userId: 'testuser',
        channel: 'email',
        content: 'Test notification'
      });

    const res = await request(app).get(`/notifications/${notification.body._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', notification.body._id);
  });
});

