const Router = require('koa-router');
const requireDirectory = require('require-directory');
const path = require('path');
const logger = require('../utils/logger');

/**
 * 创建主路由实例
 */
const router = new Router({
    prefix: '/api'
});

try {
    // 路由注册配置
    const options = {
        visit: (obj) => {
            if (obj instanceof Router) {
                router.use(obj.routes());
                logger.info(`✅ 成功加载路由模块: ${obj.opts.prefix || '/'}`);
            }
        },
        extensions: ['js'],
        exclude: /index\.js$/,
        rename: (name) => name.replace(/Routes$/, ''),
        // 发生错误时的处理函数
        onError: (err) => {
            logger.error('❌ 加载路由模块失败:', err);
        }
    };

    // 自动加载路由 - 从当前目录加载
    requireDirectory(module, __dirname, options);

    logger.info('📚 所有路由模块加载完成');
} catch (error) {
    logger.error('❌ 路由加载过程出错:', error);
    process.exit(1);
}

module.exports = router;