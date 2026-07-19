class QuizApp {
    constructor() {
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.landingView = document.getElementById('landingView');
        this.loginView = document.getElementById('loginView');
        this.loginTitle = document.getElementById('loginTitle');
        this.loginRoleInput = document.getElementById('loginRole');
        this.authForm = document.getElementById('authForm');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.authForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = this.themeToggleBtn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    showLogin(role) {
        this.landingView.classList.replace('view-active', 'view-hidden');
        this.loginView.classList.replace('view-hidden', 'view-active');
        this.loginTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
        this.loginRoleInput.value = role;
    }

    showLanding() {
        this.loginView.classList.replace('view-active', 'view-hidden');
        this.landingView.classList.replace('view-hidden', 'view-active');
        this.authForm.reset();
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = this.loginRoleInput.value;

        try {
            const response = await fetch('[https://quizzy-evr5.onrender.com](https://quizzy-evr5.onrender.com)/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Save the digital ID badge
                localStorage.setItem('quiz_auth_token', data.token);
                
                // redirect to the correct dashboard!
                window.location.href = role === 'admin' ? './pages/admin-dashboard.html' : './pages/student-dashboard.html';
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Failed to connect to the server. Is your backend running?');
        }
    }
}

const app = new QuizApp();