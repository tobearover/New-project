const crypto = require('crypto');
const { createUser, createSession, findUserByUsername } = require('../db');

const SESSION_DAYS = 7;

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function verifyPassword(user, password) {
  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/** 用户名：2-20 位中文/字母/数字/下划线 */
function validateUsername(username) {
  return /^[\w\u4e00-\u9fa5]{2,20}$/.test(String(username || '').trim());
}

/** 密码：6-64 位 */
function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 64;
}

function register(username, password) {
  if (!validateUsername(username)) throw new Error('用户名需为 2-20 位中文/字母/数字/下划线');
  if (!validatePassword(password)) throw new Error('密码长度需为 6-64 位');
  if (findUserByUsername(username)) throw new Error('用户名已被注册');

  const salt = generateSalt();
  const user = createUser(username, hashPassword(password, salt), salt);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  const token = createSession(user.id, expiresAt);
  return { token, user: { id: user.id, username: user.username } };
}

function login(username, password) {
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(user, password)) throw new Error('用户名或密码错误');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  const token = createSession(user.id, expiresAt);
  return { token, user: { id: user.id, username: user.username } };
}

module.exports = {
  SESSION_DAYS,
  hashPassword,
  generateSalt,
  verifyPassword,
  validateUsername,
  validatePassword,
  register,
  login
};
