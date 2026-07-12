const express = require('express');
const router = express.Router();

const {
  addExpense,
  getAllExpenses,
  getExpensesByVehicle,
  deleteExpense
} = require('../controllers/expense.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.post('/', verifyJWT, authorizeRoles('Fleet Manager', 'Financial Analyst'), addExpense);
router.get('/', verifyJWT, authorizeRoles('Fleet Manager', 'Financial Analyst', 'Safety Officer'), getAllExpenses);
router.get('/:vehicleId', verifyJWT, authorizeRoles('Fleet Manager', 'Financial Analyst', 'Safety Officer'), getExpensesByVehicle);
router.delete('/:id', verifyJWT, authorizeRoles('Fleet Manager', 'Financial Analyst'), deleteExpense);

module.exports = router;
