const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST request to /api/v1/subjects
// It first checks if the user is logged in (verifyToken), 
// then checks if they are an admin (requireRole('admin')), 
// and finally runs the controller logic.
router.post('/', verifyToken, requireRole('admin'), subjectController.createSubject);


// GET request to fetch the list of subjects
router.get('/', verifyToken, requireRole('admin'), subjectController.getAllSubjects);
router.delete('/:id', verifyToken, requireRole('admin'), subjectController.deleteSubject);
module.exports = router;