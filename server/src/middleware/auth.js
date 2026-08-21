const { findSession, getUser } = require('../db');

/** 登录校验中间件：从 Authorization: Bearer <token> 解析用户，挂载到 req.user */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const session = token && findSession(token);
  if (!session) return res.status(401).json({ error: '未登录或登录已过期' });
  const user = getUser(session.userId);
  if (!user) return res.status(401).json({ error: '用户不存在' });
  req.user = { id: user.id, username: user.username };
  req.token = token;
  next();
}

module.exports = { requireAuth };
