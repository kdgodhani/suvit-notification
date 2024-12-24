const emailService = require('../../services/emailService');

jest.mock('nodemailer');

describe('Email Service', () => {
  it('should send an email', async () => {
    const mockNotification = {
      userId: 'test@example.com',
      content: 'Test notification'
    };

    await expect(emailService.send(mockNotification)).resolves.not.toThrow();
  });
});

