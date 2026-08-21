const express = require('express');
const authService = require('../services/auth');
const { removeSession } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function publicUser(user) {
  return { id: user.id, username: user.username };
}

// 注册（成功后自动登录）
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  try {
    const result = authService.register(username, password);
    res.status(201).json({ token: result.token, user: publicUser(result.user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  try {
    const result = authService.login(username, password);
    res.json({ token: result.token, user: publicUser(result.user) });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// 退出登录
router.post('/logout', requireAuth, (req, res) => {
  removeSession(req.token);
  res.json({ ok: true });
});

// 当前登录用户
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
