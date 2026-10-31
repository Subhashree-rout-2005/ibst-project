# Online Quiz Application

A modern, responsive, full-stack **Online Quiz Application** built using **HTML5, CSS3, Vanilla JavaScript, Python Flask, and SQLite**.

---

## 📌 Project Overview

The **Online Quiz Application** is an interactive computer-based testing platform designed for students and educators. It delivers a seamless, cheat-resistant assessment environment with client-side timer management, single-choice answer locking, and server-side evaluation. All scores and candidate attempts are persistently recorded in a local SQLite database (`quiz.db`).

### Key Features
* **User Authentication & Identification**: Candidates provide their full name before starting the quiz session.
* **10 Curated Multiple-Choice Questions**: Spans **HTML**, **CSS**, **JavaScript**, **Computer Basics**, and **General Knowledge**.
* **Anti-Cheat Architecture**: Correct answers and explanations are never sent to the client browser during the quiz session. All scoring and evaluation occur strictly on the Python Flask backend.
* **10-Minute Countdown Clock**: Active visual countdown timer with warning alerts and automated submission when time runs out.
* **Single-Choice Enforced Selection**: Smooth, accessible cards where selecting an option deselects previous options and locks the choice until modified.
* **Bi-Directional Navigation**: Candidates can navigate back and forth using **Previous** and **Next** buttons to review their responses.
* **Instant Backend Scoring & Detailed Review**: Calculates total questions, correct answers, wrong answers, marks, and percentage. Provides an in-depth answer review with explanations for each question.
* **Persistent Quiz History**: SQLite storage records all test attempts. Past results can be reviewed through an interactive modal.
* **Zero Heavy Dependencies**: Pure standard library SQLite, lightweight Flask REST API, and native ES6+ JavaScript without frontend frameworks.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Semantic markup, responsive CSS variables, asynchronous Fetch API |
| **Backend** | Python Flask | Lightweight WSGI REST API serving endpoints and static files |
| **Database** | SQLite 3 (`quiz.db`) | Relational storage for questions, registered candidates, and quiz attempts |
| **API Format**| REST / JSON | Parameterized SQL queries, status code standards, payload validation |

---

## 📂 Project Folder Structure

```text
online quiz applicaton/
├── index.html              # Frontend user interface (Single Page Application)
├── style.css               # Styling, modern card layout, animations, responsive design
├── script.js               # Client logic, timer, state management, REST API integration
├── app.py                  # Flask backend server, routes, and REST API controller
├── database.py             # SQLite initialization, schema definition, and query helpers
├── requirements.txt        # Python package dependencies (Flask)
├── quiz.db                 # SQLite database file (created automatically on startup)
├── README.md               # User guide and project overview
├── PRD.md                  # Product Requirements Document
├── ARCHITECTURE.md         # System Architecture & Component Design
├── TECH_STACK.md           # Technology Stack Analysis & Rationale
├── BUILD_PLAN.md           # Step-by-Step Engineering Build Plan
├── DATABASE_SCHEMA.md      # SQLite Database Schema & Entity-Relationship Design
├── API_SPECIFICATION.md    # REST API Endpoints Specification
├── AI_PROMPTS.md           # Engineering & Pair Programming Prompts
├── TEST_PLAN.md            # Comprehensive Test Plan & Verification Logs
├── DEPLOYMENT.md           # Deployment & Execution Guide
└── PROJECT_REPORT.md       # Srusti Academy Academic Project Report (8 Chapters)
```

---

## 🚀 Quick Start Guide (How to Run)

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system. To verify, open your terminal / command prompt and type:
```bash
python --version
```

### 2. Install Dependencies
Open a terminal in the project folder (`online quiz applicaton`) and install the required Python packages:
```bash
pip install -r requirements.txt
```

### 3. Launch the Application
Run the Flask server:
```bash
python app.py
```
You will see output similar to:
```text
==================================================
  Starting Online Quiz Application (Flask Backend)
  Local URL: http://127.0.0.1:5000
==================================================
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 4. Access the Application in Your Browser
Open your favorite web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari) and visit:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the main Single Page Application interface |
| `GET` | `/api/health` | Health-check endpoint verifying backend status |
| `GET` | `/api/questions` | Retrieves all questions (correct answers omitted for anti-cheat) |
| `GET` | `/api/questions/<id>` | Retrieves single question details without correct answer |
| `POST` | `/api/submit-quiz` | Validates answers on backend, calculates score, saves to SQLite |
| `GET` | `/api/results` | Retrieves previous quiz attempts from SQLite (most recent first) |

---

## 🧪 Testing

To execute automated backend verification testing:
```bash
python -c "import database, app; database.init_db(); print('Database and app initialized successfully!')"
```
Or execute the automated test suite in `scratch/test_backend.py`.

---

## 📜 License & Academic Attribution
Developed for academic submission and educational use at **Srusti Academy of Management**. All rights reserved.
