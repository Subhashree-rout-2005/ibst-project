# Product Requirements Document (PRD)

## Project: Online Quiz Application
* **Document Version:** 1.0.0
* **Target Release:** Academic Year 2026–2027
* **Author / Submitter:** MCA / Computer Science Department, Srusti Academy of Management
* **Status:** Approved & Implemented

---

## 1. Executive Summary & Problem Statement

### 1.1 Background
Conventional physical examinations and pen-and-paper assessments involve significant administrative overhead, manual grading latency, high paper consumption, and increased vulnerability to human calculation errors. Furthermore, self-assessment tools often require complex setup, heavy database configurations, or subscription-based platforms that are inaccessible for simple classroom testing.

### 1.2 Objective
The objective of the **Online Quiz Application** is to provide an intuitive, high-performance, and lightweight assessment web application. The platform provides:
1. Candidate registration with zero configuration.
2. Anti-cheat server-side evaluation where correct answers are shielded from browser inspection.
3. Accurate countdown timer management with automated submission upon expiration.
4. Instantaneous score computation, graphical percentage presentation, and in-depth conceptual explanations.
5. Historical attempt logging into an embedded SQLite database.

---

## 2. Target Audience & User Personas

| Persona | Role | Key Needs & Pain Points |
| :--- | :--- | :--- |
| **Learner / Student (e.g., Rahul)** | Candidate undertaking self-assessment | Needs a distraction-free, responsive interface that works on both smartphone and laptop, clearly indicates time remaining, and provides instant explanations for mistakes. |
| **Instructor / Evaluator** | Educational administrator | Requires tamper-proof score evaluation, automated grading without client-side manipulation, and historical records of student performance. |
| **Lab Technician / Evaluator** | System deployment & verification | Demands zero-headache installation without installing heavy database servers (like MySQL or Oracle) or complex multi-container orchestration. |

---

## 3. Product Scope

### 3.1 In-Scope Features
* **Single Page Application (SPA) Client**: Pure HTML5, CSS3, and ES6+ JavaScript.
* **RESTful Backend**: Python Flask with JSON-based API contracts.
* **Persistent Database**: SQLite 3 file (`quiz.db`) generated on initialization.
* **Dynamic Content Delivery**: 10 curated questions across HTML, CSS, JavaScript, Computer Basics, and General Knowledge.
* **Candidate Identification**: Required name input before beginning the examination.
* **Anti-Cheat Data Security**: Client API payload excludes `correct_answer` and `explanation`.
* **Timing & State Enforcement**: 10-minute countdown clock with client-side synchronization and server evaluation.
* **Result Review & Explanation**: Clear summary card, percentage score, marks breakdown, and itemized answer review.
* **Results History Module**: Interactive modal displaying previous quiz attempts retrieved from SQLite.

### 3.2 Out-of-Scope (Future Enhancements)
* Role-based access control (RBAC) with instructor password protection.
* User photo verification via webcam integration.
* Multi-tenant cloud synchronization.

---

## 4. Functional Requirements (FR)

### FR-1: Candidate Registration & Home Page
* **FR-1.1**: The system shall present an introductory interface highlighting quiz guidelines, category distribution, and timing.
* **FR-1.2**: The candidate shall enter their full name in a dedicated text input before initiating the quiz.
* **FR-1.3**: The system shall reject whitespace-only or empty submissions, presenting an immediate warning message.

### FR-2: Anti-Cheat Question Delivery
* **FR-2.1**: The client shall request active quiz questions from `GET /api/questions`.
* **FR-2.2**: The server response shall omit `correct_answer` and `explanation` attributes to prevent client-side DOM or network inspection cheating.

### FR-3: Question Presentation & Progress Tracking
* **FR-3.1**: The application shall present exactly one question at a time.
* **FR-3.2**: Each question must display four distinct multiple-choice options with letter badges (A, B, C, D).
* **FR-3.3**: The interface must feature a progress bar and label reflecting the candidate's exact progress (e.g., `Question 4 of 10` & `40% Completed`).

