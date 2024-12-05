const jwt = require('jsonwebtoken')

/**
 * JWT工具类
 * 用于生成和验证JWT令牌
 */
module.exports = {
  // 生成访问令牌，有效期24小时
  sign(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })
  },

  // 生成刷新令牌，有效期7天
  signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    })
  },

  // 验证访问令牌
  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
  },

  // 验证刷新令牌
  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  }
}
