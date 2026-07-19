const db = require('../config/db');

exports.createQuiz = async (req, res) => {
    const { subject_id, title, time_limit_minutes, passing_score } = req.body;

    if (!subject_id || !title) {
        return res.status(400).json({ success: false, message: 'Subject and Title are required.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO Quizzes (subject_id, title, time_limit_minutes, passing_score) VALUES (?, ?, ?, ?)',
            [subject_id, title, time_limit_minutes || 30, passing_score || 50]
        );

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully!',
            quiz_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, message: 'Server error while creating quiz.' });
    }
};

exports.getAllQuizzes = async (req, res) => {
    try {
        // We JOIN the Subjects table so we can grab the subject name and icon!
        const [quizzes] = await db.execute(`
            SELECT q.*, s.name AS subject_name, s.icon_class 
            FROM Quizzes q 
            JOIN Subjects s ON q.subject_id = s.subject_id 
            ORDER BY q.created_at DESC
        `);
        
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching quizzes.' });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const studentAnswers = req.body.answers; // The frontend will send { question_id: 'A', question_id: 'C', etc. }

        // 1. Get the quiz passing score requirement
        const [quizzes] = await db.execute('SELECT passing_score FROM Quizzes WHERE quiz_id = ?', [quizId]);
        if (quizzes.length === 0) return res.status(404).json({ success: false, message: 'Quiz not found.' });
        const passingPercentage = quizzes[0].passing_score;

        // 2. Fetch the correct answers from the database securely
        const [correctAnswers] = await db.execute('SELECT question_id, correct_option FROM Questions WHERE quiz_id = ?', [quizId]);
        
        let score = 0;
        const totalQuestions = correctAnswers.length;

        // 3. Compare student answers to correct answers
        correctAnswers.forEach(dbQuestion => {
            const studentChoice = studentAnswers[dbQuestion.question_id];
            if (studentChoice === dbQuestion.correct_option) {
                score++;
            }
        });

        // 4. Calculate if they passed
        const studentPercentage = (score / totalQuestions) * 100;
        const passed = studentPercentage >= passingPercentage;

        // 5. Save the result to the database
        await db.execute(
            'INSERT INTO Results (quiz_id, score, total_questions, passed) VALUES (?, ?, ?, ?)',
            [quizId, score, totalQuestions, passed]
        );

        res.status(200).json({
            success: true,
            score: score,
            total: totalQuestions,
            percentage: studentPercentage,
            passed: passed,
            message: passed ? 'Congratulations, you passed!' : 'Keep practicing, you failed this time.'
        });

    } catch (error) {
        console.error('Error grading exam:', error);
        res.status(500).json({ success: false, message: 'Server error while grading exam.' });
    }
};

exports.getStudentResults = async (req, res) => {
    try {
        // We are using student_id = 1 since we defaulted to that earlier
        const [results] = await db.execute(`
            SELECT r.score, r.total_questions, r.passed, r.completed_at, 
                   q.title AS quiz_title, s.name AS subject_name, s.icon_class
            FROM Results r
            JOIN Quizzes q ON r.quiz_id = q.quiz_id
            JOIN Subjects s ON q.subject_id = s.subject_id
            WHERE r.student_id = 1
            ORDER BY r.completed_at DESC
        `);

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching results.' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [subjects] = await db.execute('SELECT COUNT(*) as count FROM Subjects');
        const [quizzes] = await db.execute('SELECT COUNT(*) as count FROM Quizzes');
        const [students] = await db.execute('SELECT COUNT(*) as count FROM Users WHERE role = "student"');

        res.status(200).json({
            students: students[0].count,
            subjects: subjects[0].count,
            quizzes: quizzes[0].count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [subjects] = await db.execute('SELECT COUNT(*) as count FROM Subjects');
        const [quizzes] = await db.execute('SELECT COUNT(*) as count FROM Quizzes');
        const [students] = await db.execute('SELECT COUNT(*) as count FROM Users WHERE role = "student"');

        res.status(200).json({
            students: students[0].count,
            subjects: subjects[0].count,
            quizzes: quizzes[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        await db.execute('DELETE FROM Quizzes WHERE quiz_id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Quiz deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting quiz.' });
    }
};