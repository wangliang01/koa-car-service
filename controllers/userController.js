const User = require('../models/user')
const jwt = require('../utils/jwt')
const bcrypt = require('bcryptjs')
const AppError = require('../utils/AppError')
const response = require('../utils/response')

class UserController {
  async register(ctx) {
    try {
      const { username, password, email } = ctx.request.body

      // 检查用户是否已存在
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return response.error(ctx, '该邮箱已被注册', 10001)
      }

      // 创建新用户
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = new User({
        username,
        email,
        password: hashedPassword
      })

      await user.save()
      ctx.status = 201
      response.success(ctx, null, '注册成功')
    } catch (error) {
      throw error
    }
  }
  /**
   * 用户登录
   * @param {Object} ctx - Koa上下文对象
   * @param {Object} ctx.request.body - 请求体
   * @param {string} ctx.request.body.username - 用户名
   * @param {string} ctx.request.body.email - 邮箱
   * @param {string} ctx.request.body.password - 密码
   */
  async login(ctx) {
    try {
      const { username, email, password } = ctx.request.body

      // 查找用户(支持邮箱或用户名登录)
      const query = {}
      if (email) {
        query.email = email
      } else if (username) {
        query.username = username
      } else {
        throw new AppError('请提供用户名或邮箱', 400, 10004)
      }

      const user = await User.findOne(query)
      if (!user) {
        throw new AppError('用户名或密码错误', 401, 10002)
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new AppError('用户名或密码错误', 401, 10002)
      }

      // 生成JWT令牌
      const token = jwt.sign({ id: user._id })
      const refreshToken = jwt.signRefreshToken({ id: user._id })
      console.log(token, refreshToken)

      response.success(ctx, { token, refreshToken })
    } catch (error) {
      throw error
    }
  }

  async getCurrentUser(ctx) {
    try {
      const user = await User.findById(ctx.state.user.id).select('-password')
      response.success(ctx, user)
    } catch (error) {
      throw error
    }
  }

  async updateCurrentUser(ctx) {
    try {
      const { username, email } = ctx.request.body
      const userId = ctx.state.user.id

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true }
      ).select('-password')

      if (!updatedUser) {
        throw new AppError('用户不存在', 404, 10003)
      }

      response.success(ctx, updatedUser, '用户信息更新成功')
    } catch (error) {
      throw error
    }
  }

  /**
   * 修改密码
   * @param {Object} ctx - Koa上下文
   */
  async updatePassword(ctx) {
    try {
      const { currentPassword, newPassword } = ctx.request.body
      const userId = ctx.state.user.id

      // 获取用户信息（包含密码）
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('用户不存在', 404, 10003)
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      )
      if (!isValidPassword) {
        throw new AppError('当前密码错误', 400, 10004)
      }

      // 检查新密码是否与当前密码相同
      if (currentPassword === newPassword) {
        throw new AppError('新密码不能与当前密码相同', 400, 10005)
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // 更新密码
      user.password = hashedPassword
      await user.save()

      response.success(ctx, null, '密码修改成功')
    } catch (error) {
      throw error
    }
  }

  /**
   * 删除当前用户账户
   */
  async deleteCurrentUser(ctx) {
    try {
      const userId = ctx.state.user.id

      const user = await User.findByIdAndDelete(userId)
      if (!user) {
        throw new AppError('用户不存在', 404, 10003)
      }

      response.success(ctx, null, '账户删除成功')
    } catch (error) {
      throw error
    }
  }

  /**
   * 刷新访问令牌
   * @param {Object} ctx - Koa上下文
   */
  async refreshToken(ctx) {
    try {
      const { refreshToken } = ctx.request.body

      if (!refreshToken) {
        throw new AppError(
          '刷新令牌不能为空',
          400,
          errorCode.INVALID_REFRESH_TOKEN
        )
      }

      // 验证刷新令牌
      const decoded = jwt.verifyRefreshToken(refreshToken)
      const user = await User.findById(decoded.id)

      if (!user) {
        throw new AppError('用户不存在', 404, errorCode.USER_NOT_FOUND)
      }

      // 生成新的访问令牌
      const newAccessToken = jwt.sign({ id: user._id })
      const newRefreshToken = jwt.signRefreshToken({ id: user._id })

      response.success(
        ctx,
        {
          token: newAccessToken,
          refreshToken: newRefreshToken
        },
        '令牌刷新成功'
      )
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError(
          '无效的刷新令牌',
          401,
          errorCode.INVALID_REFRESH_TOKEN
        )
      }
      throw error
    }
  }
}

module.exports = new UserController()
