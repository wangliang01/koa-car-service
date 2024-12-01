const Router = require('koa-router');
const auth = require('../middlewares/auth');
const appointmentController = require('../controllers/appointmentController');

const router = new Router({
  prefix: '/appointments'
});

router.post('/', auth, appointmentController.createAppointment);
router.get('/', auth, appointmentController.getAppointments);
router.get('/:id', auth, appointmentController.getAppointmentById);
router.put('/:id', auth, appointmentController.updateAppointment);
router.patch('/:id/status', auth, appointmentController.updateAppointmentStatus);
router.delete('/:id', auth, appointmentController.deleteAppointment);

module.exports = router; 