### FR-4: Single-Choice Selection Enforcement
* **FR-4.1**: Candidates can choose only one option per question.
* **FR-4.2**: Clicking a new option automatically deselects any previously selected option.
* **FR-4.3**: Selection states must persist when navigating backward or forward.

### FR-5: Bi-Directional Question Navigation
* **FR-5.1**: A **Previous** button shall allow navigation to preceding questions. It must remain disabled on Question 1.
* **FR-5.2**: A **Next** button shall advance to subsequent questions.
* **FR-5.3**: On the final question, the Next button shall morph into a **Submit Quiz** button.
* **FR-5.4**: Candidates must select an answer before moving forward; otherwise, a non-intrusive warning alert is displayed.

### FR-6: 10-Minute Countdown Clock
* **FR-6.1**: A synchronized countdown timer of 600 seconds (10 minutes) begins immediately when the quiz starts.
* **FR-6.2**: The timer badge turns into a pulsing warning state when time remaining drops below 60 seconds.
* **FR-6.3**: When the clock hits `00:00`, the system automatically submits all recorded answers to the server.

### FR-7: Server-Side Evaluation & Scoring
* **FR-7.1**: The client submits candidate name and answer choices to `POST /api/submit-quiz`.
* **FR-7.2**: The server queries authoritative answers from the SQLite `questions` table and calculates:
  $$\text{Score} = \sum [\text{User Answer} == \text{Correct Answer}]$$
  $$\text{Percentage} = \left(\frac{\text{Score}}{\text{Total Questions}}\right) \times 100$$
* **FR-7.3**: The server inserts the candidate record into `users` and `quiz_results`.

### FR-8: Result Dashboard & Detailed Review
* **FR-8.1**: The results card displays Candidate Name, Circular Percentage Score, Total Questions, Correct Answers, Wrong Answers, and Marks.
* **FR-8.2**: A dynamic motivational message and icon are displayed according to performance.
* **FR-8.3**: A collapsible **Review Answers** module displays each question, candidate's response (color-coded green or red), correct response, and conceptual explanation.

### FR-9: SQLite Result History
* **FR-9.1**: An interactive modal displays past quiz sessions fetched from `GET /api/results`.
* **FR-9.2**: Displays timestamp, candidate name, score, percentage, and passing status badge.

### FR-10: Quiz Reset
* **FR-10.1**: The **Restart Quiz** button resets all in-memory answer mappings, clears timers, and returns the candidate to the registration screen.

---

## 5. Non-Functional Requirements (NFR)

| ID | Category | Metric / Specification |
| :--- | :--- | :--- |
| **NFR-1** | **Performance** | API response latency $< 100\text{ ms}$ on local server; page load $< 500\text{ ms}$. |
| **NFR-2** | **Security & Integrity** | Parameterized SQL queries preventing SQL injection; server-side answer evaluation. |
| **NFR-3** | **Responsiveness** | Fluid display across mobile ($320\text{px}$), tablet ($768\text{px}$), and desktop ($1080\text{px}+$ screens). |
| **NFR-4** | **Usability & A11y** | WCAG compliant contrast ratios; keyboard accessibility (Enter/Arrow navigation). |
| **NFR-5** | **Zero External Dependencies** | Runs offline without external CDN dependencies or third-party APIs. |
| **NFR-6** | **Reliability** | Atomic SQLite transactions; error banners for network interruptions. |

---

## 6. Acceptance Criteria Matrix

| Test Scenario | Verification Condition | Status |
| :--- | :--- | :--- |
| Empty Name Submission | Start Quiz button triggers red validation error; quiz does not start. | Passed |
| Network Payload Inspection | `GET /api/questions` payload inspectable in DevTools contains no `correct_answer`. | Passed |
| Navigation Answer Persistence | Selecting Option B on Q1, moving to Q2, and clicking Previous shows Option B selected. | Passed |
| Timer Expiry Auto-Submit | Running down clock triggers automatic submission and transitions to Results screen. | Passed |
| SQLite Persistence | Result appears in `/api/results` table immediately after submission. | Passed |
