const Router = require('koa-router')
const auth = require('../middlewares/auth')
const customerController = require('../controllers/customerController')

const router = new Router({
  prefix: '/customer'
})

// 扩展功能路由
router.get('/:id/vehicles', auth, customerController.getCustomerVehicles)
router.get(
  '/:id/appointments',
  auth,
  customerController.getCustomerAppointments
)
router.post('/batch-import', auth, customerController.batchImportCustomers)
router.get('/export', auth, customerController.exportCustomers)
router.get('/stats', auth, customerController.getCustomerStats)

// 基础路由
router.post('/', auth, customerController.createCustomer)
router.get('/', auth, customerController.getCustomers)
router.get('/page', auth, customerController.getCustomersByPage)
router.get('/:id', auth, customerController.getCustomerById)
router.put('/:id', auth, customerController.updateCustomer)
router.delete('/:id', auth, customerController.deleteCustomer)

module.exports = router
