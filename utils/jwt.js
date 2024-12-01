const jwt = require('jsonwebtoken');

/**
 * JWT工具类
 * 用于生成和验证JWT令牌
 */
module.exports = {
  // 生成JWT令牌，有效期24小时
  sign(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  },
  // 验证JWT令牌
  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}; 