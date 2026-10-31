/**
 * ============================================================================
 * Online Quiz Application - Client-Side JavaScript Logic
 * Modern, clean Vanilla JS connecting to Python Flask REST API & SQLite DB.
 * Features: Username login, REST API questions loading, single-choice selection,
 * 10-minute countdown timer, backend scoring, review generator, and results history.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CONFIGURATION & STATE
// ----------------------------------------------------------------------------
const CONFIG = {
  API_BASE: "/api",
  TOTAL_TIME_SECONDS: 600, // 10 minutes countdown
};

let quizQuestions = [];      // Loaded from GET /api/questions
let currentQuestionIndex = 0;
let userAnswers = {};        // Map: { question_id: selectedOptionIndex }
let currentUsername = "";
let timerInterval = null;
let timeRemaining = CONFIG.TOTAL_TIME_SECONDS;
let isSubmitting = false;

// ----------------------------------------------------------------------------
// 2. DOM ELEMENTS
// ----------------------------------------------------------------------------
// Overlays & Alerts
const loadingOverlay = document.getElementById("loading-overlay");
const loadingMessage = document.getElementById("loading-message");
const errorBanner = document.getElementById("error-banner");
const errorMessage = document.getElementById("error-message");
const errorCloseBtn = document.getElementById("error-close-btn");

// Screens
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

// Start Screen Elements
const usernameInput = document.getElementById("username-input");
const usernameError = document.getElementById("username-error");
const startBtn = document.getElementById("start-btn");
const viewHistoryBtn = document.getElementById("view-history-btn");

// Quiz Screen Elements
const questionCategoryEl = document.getElementById("question-category");
const candidateTagEl = document.getElementById("candidate-tag");
const timerBadgeEl = document.getElementById("timer-badge");
const timerDisplayEl = document.getElementById("timer-display");
const questionCounterEl = document.getElementById("question-counter");
const progressFillEl = document.getElementById("progress-fill");
const progressTextEl = document.getElementById("progress-text");
const questionTextEl = document.getElementById("question-text");
const optionsContainerEl = document.getElementById("options-container");
const quizAlertEl = document.getElementById("quiz-alert");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Result Screen Elements
const resultIconEl = document.getElementById("result-icon");
const resultCandidateNameEl = document.getElementById("result-candidate-name");
const resultMessageEl = document.getElementById("result-message");
const finalPercentageEl = document.getElementById("final-percentage");
const statTotalEl = document.getElementById("stat-total");
const statCorrectEl = document.getElementById("stat-correct");
const statIncorrectEl = document.getElementById("stat-incorrect");
const statMarksEl = document.getElementById("stat-marks");
const restartBtn = document.getElementById("restart-btn");
const reviewToggleBtn = document.getElementById("review-toggle-btn");
const resultHistoryBtn = document.getElementById("result-history-btn");
const reviewSectionEl = document.getElementById("review-section");
const reviewContainerEl = document.getElementById("review-container");

// History Modal Elements
const historyModal = document.getElementById("history-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalDismissBtn = document.getElementById("modal-dismiss-btn");
const historyRefreshBtn = document.getElementById("history-refresh-btn");
const historyTableWrapper = document.getElementById("history-table-wrapper");
const historyCountLabel = document.getElementById("history-count-label");

const optionLetters = ["A", "B", "C", "D"];

// ----------------------------------------------------------------------------
// 3. UI FEEDBACK HELPERS (Loading & Errors)
// ----------------------------------------------------------------------------

function showLoading(msg = "Loading...") {
  loadingMessage.textContent = msg;
  loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  loadingOverlay.classList.add("hidden");
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorBanner.classList.remove("hidden");
  // Auto-hide error banner after 6 seconds
  setTimeout(() => {
    errorBanner.classList.add("hidden");
  }, 6000);
}

function hideError() {
  errorBanner.classList.add("hidden");
}

function showAlert(msg) {
  quizAlertEl.querySelector("span").textContent = `⚠️ ${msg}`;
  quizAlertEl.classList.remove("hidden");
}

function hideAlert() {
  quizAlertEl.classList.add("hidden");
}

// ----------------------------------------------------------------------------
// 4. QUIZ INITIALIZATION & NAVIGATION
// ----------------------------------------------------------------------------

/**
 * Validates candidate name, loads questions via REST API, and starts quiz.
 */
