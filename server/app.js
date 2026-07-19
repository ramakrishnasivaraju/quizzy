require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const apiRoutes = require('./routes/api'); 

const app = express();

app.use(helmet()); 
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// This is the new part that connects your routes!
app.use('/api/v1', apiRoutes); 

app.get('/api/status', (req, res) => {
    res.json({ success: true, message: "Quiz System API is live and ready!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});