const db = require('../config/db');

exports.createStudent = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Saving the password in standard text for the project demonstration
        const [result] = await db.execute(
            'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, 'student']
        );

        res.status(201).json({ success: true, message: 'Student registered successfully!' });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ success: false, message: 'Server error or email already exists.' });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        // FIXED: Using single quotes for 'student' so the database doesn't confuse it for a column
        const [students] = await db.execute(
            `SELECT user_id, name, email, password, created_at FROM Users WHERE role = 'student' ORDER BY created_at DESC`
        );
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching students.' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        // FIXED: Using single quotes for 'student' here as well
        await db.execute(`DELETE FROM Users WHERE user_id = ? AND role = 'student'`, [req.params.id]);
        res.status(200).json({ success: true, message: 'Student deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting student.' });
    }
};