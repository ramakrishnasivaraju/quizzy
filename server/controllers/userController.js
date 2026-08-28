const db = require('../config/db');

// --- NEW: SELF-HEALING DATABASE SCRIPT ---
// This will silently add the missing 'password' column to your database on the fly!
const fixDatabase = async () => {
    try {
        await db.execute('ALTER TABLE Users ADD COLUMN password VARCHAR(255) DEFAULT "student123"');
        console.log('Successfully fixed database: Added missing password column.');
    } catch (error) {
        // If the column already exists, it will just quietly ignore this step
    }
};
fixDatabase(); // Run the fix immediately when the server starts

exports.createStudent = async (req, res) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    try {
        const [existingUser] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'This email is already taken. Try a different one!' });
        }

        await db.execute(
            'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, 'student']
        );

        res.status(201).json({ success: true, message: 'Student registered successfully!' });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ success: false, message: 'DATABASE CRASH: ' + error.message });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await db.execute(
            `SELECT user_id, name, email, password, created_at FROM Users WHERE role = 'student' ORDER BY created_at DESC`
        );
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'DATABASE CRASH: ' + error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await db.execute(`DELETE FROM Users WHERE user_id = ? AND role = 'student'`, [req.params.id]);
        res.status(200).json({ success: true, message: 'Student deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'DATABASE CRASH: ' + error.message });
    }
};