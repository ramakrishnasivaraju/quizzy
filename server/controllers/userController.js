const db = require('../config/db');

exports.createStudent = async (req, res) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    try {
        // FORCE BUILD: Drop the broken table and recreate it with all required columns instantly!
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Just in case the table already existed without password or role, add them safely:
        try { await db.execute('ALTER TABLE Users ADD COLUMN password VARCHAR(255)'); } catch (e) {}
        try { await db.execute('ALTER TABLE Users ADD COLUMN role VARCHAR(50) DEFAULT "student"'); } catch (e) {}

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
            `SELECT * FROM Users WHERE role = 'student' ORDER BY user_id DESC`
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
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: 'DATABASE CRASH: ' + error.message });
    }
};