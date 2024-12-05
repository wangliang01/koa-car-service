const Router = require('koa-router')
const router = new Router({ prefix: '/api/customer' })
const customerController = require('../controllers/customerController')
const auth = require('../middleware/auth')

// 特殊路由(需要放在 /:id 路由之前)
router.get('/export', auth, customerController.exportCustomers)
router.get('/stats', auth, customerController.getCustomerStats)
router.post('/batch-import', auth, customerController.batchImportCustomers)

// 基础路由
router.post('/', auth, customerController.createCustomer)
router.get('/', auth, customerController.getCustomers)
router.get('/page', auth, customerController.getCustomersByPage)

// ID相关路由
router.get('/:id', auth, customerController.getCustomerById)
router.put('/:id', auth, customerController.updateCustomer)
router.delete('/:id', auth, customerController.deleteCustomer)
router.get('/:id/vehicles', auth, customerController.getCustomerVehicles)
router.get(
  '/:id/appointments',
  auth,
  customerController.getCustomerAppointments
)

module.exports = router
