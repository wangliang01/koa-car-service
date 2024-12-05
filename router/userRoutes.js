const Router = require('koa-router')
const auth = require('../middlewares/auth')
const userController = require('../controllers/userController')
const validatePassword = require('../middlewares/validatePassword')

const router = new Router({
  prefix: '/user'
})

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/me', auth, userController.getCurrentUser)
router.put('/me', auth, userController.updateCurrentUser)
router.put('/password', auth, validatePassword, userController.updatePassword)
router.delete('/me', auth, userController.deleteCurrentUser)
router.post('/refresh-token', userController.refreshToken)

module.exports = router
