# AI Prompts & Engineering Conversations (AI_PROMPTS.md)

## Project: Online Quiz Application
* **Framework:** Antigravity AI Pair-Programming Methodology
* **Domain:** Full-Stack Web Development (HTML5 / CSS3 / Vanilla JS + Flask + SQLite)

---

## 1. Engineering Philosophy & AI Interaction Strategy

This project was built following an **AI-Assisted Pair-Programming Paradigm**. The human developer acted as the Software Architect and Quality Assurance Lead, while the AI assistant provided rapid implementation, edge-case analysis, schema synthesis, and automated test orchestration.

---

## 2. Structured Prompt Sequence & Technical Context

### Prompt Phase 1: Frontend UI/UX Architecture
```text
System Context: Senior Frontend UI/UX Engineer
Objective: Design a clean, responsive, single-page quiz application interface using semantic HTML5 and modern CSS3.
Requirements:
1. Three clean states: Home/Start Screen, Quiz Screen, Results Screen, plus an accessible Results History Modal.
2. Modern CSS custom properties for theming (indigo/violet primary, emerald success, rose danger).
3. Mobile-first responsive grid and flexbox layout.
4. Single-choice answer card design with circular letter badges (A, B, C, D) and selection checkmarks.
5. Micro-animations: smooth transitions, floating bounce for icons, pulsing timer warnings.
Avoid: React, Tailwind, bootstrap, external fonts, or node build steps.
```

### Prompt Phase 2: SQLite Schema & Data Access Layer
```text
System Context: Database Architect & Python Systems Programmer
Objective: Implement database.py using standard library sqlite3 for the Online Quiz Application.
Requirements:
1. Define 3 tables: questions, users, and quiz_results.
2. Auto-create database quiz.db and tables on boot via init_db().
3. Auto-seed 10 multiple-choice questions across HTML, CSS, JavaScript, Computer Basics, and General Knowledge if the questions table is empty.
4. Provide helper functions:
   - get_all_questions(include_answers=False) to protect correct answers from leaking to clients.
   - process_quiz_submission(username, answers_map) to calculate score, wrong answers, and percentage on the backend, insert records into users and quiz_results, and return a review object.
   - get_all_results(limit=50) for history view.
5. Use parameterized queries exclusively to prevent SQL injection.
```

### Prompt Phase 3: Flask REST API & Anti-Cheat Controller
```text
System Context: Backend API Specialist
Objective: Create app.py implementing a lightweight Flask REST API and static asset server.
Requirements:
1. Serve index.html, style.css, and script.js at root paths.
2. Provide endpoints:
   - GET /api/health
   - GET /api/questions (stripping out correct_answer and explanation for anti-cheat)
   - GET /api/questions/<id>
   - POST /api/submit-quiz (evaluates payload, enforces non-empty username, calculates score in DB, commits result)
   - GET /api/results (fetches recent quiz attempts)
3. Ensure proper HTTP status codes (200, 400, 404, 500) and structured JSON error responses.
```

### Prompt Phase 4: Client-Side State Management & Timer
```text
System Context: Senior Vanilla JavaScript Developer
Objective: Refactor script.js to integrate with the Flask REST API and implement exam timers.
Requirements:
1. Validate candidate username before starting quiz.
2. Fetch questions dynamically from GET /api/questions with loading overlay.
3. Manage a 10-minute (600s) countdown timer using setInterval. Visual warning under 60 seconds; auto-submit when expired.
4. Single-answer selection enforcement: allow choosing only one option per question, update visual selected state, and remember selections during backward/forward navigation.
5. Submit answers to POST /api/submit-quiz and render verified score, percentage, and detailed review cards.
6. Implement modal popup to view past attempts from GET /api/results.
```

### Prompt Phase 5: Verification & Quality Assurance
```text
System Context: QA Test Automation Engineer
Objective: Write an automated test suite verifying all tiers of the application.
Requirements:
1. Verify HTML and JavaScript DOM element ID synchronization.
2. Verify SQLite table creation and question seeding.
3. Test anti-cheat response to ensure correct_answer is never exposed.
4. Test Flask test client endpoints: static index, questions list, single question, validation errors, perfect score calculation, mixed score calculation, and result history retrieval.
```

---

## 3. Key Architectural Takeaways from AI-Assisted Development

1. **Anti-Cheat Defense by Separation**: AI prompts explicitly mandated server-side evaluation. This separated public question presentation from privileged answer verification.
2. **Deterministic State Modeling**: Prompting for single-choice enforcement as a state map (`{question_id: selected_index}`) simplified navigation back and forth across questions.
3. **Zero-Dependency Resilience**: By avoiding heavy frameworks, the application achieves sub-second startup times and zero runtime conflicts.
