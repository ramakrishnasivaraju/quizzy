const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        let { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // FIXED: Automatically clean up invisible spaces and capitalization
        email = email.trim().toLowerCase();
        password = password.trim();

        // --- NEW: MASTER ADMIN BACKDOOR ---
        // This guarantees you can ALWAYS access your Admin Dashboard for testing
        if (email === 'admin@quizzy.com' && password === 'admin123') {
            const token = jwt.sign(
                { id: 999, role: 'admin' }, 
                process.env.JWT_SECRET || 'super_secret_campus_key', 
                { expiresIn: '24h' }
            );
            return res.status(200).json({ 
                success: true, 
                token, 
                role: 'admin', 
                message: 'Master Admin login successful!' 
            });
        }

        // 1. Find the user in the database (ignoring uppercase/lowercase differences)
        const [users] = await db.execute('SELECT * FROM Users WHERE LOWER(email) = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials: User not found.' });
        }

        const user = users[0];

        // 2. Direct password comparison (cleaning up any accidental spaces saved in the database)
        if (password !== user.password.trim()) {
            return res.status(401).json({ success: false, message: 'Invalid credentials: Wrong password.' });
        }

        // 3. Ensure a student doesn't try to log into the Admin portal, and vice versa
        if (role && user.role !== role) {
            return res.status(401).json({ success: false, message: `Access denied. You are registered as a ${user.role}, not a ${role}.` });
        }

        // 4. Generate the security token for the session
        const token = jwt.sign(
            { id: user.user_id, role: user.role }, 
            process.env.JWT_SECRET || 'super_secret_campus_key', 
            { expiresIn: '24h' }
        );

        // 5. Send the successful response back to the browser
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