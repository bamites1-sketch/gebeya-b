const test = require('node:test');
const assert = require('node:assert/strict');

function resetEnv() {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.MAIL_HOST;
  delete process.env.MAIL_PORT;
  delete process.env.MAIL_USERNAME;
  delete process.env.MAIL_PASSWORD;
  delete process.env.MAIL_FROM;
  delete process.env.FROM_EMAIL;
}

test('prefers SMTP_* variables when present', () => {
  resetEnv();
  process.env.SMTP_HOST = 'smtp.example.com';
  process.env.SMTP_PORT = '465';
  process.env.SMTP_USER = 'mailer@example.com';
  process.env.SMTP_PASS = 'secret';
  process.env.FROM_EMAIL = 'shop@example.com';

  const { getMailConfig } = require('../services/email.service');
  const config = getMailConfig();

  assert.equal(config.host, 'smtp.example.com');
  assert.equal(config.port, '465');
  assert.equal(config.user, 'mailer@example.com');
  assert.equal(config.pass, 'secret');
  assert.equal(config.from, 'shop@example.com');
});

test('falls back to MAIL_* aliases when SMTP_* are absent', () => {
  resetEnv();
  process.env.MAIL_HOST = 'mail.example.com';
  process.env.MAIL_PORT = '587';
  process.env.MAIL_USERNAME = 'alias@example.com';
  process.env.MAIL_PASSWORD = 'alias-secret';
  process.env.MAIL_FROM = 'sales@example.com';

  const { getMailConfig } = require('../services/email.service');
  const config = getMailConfig();

  assert.equal(config.host, 'mail.example.com');
  assert.equal(config.port, '587');
  assert.equal(config.user, 'alias@example.com');
  assert.equal(config.pass, 'alias-secret');
  assert.equal(config.from, 'sales@example.com');
});
