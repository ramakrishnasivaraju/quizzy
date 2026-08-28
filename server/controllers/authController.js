const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        let { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        email = email.trim().toLowerCase();
        password = password.trim();

        // --- MASTER ADMIN BACKDOOR ---
        if (email === 'admin@quizzy.com' && password === 'admin123') {
            const token = jwt.sign(
                { id: 999, role: 'admin' }, 
                process.env.JWT_SECRET || 'super_secret_campus_key', 
                { expiresIn: '24h' }
            );
            return res.status(200).json({ success: true, token, role: 'admin', message: 'Master Admin login successful!' });
        }

        // --- NEW: MASTER STUDENT BACKDOOR ---
        if (email === 'student@quizzy.com' && password === 'student123') {
            const token = jwt.sign(
                { id: 1, role: 'student' }, 
                process.env.JWT_SECRET || 'super_secret_campus_key', 
                { expiresIn: '24h' }
            );
            return res.status(200).json({ success: true, token, role: 'student', message: 'Master Student login successful!' });
        }

        // 1. Find the user in the database
        const [users] = await db.execute('SELECT * FROM Users WHERE LOWER(email) = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials: User not found.' });
        }

        const user = users[0];

        // 2. Direct password comparison
        if (password !== user.password.trim()) {
            return res.status(401).json({ success: false, message: 'Invalid credentials: Wrong password.' });
        }

        // 3. Role verification
        if (role && user.role !== role) {
            return res.status(401).json({ success: false, message: `Access denied. You are registered as a ${user.role}.` });
        }

        // 4. Generate token
        const token = jwt.sign(
            { id: user.user_id, role: user.role }, 
            process.env.JWT_SECRET || 'super_secret_campus_key', 
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            role: user.role,
            message: 'Login successful!'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};