const Router = require('koa-router')
const auth = require('../middlewares/auth')
const appointmentController = require('../controllers/appointmentController')

const router = new Router({
  prefix: '/appointment'
})

router.get('/today', auth, appointmentController.getTodayAppointments)
router.get('/range', auth, appointmentController.getAppointmentsByDateRange)
router.get('/stats', auth, appointmentController.getAppointmentStats)
router.get('/export', auth, appointmentController.exportAppointments)
router.post(
  '/batch-import',
  auth,
  appointmentController.batchImportAppointments
)
router.get('/page', auth, appointmentController.getAppointmentsByPage)

router.post('/', auth, appointmentController.createAppointment)
router.get('/', auth, appointmentController.getAppointments)
router.get('/:id', auth, appointmentController.getAppointmentById)
router.put('/:id', auth, appointmentController.updateAppointment)
router.patch('/:id/status', auth, appointmentController.updateAppointmentStatus)
router.delete('/:id', auth, appointmentController.deleteAppointment)
router.patch('/:id/cancel', auth, appointmentController.cancelAppointment)

module.exports = router
