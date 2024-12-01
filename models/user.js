const mongoose = require('mongoose');

/**
 * 用户模型Schema
 * 包含用户基本信息和角色权限
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,  // 邮箱唯一
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'user'],  // 用户角色：管理员、员工、普通用户
    default: 'user'
  }
}, {
  timestamps: true  // 自动添加创建和更新时间戳
});

module.exports = mongoose.model('User', userSchema); 