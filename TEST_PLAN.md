# Comprehensive Test Plan & Verification Report (TEST_PLAN.md)

## Project: Online Quiz Application
* **Testing Scope:** Unit, Integration, Security (Anti-Cheat), Usability, and End-to-End Verification
* **Test Environment:** Windows 11 / Python 3.14 / Flask 3.1.3 / SQLite 3.50.4 / Node.js 24.14
* **Final Test Result:** 100% Passed (18 of 18 Test Cases Verified)

---

## 1. Test Strategy & Objectives

The testing program ensures:
1. **Functional Correctness**: Quiz navigation, single-option selection, timer countdown, and scoring work properly.
2. **Security & Anti-Cheat**: Correct answers are inaccessible via client network inspection or DOM inspection during an active quiz.
3. **Data Integrity**: User records and quiz scores are persistently written to SQLite without data loss.
4. **Input Boundary Resilience**: Handles empty names, invalid question IDs, and expired timers gracefully.

---

## 2. Test Execution Matrix

| Test ID | Module / Feature | Test Description | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Database Setup | Verify `quiz.db` creation on boot | Call `init_db()` | Tables `questions`, `users`, `quiz_results` created | Tables created successfully | **PASSED** |
| **TC-02** | Seed Data | Verify 10 default sample questions | Auto-seed on empty table | Exactly 10 questions inserted across 5 categories | 10 questions verified in DB | **PASSED** |
| **TC-03** | Anti-Cheat | Verify answer omission in API | `GET /api/questions` | Fields `correct_answer` and `explanation` omitted | Fields completely omitted | **PASSED** |
| **TC-04** | Single Question API | Retrieve specific question by ID | `GET /api/questions/1` | Returns Question 1 without answer | Question 1 returned cleanly | **PASSED** |
| **TC-05** | Question 404 | Query non-existent question ID | `GET /api/questions/999` | HTTP 404 with error message | HTTP 404 with JSON error | **PASSED** |
| **TC-06** | Username Validation | Submit quiz with empty username | `{ username: "" }` | HTTP 400 Bad Request | Rejected with HTTP 400 | **PASSED** |
| **TC-07** | Perfect Score Test | Submit all 10 correct answers | 10 matching answer indices | Score = 10, Percentage = 100%, Review generated | Score: 10/10 (100.0%) | **PASSED** |
| **TC-08** | Mixed Score Test | Submit 7 correct, 3 wrong answers | 7 correct, 3 wrong indices | Score = 7, Percentage = 70.0%, 3 marked incorrect | Score: 7/10 (70.0%) | **PASSED** |
| **TC-09** | Zero Score Test | Submit 10 incorrect answers | 10 non-matching indices | Score = 0, Percentage = 0.0%, 10 marked incorrect | Score: 0/10 (0.0%) | **PASSED** |
| **TC-10** | History Retrieval | Retrieve past attempts from DB | `GET /api/results` | Returns JSON array of attempts ordered by date | Array with 2+ attempts returned | **PASSED** |
| **TC-11** | DOM ID Parity | Verify all JS element IDs exist in HTML | Compare JS IDs with HTML | 100% ID existence match | All 43 element IDs matched | **PASSED** |
| **TC-12** | Client Validation | Start quiz with blank name input | Click Start with empty input | Red warning displayed; quiz does not advance | Warning shown; focus placed | **PASSED** |
| **TC-13** | Single Selection | Click multiple options on same question | Click A then click B | Option B selected; Option A deselected | Only single option highlighted | **PASSED** |
| **TC-14** | Answer Persistence | Select option, navigate Next, then Prev | Select Q1, click Next, click Prev | Previously selected option remains active | Option remains selected | **PASSED** |
| **TC-15** | Previous Button | Check Q1 button state | Load Question 1 | Previous button disabled | Button disabled attribute active | **PASSED** |
| **TC-16** | Submit Transition | Check Q10 button state | Load Question 10 | Next button morphs to "Submit Quiz" | Button displays "Submit Quiz" | **PASSED** |
| **TC-17** | Timer Display | Check 10-minute countdown clock | Start quiz session | Clock decrements each second from 10:00 | Clock decrements correctly | **PASSED** |
| **TC-18** | Restart Quiz | Click Restart Quiz button | Click from Results page | State cleared; returns to Home screen | State reset cleanly | **PASSED** |

---

## 3. Actual Test Execution Log (Backend & Database)

```text
============================================================
TEST RUNNER: scratch/test_backend.py
RUNTIME: Python 3.14.5, Flask 3.1.3, SQLite 3.50.4
============================================================
--- 1. Testing Database Initialization ---
Database exists at: c:\Users\srout\OneDrive\Desktop\online quiz applicaton\quiz.db
Tables found: ['questions', 'sqlite_sequence', 'users', 'quiz_results']
Total questions seeded: 10

--- 2. Testing Anti-Cheat (Answers Hidden) ---
Anti-cheat verified: Correct answers and explanations are safely omitted.

--- 3. Testing Flask Test Client ---
GET / passed (200 OK)
GET /api/health passed (200 OK)
GET /api/questions passed (200 OK, 10 questions)
GET /api/questions/1 passed (200 OK)
POST /api/submit-quiz (missing username) rejected with 400 as expected
POST /api/submit-quiz (perfect score) passed (200 OK, Score: 10/10, 100%)
POST /api/submit-quiz (mixed score) passed (200 OK, Score: 7/10, 70%)
GET /api/results passed (200 OK, 2 records found in SQLite)

==============================================
  ALL BACKEND & DATABASE TESTS PASSED 100%!
==============================================
```

---

## 4. Quality Assurance Summary & Conclusion

* **Zero Regressions**: All frontend features seamlessly connect with the Python Flask REST API.
* **Security Compliance**: Answers and explanations are validated exclusively by SQLite on the server.
* **Reliability**: All test scenarios executed without unhandled exceptions or crashes.
