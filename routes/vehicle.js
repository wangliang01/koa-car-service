router.get('/page', auth, vehicleController.getVehiclesByPage)
router.get('/export', auth, vehicleController.exportVehicles)
router.get('/stats', auth, vehicleController.getVehicleStats)
router.get('/brands', auth, vehicleController.getVehicleBrands)
router.get('/models', auth, vehicleController.getVehicleModels)
router.post('/batch-import', auth, vehicleController.batchImportVehicles)
router.get('/:id/repairs', auth, vehicleController.getVehicleRepairRecords)
router.get('/:id/appointments', auth, vehicleController.getVehicleAppointments)
router.patch('/:id/mileage', auth, vehicleController.updateVehicleMileage)
