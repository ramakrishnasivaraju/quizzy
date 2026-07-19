const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST: Admins can add a new question
router.post('/', verifyToken, requireRole('admin'), questionController.createQuestion);

// GET: Admins can fetch all questions (with the answers)
router.get('/', verifyToken, requireRole('admin'), questionController.getAllQuestions);

// GET: Students can fetch a specific exam (without the answers)
router.get('/exam/:quizId', verifyToken, questionController.getExamQuestions);

module.exports = router;