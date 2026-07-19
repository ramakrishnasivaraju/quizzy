const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const subjectRoutes = require('./subjectRoutes');
const quizRoutes = require('./quizRoutes');
const questionRoutes = require('./questionRoutes');
const userRoutes = require('./userRoutes'); // <-- Import the new route

router.post('/auth/login', authController.login);

router.use('/subjects', subjectRoutes);
router.use('/quizzes', quizRoutes);
router.use('/questions', questionRoutes);
router.use('/users', userRoutes); // <-- Plug it in!

module.exports = router;