# REST API Specification (API_SPECIFICATION.md)

## Project: Online Quiz Application
* **Base URL:** `http://127.0.0.1:5000/api`
* **Protocol:** HTTP / 1.1
* **Data Format:** JSON (`application/json; charset=utf-8`)
* **Authentication:** Public Session (Candidate Name Identification)

---

## 1. Status Code Conventions

| HTTP Status | Meaning | Usage Scenario |
| :--- | :--- | :--- |
| `200 OK` | Success | Successful resource retrieval or evaluation processing. |
| `400 Bad Request` | Client Error | Missing or malformed JSON payload, empty candidate username. |
| `404 Not Found` | Resource Missing | Requested question ID does not exist in SQLite database. |
| `500 Server Error` | Internal Failure | Unhandled database or system exception. |

---

## 2. API Endpoints

### 2.1 Health Check
* **Route:** `GET /api/health`
* **Description:** Verifies that the Flask backend and runtime are operational.
* **Response (200 OK):**
```json
{
  "app": "Online Quiz Application",
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### 2.2 Retrieve All Questions (Anti-Cheat)
* **Route:** `GET /api/questions`
* **Description:** Retrieves all available questions for testing. For security, `correct_answer` and `explanation` are deliberately omitted.
* **Response (200 OK):**
```json
{
  "success": true,
  "total": 10,
  "questions": [
    {
      "id": 1,
      "category": "HTML",
      "question": "What does HTML stand for in web development?",
      "options": [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language"
      ]
    },
    {
      "id": 2,
      "category": "HTML",
      "question": "Which HTML tag is used to create a clickable hyperlink?",
      "options": [
        "<link>",
        "<a>",
        "<href>",
        "<hyperlink>"
      ]
    }
  ]
}
```

---

### 2.3 Retrieve Single Question
* **Route:** `GET /api/questions/<int:question_id>`
* **Description:** Fetches details for a specific question ID without revealing its answer.
* **Parameters:** `question_id` (Path integer).
* **Response (200 OK):**
```json
{
  "success": true,
  "question": {
    "id": 1,
    "category": "HTML",
    "question": "What does HTML stand for in web development?",
    "options": [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ]
  }
}
```
* **Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Question with ID 999 not found."
}
```

---

### 2.4 Submit Quiz & Evaluate
* **Route:** `POST /api/submit-quiz`
* **Description:** Submits completed answers, computes the score against the database, records the attempt in `quiz_results`, and returns the evaluation with full question reviews.
* **Request Headers:** `Content-Type: application/json`
* **Request Body Example:**
```json
{
  "username": "Rahul Sharma",
  "answers": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 0,
    "6": 1,
    "7": 2,
    "8": 3,
    "9": 0,
    "10": 1
  }
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Quiz submitted and evaluated successfully.",
  "data": {
    "result_id": 1,
    "username": "Rahul Sharma",
    "total_questions": 10,
    "correct_answers": 10,
    "wrong_answers": 0,
    "score": 10,
    "percentage": 100.0,
    "quiz_date": "2026-10-13 19:15:30",
    "review": [
      {
        "question_id": 1,
        "category": "HTML",
        "question": "What does HTML stand for in web development?",
        "options": [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language"
        ],
        "user_answer": 0,
        "correct_answer": 0,
        "is_correct": true,
        "explanation": "HTML stands for Hyper Text Markup Language. It provides the core structural skeleton for web pages."
      }
    ]
  }
}
```
* **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Candidate username is required and cannot be empty."
}
```

---

### 2.5 Retrieve Quiz Results History
* **Route:** `GET /api/results`
* **Description:** Retrieves previous quiz attempts from SQLite ordered by timestamp (newest first).
* **Query Parameters:** `limit` (Optional integer, default: 50).
* **Response (200 OK):**
```json
{
  "success": true,
  "total": 2,
  "results": [
    {
      "id": 2,
      "username": "Ananya Sen",
      "total_questions": 10,
      "correct_answers": 7,
      "wrong_answers": 3,
      "score": 7,
      "percentage": 70.0,
      "quiz_date": "2026-10-13 19:18:22"
    },
    {
      "id": 1,
      "username": "Priyanka Mishra",
      "total_questions": 10,
      "correct_answers": 10,
      "wrong_answers": 0,
      "score": 10,
      "percentage": 100.0,
      "quiz_date": "2026-10-13 19:17:55"
    }
  ]
}
```

---

## 3. Sample cURL Test Commands

```bash
# 1. Health check
curl -X GET http://127.0.0.1:5000/api/health

# 2. Get questions (anti-cheat verification)
curl -X GET http://127.0.0.1:5000/api/questions

# 3. Submit quiz
curl -X POST http://127.0.0.1:5000/api/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{"username": "Rahul", "answers": {"1": 0, "2": 1, "3": 2}}'

# 4. View history
curl -X GET http://127.0.0.1:5000/api/results
```
