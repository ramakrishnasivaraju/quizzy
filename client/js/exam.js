class ExamRoom {
    constructor() {
        this.token = localStorage.getItem('quiz_auth_token');
        if (!this.token) {
            alert('Unauthorized');
            window.location.href = '../index.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        this.quizId = urlParams.get('quizId');

        if (!this.quizId) {
            alert('No exam selected!');
            window.location.href = 'student-dashboard.html';
            return;
        }

        this.examTitle = document.getElementById('examTitle');
        this.examSubject = document.getElementById('examSubject');
        this.timeRemaining = document.getElementById('timeRemaining');
        this.questionsContainer = document.getElementById('questionsContainer');
        this.submitBtn = document.getElementById('submitExamBtn');
        this.examForm = document.getElementById('examForm');

        this.init();
    }

    async init() {
        try {
            const response = await fetch(`[https://quizzy-evr5.onrender.com](https://quizzy-evr5.onrender.com)/api/v1/questions/exam/${this.quizId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();

            if (response.ok) {
                this.renderExam(data.quiz, data.questions);
            } else {
                alert(data.message);
                window.location.href = 'student-dashboard.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load exam.');
        }
    }

    renderExam(quiz, questions) {
        this.examTitle.textContent = quiz.title;
        this.examSubject.textContent = quiz.subject_name;
        this.timeRemaining.textContent = `${quiz.time_limit_minutes}:00`;

        if (questions.length === 0) {
            this.questionsContainer.innerHTML = '<p>No questions have been added to this exam yet.</p>';
            return;
        }

        this.questionsContainer.innerHTML = '';
        questions.forEach((q, index) => {
            this.questionsContainer.innerHTML += `
                <div class="question-block">
                    <div class="question-text">${index + 1}. ${q.question_text}</div>
                    <ul class="options-list">
                        <li class="option-item">
                            <input type="radio" name="q_${q.question_id}" value="A" required id="q${q.question_id}_a"> 
                            <label for="q${q.question_id}_a" style="cursor: pointer;">A) ${q.option_a}</label>
                        </li>
                        <li class="option-item">
                            <input type="radio" name="q_${q.question_id}" value="B" required id="q${q.question_id}_b"> 
                            <label for="q${q.question_id}_b" style="cursor: pointer;">B) ${q.option_b}</label>
                        </li>
                        <li class="option-item">
                            <input type="radio" name="q_${q.question_id}" value="C" required id="q${q.question_id}_c"> 
                            <label for="q${q.question_id}_c" style="cursor: pointer;">C) ${q.option_c}</label>
                        </li>
                        <li class="option-item">
                            <input type="radio" name="q_${q.question_id}" value="D" required id="q${q.question_id}_d"> 
                            <label for="q${q.question_id}_d" style="cursor: pointer;">D) ${q.option_d}</label>
                        </li>
                    </ul>
                </div>
            `;
        });

        this.submitBtn.classList.remove('hidden');

        // NEW: Grading Engine Submission
        this.examForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Gather all the selected radio buttons
            const formData = new FormData(this.examForm);
            const answers = {};
            
            for (let [key, value] of formData.entries()) {
                // Remove the "q_" prefix to just get the raw question ID
                const questionId = key.replace('q_', '');
                answers[questionId] = value;
            }

            // 2. Send to the backend
            try {
                const response = await fetch(`[https://quizzy-evr5.onrender.com](https://quizzy-evr5.onrender.com)/api/v1/quizzes/exam/${this.quizId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ answers })
                });

                const data = await response.json();

                if (response.ok) {
                    // Show a formatted alert with the grade
                    alert(`EXAM GRADED!\n\nScore: ${data.score} out of ${data.total}\nGrade: ${data.percentage}%\n\nResult: ${data.message}`);
                    
                    // Redirect back to the dashboard
                    window.location.href = 'student-dashboard.html';
                } else {
                    alert('Error submitting exam: ' + data.message);
                }
            } catch (error) {
                console.error('Error submitting exam:', error);
                alert('Failed to connect to the grading server.');
            }
        });
    }
}

const examApp = new ExamRoom();