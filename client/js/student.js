class StudentDashboard {
    constructor() {
        this.token = localStorage.getItem('quiz_auth_token');
        this.checkAuth();

        this.themeToggleBtn = document.getElementById('themeToggle');
        this.pageTitle = document.getElementById('pageTitle');
        
        // Navigation
        this.navDashboard = document.getElementById('nav-dashboard');
        this.navQuizzes = document.getElementById('nav-quizzes');
        this.navResults = document.getElementById('nav-results');
        
        // Sections
        this.dashboardSection = document.getElementById('dashboardSection');
        this.quizzesSection = document.getElementById('quizzesSection');
        this.resultsSection = document.getElementById('resultsSection');
        
        // Containers
        this.availableQuizzesList = document.getElementById('availableQuizzesList');
        
        // NEW Container
        this.resultsListContainer = document.querySelector('#resultsSection .glass-card'); 
        
        this.initEventListeners();
    }

    checkAuth() {
        if (!this.token) {
            alert('Unauthorized. Please log in first.');
            window.location.href = '../index.html';
        }
    }

    initEventListeners() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        if (this.navDashboard) {
            this.navDashboard.addEventListener('click', () => this.switchTab('dashboard'));
        }
        if (this.navQuizzes) {
            this.navQuizzes.addEventListener('click', () => {
                this.switchTab('quizzes');
                this.fetchAvailableQuizzes();
            });
        }
        if (this.navResults) {
            this.navResults.addEventListener('click', () => {
                this.switchTab('results');
                this.fetchMyResults(); // NEW: Fetch results on click
            });
        }
    }

    switchTab(tabName) {
        this.navDashboard.classList.remove('active');
        this.navQuizzes.classList.remove('active');
        this.navResults.classList.remove('active');
        
        this.dashboardSection.classList.replace('section-active', 'section-hidden');
        this.quizzesSection.classList.replace('section-active', 'section-hidden');
        this.resultsSection.classList.replace('section-active', 'section-hidden');

        if (tabName === 'dashboard') {
            this.navDashboard.classList.add('active');
            this.dashboardSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'Welcome, Student!';
        } else if (tabName === 'quizzes') {
            this.navQuizzes.classList.add('active');
            this.quizzesSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'Available Quizzes';
        } else if (tabName === 'results') {
            this.navResults.classList.add('active');
            this.resultsSection.classList.replace('section-hidden', 'section-active');
            this.pageTitle.textContent = 'My Results';
        }
    }

    async fetchAvailableQuizzes() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/quizzes', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                this.availableQuizzesList.innerHTML = ''; 
                if (data.quizzes.length === 0) {
                    this.availableQuizzesList.innerHTML = '<p>No quizzes available right now.</p>';
                    return;
                }
                
                data.quizzes.forEach(quiz => {
                    this.availableQuizzesList.innerHTML += `
                        <div class="glass-card stat-card">
                            <i class="${quiz.icon_class}" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"></i>
                            <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${quiz.title}</h4>
                            <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">${quiz.subject_name}</p>
                            <div style="font-size: 0.85rem; display: flex; justify-content: space-around; margin-top: 15px; margin-bottom: 15px; background: var(--glass-border); padding: 8px; border-radius: 8px;">
                                <span><i class="fas fa-clock"></i> ${quiz.time_limit_minutes}m</span>
                                <span><i class="fas fa-check-double"></i> ${quiz.passing_score}% passing</span>
                            </div>
                            <button class="take-quiz-btn" onclick="window.location.href='exam.html?quizId=${quiz.quiz_id}'">Take Quiz</button>
                        </div>
                    `;
                });
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    }

    // NEW: Fetch and display the student's past grades
    async fetchMyResults() {
        try {
            const response = await fetch('https://quizzy-evr5.onrender.com/api/v1/quizzes/my-results', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();

            if (response.ok) {
                if (data.results.length === 0) {
                    this.resultsListContainer.innerHTML = '<h2>Your Past Performance</h2><p style="margin-top: 1rem; opacity: 0.8;">You haven\'t completed any quizzes yet.</p>';
                    return;
                }

                this.resultsListContainer.innerHTML = `
                    <h2>Your Past Performance</h2>
                    <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                        ${data.results.map(result => {
                            const date = new Date(result.completed_at).toLocaleDateString();
                            const statusColor = result.passed ? '#28a745' : '#dc3545';
                            const statusText = result.passed ? 'PASSED' : 'FAILED';
                            
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px;">
                                    <div style="display: flex; align-items: center; gap: 1rem; text-align: left;">
                                        <i class="${result.icon_class}" style="font-size: 2rem; color: var(--accent);"></i>
                                        <div>
                                            <h4 style="font-size: 1.2rem; margin: 0;">${result.quiz_title}</h4>
                                            <p style="font-size: 0.9rem; opacity: 0.8; margin: 5px 0 0 0;">${result.subject_name} • ${date}</p>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 5px;">
                                            ${result.score} / ${result.total_questions}
                                        </div>
                                        <div style="font-size: 0.9rem; font-weight: bold; color: ${statusColor}; letter-spacing: 1px;">
                                            ${statusText}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        }
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

const studentApp = new StudentDashboard();