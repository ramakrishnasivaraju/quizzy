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
        this.timerInterval = null; 

        this.init();
    }

    async init() {
        try {
            const response = await fetch(`https://quizzy-evr5.onrender.com/api/v1/questions/exam/${this.quizId}`, {
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

        // --- NEW: FUNCTIONAL COUNTDOWN TIMER --- //
        let timeInSeconds = quiz.time_limit_minutes * 60;
        
        const updateTimerDisplay = () => {
            let minutes = Math.floor(timeInSeconds / 60);
            let seconds = timeInSeconds % 60;
            this.timeRemaining.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };
        
        updateTimerDisplay(); // Set the clock immediately
        
        this.timerInterval = setInterval(() => {
            timeInSeconds--;
            updateTimerDisplay();
            
            if (timeInSeconds <= 0) {
                clearInterval(this.timerInterval);
                alert("Time is up! Your exam will now be submitted automatically.");
                // Automatically click the submit button behind the scenes
                this.examForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }, 1000);
        // --- END TIMER --- //

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

        this.examForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Stop the timer clock once the student hits submit
            if (this.timerInterval) clearInterval(this.timerInterval);
            
            const formData = new FormData(this.examForm);
            const answers = {};
            
            for (let [key, value] of formData.entries()) {
                const questionId = key.replace('q_', '');
                answers[questionId] = value;
            }

            try {
                const response = await fetch(`https://quizzy-evr5.onrender.com/api/v1/quizzes/exam/${this.quizId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ answers })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`EXAM GRADED!\n\nScore: ${data.score} out of ${data.total}\nGrade: ${data.percentage}%\n\nResult: ${data.message}`);
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