const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Customer CRUD routes
router.get('/', customerController.getAllCustomers);
router.get('/statistics', customerController.getStatistics);
router.get('/:id', customerController.getCustomer);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.post('/bulk-import', customerController.bulkImport);

module.exports = router;
