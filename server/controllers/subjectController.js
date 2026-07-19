const db = require('../config/db');

exports.createSubject = async (req, res) => {
    // Grab the data sent from the Admin dashboard
    const { name, description, icon_class } = req.body;

    // Safety check: Make sure they actually typed a name
    if (!name) {
        return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    try {
        // Insert the new subject into the MySQL database
        const [result] = await db.execute(
            'INSERT INTO Subjects (name, description, icon_class) VALUES (?, ?, ?)',
            [name, description || '', icon_class || 'fas fa-book']
        );

        // Tell the frontend it was successful
        res.status(201).json({
            success: true,
            message: 'Subject created successfully!',
            subject_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ success: false, message: 'Server error while creating subject.' });
    }
};

// Function to fetch all subjects
exports.getAllSubjects = async (req, res) => {
    try {
        // Ask MySQL for everything in the Subjects table, newest first
        const [subjects] = await db.execute('SELECT * FROM Subjects ORDER BY created_at DESC');
        
        // Send the list back to the frontend
        res.status(200).json({
            success: true,
            subjects: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching subjects.' });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await db.execute('DELETE FROM Subjects WHERE subject_id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Subject deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting subject. It might have quizzes attached.' });
    }
};