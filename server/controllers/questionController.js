const db = require('../config/db');

exports.createQuestion = async (req, res) => {
    const { quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;

    // Make sure the Admin didn't leave any blanks
    if (!quiz_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO Questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option]
        );

        res.status(201).json({
            success: true,
            message: 'Question added successfully!',
            question_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ success: false, message: 'Server error while adding question.' });
    }
};

exports.getAllQuestions = async (req, res) => {
    try {
        // We JOIN the Quizzes table to get the title of the quiz this question belongs to
        const [questions] = await db.execute(`
            SELECT q.*, qz.title AS quiz_title 
            FROM Questions q 
            JOIN Quizzes qz ON q.quiz_id = qz.quiz_id 
            ORDER BY q.created_at DESC
        `);
        
        res.status(200).json({ success: true, questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching questions.' });
    }
};

exports.getExamQuestions = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        
        // 1. Get the Quiz details (title, time limit, and subject name)
        const [quizzes] = await db.execute(`
            SELECT q.title, q.time_limit_minutes, s.name AS subject_name
            FROM Quizzes q
            JOIN Subjects s ON q.subject_id = s.subject_id
            WHERE q.quiz_id = ?
        `, [quizId]);

        if (quizzes.length === 0) {
            return res.status(404).json({ success: false, message: 'Quiz not found.' });
        }

        // 2. Get the Questions (Notice we do NOT select 'correct_option' here!)
        const [questions] = await db.execute(`
            SELECT question_id, question_text, option_a, option_b, option_c, option_d 
            FROM Questions 
            WHERE quiz_id = ?
        `, [quizId]);

        res.status(200).json({
            success: true,
            quiz: quizzes[0],
            questions: questions
        });
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching exam.' });
    }
};

// --- NEW FEATURE: DELETE QUESTION ---
exports.deleteQuestion = async (req, res) => {
    try {
        await db.execute('DELETE FROM Questions WHERE question_id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Question deleted successfully.' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting question.' });
    }
};