async function startQuiz() {
  hideError();
  const rawName = usernameInput.value.trim();

  // Validate Name
  if (!rawName) {
    usernameError.classList.remove("hidden");
    usernameInput.focus();
    return;
  }
  usernameError.classList.add("hidden");
  currentUsername = rawName;

  showLoading("Fetching questions from Flask REST API...");

  try {
    const response = await fetch(`${CONFIG.API_BASE}/questions`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: Failed to retrieve questions.`);
    }
    const data = await response.json();

    if (!data.success || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("No questions returned from database.");
    }

    quizQuestions = data.questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    isSubmitting = false;

    // Transition screens
    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    // Display candidate name
    candidateTagEl.textContent = `Candidate: ${currentUsername}`;

    // Load first question & start timer
    loadQuestion(currentQuestionIndex);
    startTimer();
  } catch (err) {
    console.error("Start quiz error:", err);
    showError("Could not start quiz: " + err.message);
  } finally {
    hideLoading();
  }
}

/**
 * Loads a question by index and renders its 4 options.
 * @param {number} index 
 */
function loadQuestion(index) {
  hideAlert();
  if (index < 0 || index >= quizQuestions.length) return;

  const qData = quizQuestions[index];

  // Top Bar Details
  questionCategoryEl.textContent = `Category: ${qData.category || "General"}`;
  questionCounterEl.textContent = `Question ${index + 1} of ${quizQuestions.length}`;

  // Progress Bar
  const progressPercent = Math.round(((index + 1) / quizQuestions.length) * 100);
  progressFillEl.style.width = `${progressPercent}%`;
  progressTextEl.textContent = `${progressPercent}% Completed`;

  // Question Text
  questionTextEl.textContent = `${index + 1}. ${qData.question}`;

  // Render 4 Options
  optionsContainerEl.innerHTML = "";
  const currentSelection = userAnswers[qData.id];

  qData.options.forEach((optText, optIndex) => {
    const optionBtn = document.createElement("button");
    optionBtn.type = "button";
    optionBtn.className = "option-btn";
    optionBtn.setAttribute("data-index", optIndex);

    if (currentSelection === optIndex) {
      optionBtn.classList.add("selected");
    }

    optionBtn.innerHTML = `
      <span class="option-letter">${optionLetters[optIndex]}</span>
      <span class="option-text">${escapeHtml(optText)}</span>
      <span class="option-indicator" aria-hidden="true">✔</span>
    `;

    // Click handler strictly enforces SINGLE answer selection
    optionBtn.addEventListener("click", () => selectOption(qData.id, optIndex));

    optionsContainerEl.appendChild(optionBtn);
  });

  // Nav buttons state
  prevBtn.disabled = index === 0;

  if (index === quizQuestions.length - 1) {
    nextBtn.innerHTML = `<span>Submit Quiz</span> <span class="btn-arrow">✓</span>`;
    nextBtn.classList.add("btn-submit");
  } else {
    nextBtn.innerHTML = `<span>Next</span> <span class="btn-arrow">→</span>`;
    nextBtn.classList.remove("btn-submit");
  }
}

/**
 * Selects an option for the current question.
 * Strictly prevents multiple selections by updating single question ID key.
 * @param {number} questionId 
 * @param {number} optionIndex 
 */
function selectOption(questionId, optionIndex) {
  hideAlert();
  userAnswers[questionId] = optionIndex;

  // Visual selection update
  const allBtns = optionsContainerEl.querySelectorAll(".option-btn");
  allBtns.forEach((btn) => {
    const btnIdx = parseInt(btn.getAttribute("data-index"), 10);
    if (btnIdx === optionIndex) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
}

/**
 * Handles Next button click.
 */
function handleNext() {
  const currentQ = quizQuestions[currentQuestionIndex];
  if (!currentQ) return;

  // Enforce selecting an answer before proceeding
  if (userAnswers[currentQ.id] === undefined || userAnswers[currentQ.id] === null) {
    showAlert("Please select an answer before proceeding!");
    return;
  }

  if (currentQuestionIndex === quizQuestions.length - 1) {
    // Submit Quiz on last question
    submitQuiz();
  } else {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
  }
}

/**
 * Handles Previous button click.
 */
function handlePrevious() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion(currentQuestionIndex);
  }
}

// ----------------------------------------------------------------------------
// 5. COUNTDOWN TIMER
// ----------------------------------------------------------------------------

function startTimer() {
  clearInterval(timerInterval);
  timeRemaining = CONFIG.TOTAL_TIME_SECONDS;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeExpired();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  timerDisplayEl.textContent = formatted;

  // Visual warning when under 60 seconds
  if (timeRemaining <= 60) {
    timerBadgeEl.classList.add("timer-warning");
  } else {
    timerBadgeEl.classList.remove("timer-warning");
  }
}

function handleTimeExpired() {
  showAlert("Time has expired! Automatically submitting your answers now...");
  setTimeout(() => {
    submitQuiz(true);
  }, 1000);
}

// ----------------------------------------------------------------------------
// 6. QUIZ SUBMISSION & BACKEND SCORING
// ----------------------------------------------------------------------------

/**
 * Submits user answers to POST /api/submit-quiz and presents verified results.
 * @param {boolean} isAutoSubmit 
 */
async function submitQuiz(isAutoSubmit = false) {
  if (isSubmitting) return;
  isSubmitting = true;
  clearInterval(timerInterval);

  showLoading("Submitting quiz & calculating score in SQLite database...");

  try {
    const payload = {
      username: currentUsername,
      answers: userAnswers
    };

    const response = await fetch(`${CONFIG.API_BASE}/submit-quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}: Submission failed.`);
    }

    const resJson = await response.json();
    if (!resJson.success || !resJson.data) {
      throw new Error("Invalid response format received from server.");
    }

    // Display Results
    displayResults(resJson.data);
  } catch (err) {
    console.error("Submission error:", err);
    showError("Submission failed: " + err.message);
    isSubmitting = false;
  } finally {
    hideLoading();
  }
}

/**
 * Populates result statistics, performance message, and review breakdown.
 * @param {Object} data 
 */
function displayResults(data) {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  resultCandidateNameEl.textContent = data.username;
  statTotalEl.textContent = data.total_questions;
  statCorrectEl.textContent = data.correct_answers;
  statIncorrectEl.textContent = data.wrong_answers;
  statMarksEl.textContent = `${data.score} / ${data.total_questions}`;
  finalPercentageEl.textContent = `${data.percentage}%`;

  // Performance Message & Icon based on Score
  let message = "";
  let icon = "🏆";

  if (data.percentage === 100) {
    icon = "🌟";
    message = "Outstanding! Perfect score! You mastered all topics!";
  } else if (data.percentage >= 80) {
    icon = "🎉";
    message = "Excellent work! You have strong technical and general knowledge!";
  } else if (data.percentage >= 60) {
    icon = "👏";
    message = "Good job! You passed, but a little more practice will make you great!";
  } else if (data.percentage >= 40) {
    icon = "📚";
    message = "Fair attempt! Review the answers below to strengthen your basics.";
  } else {
    icon = "💪";
    message = "Don't give up! Review the correct answers below and try again!";
  }

  resultIconEl.textContent = icon;
  resultMessageEl.textContent = message;

  // Build Review Section with server-verified explanations
  buildReviewList(data.review || []);

  // Reset Review view state
  reviewSectionEl.classList.add("hidden");
  reviewToggleBtn.innerHTML = `<span>📝 Review Answers</span>`;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Builds the review list from server response.
 * @param {Array} reviewItems 
 */
function buildReviewList(reviewItems) {
  reviewContainerEl.innerHTML = "";

  reviewItems.forEach((item, idx) => {
    const isCorrect = item.is_correct;
    const isSkipped = item.user_answer === null || item.user_answer === undefined;

    const userAnsText = isSkipped
      ? "Not Answered"
      : `${optionLetters[item.user_answer]}. ${item.options[item.user_answer]}`;

    const correctAnsText = `${optionLetters[item.correct_answer]}. ${item.options[item.correct_answer]}`;

    const card = document.createElement("div");
    card.className = `review-card ${isCorrect ? "correct" : "incorrect"}`;

    card.innerHTML = `
      <div class="review-card-top">
        <span class="review-qnum">Question ${idx + 1} (${escapeHtml(item.category || "General")})</span>
        <span class="review-card-status">${isCorrect ? "✔ Correct" : "✖ Incorrect"}</span>
      </div>
      <div class="review-question-text">${escapeHtml(item.question)}</div>
      <div class="review-answers-box">
        <div class="review-ans-row">
          <span class="ans-label">Your Answer: </span>
          <span class="ans-text-user ${isCorrect ? "correct" : "wrong"}">${escapeHtml(userAnsText)}</span>
        </div>
        ${
          !isCorrect
            ? `
          <div class="review-ans-row">
            <span class="ans-label">Correct Answer: </span>
            <span class="ans-text-correct">${escapeHtml(correctAnsText)}</span>
          </div>
        `
            : ""
        }
      </div>
      <div class="review-explanation">
        <strong>Explanation:</strong> ${escapeHtml(item.explanation || "No explanation provided.")}
      </div>
    `;

    reviewContainerEl.appendChild(card);
  });
}

function toggleReview() {
  const isHidden = reviewSectionEl.classList.contains("hidden");
  if (isHidden) {
    reviewSectionEl.classList.remove("hidden");
    reviewToggleBtn.innerHTML = `<span>▲ Hide Review</span>`;
    reviewSectionEl.scrollIntoView({ behavior: "smooth" });
  } else {
    reviewSectionEl.classList.add("hidden");
    reviewToggleBtn.innerHTML = `<span>📝 Review Answers</span>`;
  }
}

function restartQuiz() {
  clearInterval(timerInterval);
  isSubmitting = false;
  currentQuestionIndex = 0;
  userAnswers = {};

  resultScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");

  // Keep candidate name or let them modify it
  usernameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----------------------------------------------------------------------------
// 7. PREVIOUS RESULTS MODAL (SQLite HISTORY)
// ----------------------------------------------------------------------------

async function openHistoryModal() {
  historyModal.classList.remove("hidden");
  loadResultsHistory();
}

function closeHistoryModal() {
  historyModal.classList.add("hidden");
}

async function loadResultsHistory() {
  historyTableWrapper.innerHTML = `
    <div class="empty-history-box">
      <div class="spinner" style="margin: 0 auto 12px; width: 36px; height: 36px;"></div>
      <p>Loading records from SQLite database...</p>
    </div>
  `;

  try {
    const response = await fetch(`${CONFIG.API_BASE}/results`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch results.`);
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.results)) {
      throw new Error("Invalid results data returned.");
    }

    renderHistoryTable(data.results);
  } catch (err) {
    console.error("History fetch error:", err);
    historyTableWrapper.innerHTML = `
      <div class="empty-history-box">
        <p style="color: var(--danger);">⚠️ Error loading results: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderHistoryTable(results) {
  if (results.length === 0) {
    historyCountLabel.textContent = "0 attempts found";
    historyTableWrapper.innerHTML = `
      <div class="empty-history-box">
        <div class="empty-history-icon">📊</div>
        <p>No quiz attempts found in database yet.</p>
        <p style="font-size: 0.82rem; margin-top: 4px;">Take the quiz to record your first score!</p>
      </div>
    `;
    return;
  }

  historyCountLabel.textContent = `Total ${results.length} attempt(s) recorded in SQLite`;

  let html = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Candidate</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  results.forEach((row) => {
    const isPass = row.percentage >= 60;
    const statusPill = isPass
      ? `<span class="pill-status pill-pass">Passed</span>`
      : `<span class="pill-status pill-fail">Needs Practice</span>`;

    html += `
      <tr>
        <td>${escapeHtml(row.quiz_date || "N/A")}</td>
        <td><strong>${escapeHtml(row.username)}</strong></td>
        <td>${row.score} / ${row.total_questions}</td>
        <td><strong>${row.percentage}%</strong></td>
        <td>${statusPill}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  historyTableWrapper.innerHTML = html;
}

