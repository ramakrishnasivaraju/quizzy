class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('quiz_auth_token');
        this.checkAuth();

        this.themeToggleBtn = document.getElementById('themeToggle');
        this.pageTitle = document.getElementById('pageTitle');
        
        // Navigation
        this.navDashboard = document.getElementById('nav-dashboard');
        this.navSubjects = document.getElementById('nav-subjects');
        this.navQuizzes = document.getElementById('nav-quizzes');
        this.navQuestions = document.getElementById('nav-questions');
        this.navStudents = document.getElementById('nav-students'); 
        
        // Sections
        this.dashboardSection = document.getElementById('dashboardSection');
        this.subjectsSection = document.getElementById('subjectsSection');
        this.quizzesSection = document.getElementById('quizzesSection');
        this.questionsSection = document.getElementById('questionsSection');
        this.studentsSection = document.getElementById('studentsSection'); 
        
        // Stats elements
        this.statStudents = document.getElementById('statStudents');
        this.statSubjects = document.getElementById('statSubjects');
        this.statQuizzes = document.getElementById('statQuizzes');
        
        // Containers & Forms
        this.createSubjectForm = document.getElementById('createSubjectForm');
        this.subjectsList = document.getElementById('subjectsList');
        
        this.createQuizForm = document.getElementById('createQuizForm');
        this.quizSubjectSelect = document.getElementById('quizSubjectSelect');
        this.quizzesList = document.getElementById('quizzesList');
        
        this.createQuestionForm = document.getElementById('createQuestionForm');
        this.questionQuizSelect = document.getElementById('questionQuizSelect');
        
        this.createStudentForm = document.getElementById('createStudentForm'); 
        this.studentsList = document.getElementById('studentsList'); 
        
        this.initEventListeners();
        this.fetchDashboardStats();
    }

    checkAuth() {
        if (!this.token) {
            alert('Unauthorized. Please log in first.');
            window.location.href = '../index.html';
        }
    }

    initEventListeners() {
        if (this.themeToggleBtn) this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        if (this.navDashboard) this.navDashboard.addEventListener('click', () => this.switchTab('dashboard'));
        if (this.navSubjects) this.navSubjects.addEventListener('click', () => { this.switchTab('subjects'); this.fetchSubjects(); });
        if (this.navQuizzes) this.navQuizzes.addEventListener('click', () => { this.switchTab('quizzes'); this.populateSubjectDropdown(); this.fetchQuizzes(); });
        if (this.navQuestions) this.navQuestions.addEventListener('click', () => { this.switchTab('questions'); this.populateQuizDropdown(); });
        if (this.navStudents) this.navStudents.addEventListener('click', () => { this.switchTab('students'); this.fetchStudents(); });

        if (this.createSubjectForm) this.createSubjectForm.addEventListener('submit', (e) => this.handleCreateSubject(e));
        if (this.createQuizForm) this.createQuizForm.addEventListener('submit', (e) => this.handleCreateQuiz(e));
        if (this.createQuestionForm) this.createQuestionForm.addEventListener('submit', (e) => this.handleCreateQuestion(e));
        if (this.createStudentForm) this.createStudentForm.addEventListener('submit', (e) => this.handleCreateStudent(e));
    }

    switchTab(tabName) {
        if(this.navDashboard) this.navDashboard.classList.remove('active');
        if(this.navSubjects) this.navSubjects.classList.remove('active');
        if(this.navQuizzes) this.navQuizzes.classList.remove('active');
        if(this.navQuestions) this.navQuestions.classList.remove('active');
        if(this.navStudents) this.navStudents.classList.remove('active');
        
        if(this.dashboardSection) this.dashboardSection.classList.replace('section-active', 'section-hidden');
        if(this.subjectsSection) this.subjectsSection.classList.replace('section-active', 'section-hidden');
        if(this.quizzesSection) this.quizzesSection.classList.replace('section-active', 'section-hidden');
        if(this.questionsSection) this.questionsSection.classList.replace('section-active', 'section-hidden');
        if(this.studentsSection) this.studentsSection.classList.replace('section-active', 'section-hidden');

        if (tabName === 'dashboard') {
            this.navDashboard.classList.add('active');
            this.dashboardSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'System Overview';
            this.fetchDashboardStats();
        } else if (tabName === 'subjects') {
            this.navSubjects.classList.add('active');
            this.subjectsSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'Subject Management';
        } else if (tabName === 'quizzes') {
            this.navQuizzes.classList.add('active');
            this.quizzesSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'Quiz Management';
        } else if (tabName === 'questions') {
            this.navQuestions.classList.add('active');
            this.questionsSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'Question Management';
        } else if (tabName === 'students') {
            this.navStudents.classList.add('active');
            this.studentsSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'Student Management';
        }
    }

    async fetchDashboardStats() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/quizzes/stats', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                this.statStudents.textContent = data.students;
                this.statSubjects.textContent = data.subjects;
                this.statQuizzes.textContent = data.quizzes;
            }
        } catch (error) { console.error('Error fetching stats:', error); }
    }

    async fetchSubjects() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/subjects', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                this.subjectsList.innerHTML = ''; 
                if (data.subjects.length === 0) return this.subjectsList.innerHTML = '<p>No subjects found.</p>';
                data.subjects.forEach(subject => {
                    this.subjectsList.innerHTML += `
                        <div class="glass-card stat-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <i class="${subject.icon_class}" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"></i>
                                <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${subject.name}</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8;">${subject.description || ''}</p>
                            </div>
                            <button onclick="dashboardApp.deleteSubject(${subject.subject_id})" style="background: #ff4d4d; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; margin-top: 15px; width: 100%;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `;
                });
            }
        } catch (error) { console.error(error); }
    }

    async fetchQuizzes() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/quizzes', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                this.quizzesList.innerHTML = ''; 
                if (data.quizzes.length === 0) return this.quizzesList.innerHTML = '<p>No quizzes found.</p>';
                data.quizzes.forEach(quiz => {
                    this.quizzesList.innerHTML += `
                        <div class="glass-card stat-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <i class="${quiz.icon_class}" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"></i>
                                <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${quiz.title}</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">${quiz.subject_name}</p>
                                <div style="font-size: 0.85rem; display: flex; justify-content: space-around; margin-top: 15px; background: var(--glass-border); padding: 8px; border-radius: 8px;">
                                    <span><i class="fas fa-clock"></i> ${quiz.time_limit_minutes}m</span>
                                    <span><i class="fas fa-check-double"></i> ${quiz.passing_score}%</span>
                                </div>
                            </div>
                            <button onclick="dashboardApp.deleteQuiz(${quiz.quiz_id})" style="background: #ff4d4d; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; margin-top: 15px; width: 100%;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `;
                });
            }
        } catch (error) { console.error(error); }
    }

    async fetchStudents() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/users/students', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                this.studentsList.innerHTML = ''; 
                if (data.students.length === 0) return this.studentsList.innerHTML = '<p>No students enrolled yet.</p>';
                
                data.students.forEach(student => {
                    this.studentsList.innerHTML += `
                        <div class="glass-card stat-card" style="text-align: left; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <i class="fas fa-user-graduate" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"></i>
                                <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${student.name}</h4>
                                <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">
                                    <i class="fas fa-envelope"></i> ${student.email}
                                </p>
                                <p style="font-size: 0.95rem; color: #ff6b6b; font-family: monospace; font-weight: bold;">
                                    <i class="fas fa-key"></i> Password: ${student.password}
                                </p>
                            </div>
                            <button onclick="dashboardApp.deleteStudent(${student.user_id})" style="background: #ff4d4d; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; margin-top: 15px; width: 100%;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `;
                });
            }
        } catch (error) { console.error(error); }
    }

    // --- NEW DELETE METHODS --- //

    async deleteSubject(id) {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            const response = await fetch(`https://quizzy-evr5.onrender.com/api/v1/subjects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (response.ok) { this.fetchSubjects(); this.fetchDashboardStats(); }
            else { alert('Error deleting subject. Make sure there are no quizzes attached to it.'); }
        } catch (error) { console.error(error); }
    }

    async deleteQuiz(id) {
        if (!confirm('Are you sure you want to delete this quiz?')) return;
        try {
            const response = await fetch(`https://quizzy-evr5.onrender.com/api/v1/quizzes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (response.ok) { this.fetchQuizzes(); this.fetchDashboardStats(); }
        } catch (error) { console.error(error); }
    }

    async deleteStudent(id) {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            const response = await fetch(`https://quizzy-evr5.onrender.com/api/v1/users/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (response.ok) { this.fetchStudents(); this.fetchDashboardStats(); }
        } catch (error) { console.error(error); }
    }

    // --- END DELETE METHODS --- //

    async populateSubjectDropdown() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/subjects', { headers: { 'Authorization': `Bearer ${this.token}` } });
            const data = await response.json();
            if (response.ok) {
                this.quizSubjectSelect.innerHTML = '<option value="" disabled selected>-- Select a Subject --</option>';
                data.subjects.forEach(s => this.quizSubjectSelect.innerHTML += `<option value="${s.subject_id}">${s.name}</option>`);
            }
        } catch (error) { console.error(error); }
    }

    async populateQuizDropdown() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/quizzes', { headers: { 'Authorization': `Bearer ${this.token}` } });
            const data = await response.json();
            if (response.ok) {
                this.questionQuizSelect.innerHTML = '<option value="" disabled selected>-- Select a Quiz --</option>';
                data.quizzes.forEach(q => this.questionQuizSelect.innerHTML += `<option value="${q.quiz_id}">${q.title} (${q.subject_name})</option>`);
            }
        } catch (error) { console.error(error); }
    }

    async handleCreateSubject(e) {
        e.preventDefault();
        const name = document.getElementById('subjectName').value;
        const description = document.getElementById('subjectDescription').value;
        const icon_class = document.getElementById('subjectIcon').value;
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
                body: JSON.stringify({ name, description, icon_class })
            });
            if (response.ok) { this.createSubjectForm.reset(); this.fetchSubjects(); this.fetchDashboardStats(); } 
            else { alert('Error: ' + (await response.json()).message); }
        } catch (error) { alert('Failed to connect.'); }
    }

    async handleCreateQuiz(e) {
        e.preventDefault();
        const subject_id = this.quizSubjectSelect.value;
        const title = document.getElementById('quizTitle').value;
        const time_limit_minutes = document.getElementById('quizTimeLimit').value;
        const passing_score = document.getElementById('quizPassingScore').value;
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
                body: JSON.stringify({ subject_id, title, time_limit_minutes, passing_score })
            });
            if (response.ok) { this.createQuizForm.reset(); this.fetchQuizzes(); this.fetchDashboardStats(); } 
            else { alert('Error: ' + (await response.json()).message); }
        } catch (error) { alert('Failed to connect.'); }
    }

    async handleCreateQuestion(e) {
        e.preventDefault();
        const body = {
            quiz_id: document.getElementById('questionQuizSelect').value,
            question_text: document.getElementById('questionText').value,
            option_a: document.getElementById('optionA').value,
            option_b: document.getElementById('optionB').value,
            option_c: document.getElementById('optionC').value,
            option_d: document.getElementById('optionD').value,
            correct_option: document.getElementById('correctOption').value
        };
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
                body: JSON.stringify(body)
            });
            if (response.ok) { 
                alert('Question successfully saved to quiz!');
                this.createQuestionForm.reset(); 
            } else { alert('Error: ' + (await response.json()).message); }
        } catch (error) { alert('Failed to connect.'); }
    }

    async handleCreateStudent(e) {
        e.preventDefault();
        const name = document.getElementById('studentName').value;
        const email = document.getElementById('studentEmail').value;
        const password = document.getElementById('studentPassword').value;

        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/users/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                alert('Success: ' + data.message);
                this.createStudentForm.reset();
                this.fetchStudents();
                this.fetchDashboardStats();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) { alert('Failed to connect to server.'); }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = this.themeToggleBtn.querySelector('i');
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }

    logout() {
        localStorage.removeItem('quiz_auth_token');
        window.location.href = '../index.html';
    }
}

const dashboardApp = new AdminDashboard();