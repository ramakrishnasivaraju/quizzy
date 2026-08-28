const db = require('../config/db');

exports.createStudent = async (req, res) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    try {
        // 1. AGGRESSIVE FIX: Force the database to add the column right now
        try {
            await db.execute('ALTER TABLE Users ADD COLUMN password VARCHAR(255)');
        } catch (e) {
            // Ignore the error if it blocks us, we will catch it in step 2
        }

        // 2. DIAGNOSTIC SCAN: Let's see exactly what columns exist in your Users table
        const [columns] = await db.execute('SHOW COLUMNS FROM Users');
        const columnNames = columns.map(col => col.Field);

        // If the password column is STILL missing, alert you with the exact columns that exist
        if (!columnNames.includes('password')) {
            return res.status(500).json({ 
                success: false, 
                message: `BLOCKED BY DATABASE: Cannot add password. Existing columns are: ${columnNames.join(', ')}` 
            });
        }

        // 3. Normal Registration
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
        // FIXED: Using SELECT * instead of specifically asking for password, so it won't crash if it's missing!
        const [students] = await db.execute(
            `SELECT * FROM Users WHERE role = 'student' ORDER BY created_at DESC`
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