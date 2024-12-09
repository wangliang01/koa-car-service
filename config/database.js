const mongoose = require('mongoose')
const logger = require('../utils/logger')

/**
 * 连接MongoDB数据库
 * 使用环境变量中的MONGODB_URI作为连接字符串
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    logger.info(`MongoDB连接成功 [${process.env.NODE_ENV}环境]`)
  } catch (error) {
    logger.error('MongoDB连接失败:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
