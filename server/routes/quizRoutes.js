const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST request: Admins can create a new quiz
router.post('/', verifyToken, requireRole('admin'), quizController.createQuiz);

// GET request: Everyone logged in can fetch the quizzes
router.get('/', verifyToken, quizController.getAllQuizzes);

// POST request: Students can submit an exam for grading (NEW!)
router.post('/exam/:quizId/submit', verifyToken, quizController.submitExam);

// GET request: Students can view their past results

router.get('/my-results', verifyToken, quizController.getStudentResults);
router.get('/stats', verifyToken, requireRole('admin'), quizController.getDashboardStats);
router.delete('/:id', verifyToken, requireRole('admin'), quizController.deleteQuiz);
module.exports = router;