const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST: Admins can register a new student
router.post('/students', verifyToken, requireRole('admin'), userController.createStudent);

// GET: Admins can view all students
router.get('/students', verifyToken, requireRole('admin'), userController.getAllStudents);
router.delete('/students/:id', verifyToken, requireRole('admin'), userController.deleteStudent);
module.exports = router;