// ----------------------------------------------------------------------------
// 8. UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ----------------------------------------------------------------------------
// 9. EVENT LISTENERS
// ----------------------------------------------------------------------------
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNext);
prevBtn.addEventListener("click", handlePrevious);
restartBtn.addEventListener("click", restartQuiz);
reviewToggleBtn.addEventListener("click", toggleReview);
viewHistoryBtn.addEventListener("click", openHistoryModal);
resultHistoryBtn.addEventListener("click", openHistoryModal);

modalCloseBtn.addEventListener("click", closeHistoryModal);
modalDismissBtn.addEventListener("click", closeHistoryModal);
historyRefreshBtn.addEventListener("click", loadResultsHistory);
errorCloseBtn.addEventListener("click", hideError);

// Close modal on outside backdrop click
historyModal.addEventListener("click", (e) => {
  if (e.target === historyModal) {
    closeHistoryModal();
  }
});

// Press Enter inside username input to start quiz
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startQuiz();
  }
});

// Keyboard Navigation for questions
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !historyModal.classList.contains("hidden")) {
    closeHistoryModal();
  }
  if (e.key === "ArrowRight" && !quizScreen.classList.contains("hidden") && historyModal.classList.contains("hidden")) {
    handleNext();
  }
  if (e.key === "ArrowLeft" && !quizScreen.classList.contains("hidden") && historyModal.classList.contains("hidden")) {
    handlePrevious();
  }
});
