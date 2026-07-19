const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        // 1. Find the user in the database
        const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = users[0];

        // 2. Direct password comparison (Admin-controlled workflow)
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // 3. Generate the security token for the session
        const token = jwt.sign(
            { id: user.user_id, role: user.role }, 
            process.env.JWT_SECRET || 'super_secret_campus_key', 
            { expiresIn: '24h' }
        );

        // 4. Send the successful response back to the browser
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