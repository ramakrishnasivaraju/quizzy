const db = require('./config/db');

async function buildDatabase() {
    try {
        console.log("Connecting to Aiven Cloud...");

        // 1. Create Users
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'student') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Users table created!");

        // 2. Create Subjects
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Subjects (
                subject_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                icon_class VARCHAR(50) DEFAULT 'fas fa-book',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Subjects table created!");

        // 3. Create Quizzes
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Quizzes (
                quiz_id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                time_limit_minutes INT DEFAULT 30,
                passing_score INT DEFAULT 50,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Quizzes table created!");

        // 4. Create Questions
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Questions (
                question_id INT AUTO_INCREMENT PRIMARY KEY,
                quiz_id INT NOT NULL,
                question_text TEXT NOT NULL,
                option_a VARCHAR(255) NOT NULL,
                option_b VARCHAR(255) NOT NULL,
                option_c VARCHAR(255) NOT NULL,
                option_d VARCHAR(255) NOT NULL,
                correct_option CHAR(1) NOT NULL,
                FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Questions table created!");

        // 5. Insert Admin
        await db.execute(`
            INSERT IGNORE INTO Users (name, email, password, role) 
            VALUES ('Admin', 'admin@test.com', '123456', 'admin')
        `);
        console.log("✅ Admin account created!");

        console.log("🎉 DATABASE SETUP COMPLETE! You can now run node app.js");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error building database:", error);
        process.exit(1);
    }
}

buildDatabase();