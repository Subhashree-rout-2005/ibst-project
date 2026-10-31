"""
=============================================================================
Online Quiz Application - Database Module (SQLite)
Handles database creation, table schema setup, seed questions insertion,
and data access operations using parameterized queries.
=============================================================================
"""

import sqlite3
import os

DB_FILENAME = "quiz.db"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, DB_FILENAME)


def get_db_connection():
    """
    Establishes and returns an SQLite database connection.
    Enables Row factory for dictionary-like column access and foreign keys.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """
    Initializes the database schema and seeds initial sample questions
    if the questions table is empty.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Questions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            category TEXT NOT NULL,
            explanation TEXT
        );
    """)

    # 2. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 3. Quiz Results Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            wrong_answers INTEGER NOT NULL,
            percentage REAL NOT NULL,
            score INTEGER NOT NULL,
            quiz_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        );
    """)

    conn.commit()

    # Seed sample questions if table is empty
    cursor.execute("SELECT COUNT(*) AS count FROM questions;")
    row = cursor.fetchone()
    if row and row["count"] == 0:
        seed_questions(conn)

    conn.close()


def seed_questions(conn):
    """
    Seeds initial 10 curated multiple-choice questions across HTML, CSS,
    JavaScript, Computer Basics, and General Knowledge.
    """
    sample_questions = [
        (
            "What does HTML stand for in web development?",
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language",
            0,
            "HTML",
            "HTML stands for Hyper Text Markup Language. It provides the core structural skeleton for web pages."
        ),
        (
            "Which HTML tag is used to create a clickable hyperlink?",
            "<link>",
            "<a>",
            "<href>",
            "<hyperlink>",
            1,
            "HTML",
            "The <a> (anchor) tag along with the 'href' attribute is used in HTML to link to another page or resource."
        ),
        (
            "Which CSS property is used to change the text color of an element?",
            "text-color",
            "font-color",
            "color",
            "style-color",
            2,
            "CSS",
            "In CSS, the 'color' property defines the foreground text color of an element."
        ),
        (
            "What does the abbreviation CSS stand for?",
            "Computer Style System",
            "Creative Styling Sheet",
            "Colorful Style Sheets",
            "Cascading Style Sheets",
            3,
            "CSS",
            "CSS stands for Cascading Style Sheets. It controls the visual presentation, styling, and layout of HTML elements."
        ),
        (
            "Which keyword is used to declare a variable whose reference cannot be reassigned in modern JavaScript?",
            "const",
            "let",
            "var",
            "static",
            0,
            "JavaScript",
            "The 'const' keyword creates a block-scoped identifier whose value cannot be reassigned after initialization."
        ),
        (
            "Which built-in JavaScript method is used to print output to the browser's developer console?",
            "print.log()",
            "console.log()",
            "browser.write()",
            "system.out.print()",
            1,
            "JavaScript",
            "'console.log()' is the standard debugging method to print text, variables, and objects to the browser console."
        ),
        (
            "Which component is widely known as the 'Brain' of a computer system?",
            "Random Access Memory (RAM)",
            "Hard Disk Drive (HDD)",
            "Central Processing Unit (CPU)",
            "Graphics Processing Unit (GPU)",
            2,
            "Computer Basics",
            "The Central Processing Unit (CPU) carries out instructions and handles primary computational tasks, acting as the brain."
        ),
        (
            "Which of the following computer memory types is volatile (loses its contents when power is turned off)?",
            "Hard Disk",
            "Solid State Drive (SSD)",
            "ROM (Read-Only Memory)",
            "RAM (Random Access Memory)",
            3,
            "Computer Basics",
            "RAM is volatile memory used for active processing; when the computer shuts down, all data in RAM is cleared."
        ),
        (
            "Who is recognized as the inventor of the World Wide Web (WWW) in 1989?",
            "Tim Berners-Lee",
            "Bill Gates",
            "Steve Jobs",
            "Mark Zuckerberg",
            0,
            "General Knowledge",
            "Sir Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN to facilitate information sharing."
        ),
        (
            "What does the web abbreviation 'URL' stand for?",
            "Universal Resource List",
            "Uniform Resource Locator",
            "Unified Routing Link",
            "User Request Locator",
            1,
            "General Knowledge",
            "'Uniform Resource Locator' (URL) is the unique address used to locate and identify resources on the internet."
        )
    ]

    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO questions (
            question_text, option_a, option_b, option_c, option_d,
            correct_answer, category, explanation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, sample_questions)
    conn.commit()


def get_all_questions(include_answers=False):
    """
    Retrieves all questions.
    If include_answers is False (client-safe mode), omits correct_answer and explanation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    if include_answers:
        cursor.execute("""
            SELECT id, question_text, option_a, option_b, option_c, option_d,
                   correct_answer, category, explanation
            FROM questions ORDER BY id ASC;
        """)
    else:
        cursor.execute("""
            SELECT id, question_text, option_a, option_b, option_c, option_d, category
            FROM questions ORDER BY id ASC;
        """)

    rows = cursor.fetchall()
    conn.close()

    questions = []
    for row in rows:
        q = {
            "id": row["id"],
            "question": row["question_text"],
            "category": row["category"],
            "options": [
                row["option_a"],
                row["option_b"],
                row["option_c"],
                row["option_d"]
            ]
        }
        if include_answers:
            q["correct_answer"] = row["correct_answer"]
            q["explanation"] = row["explanation"]
        questions.append(q)

    return questions


def get_question_by_id(question_id, include_answers=False):
    """
    Retrieves a single question by its ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    if include_answers:
        cursor.execute("""
            SELECT id, question_text, option_a, option_b, option_c, option_d,
                   correct_answer, category, explanation
            FROM questions WHERE id = ?;
        """, (question_id,))
    else:
        cursor.execute("""
            SELECT id, question_text, option_a, option_b, option_c, option_d, category
            FROM questions WHERE id = ?;
        """, (question_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    q = {
        "id": row["id"],
        "question": row["question_text"],
        "category": row["category"],
        "options": [
            row["option_a"],
            row["option_b"],
            row["option_c"],
            row["option_d"]
        ]
    }
    if include_answers:
        q["correct_answer"] = row["correct_answer"]
        q["explanation"] = row["explanation"]
    return q


def process_quiz_submission(username, answers_map):
    """
    Validates answers on backend against database records, calculates score,
    registers or finds user in users table, records the attempt in quiz_results,
    and returns a comprehensive evaluation with question review.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch all questions with answers from database
    cursor.execute("""
        SELECT id, question_text, option_a, option_b, option_c, option_d,
               correct_answer, category, explanation
        FROM questions ORDER BY id ASC;
    """)
    all_q_rows = cursor.fetchall()

    if not all_q_rows:
        conn.close()
        raise ValueError("No questions found in database.")

    total_questions = len(all_q_rows)
    correct_count = 0
    review_list = []

    for row in all_q_rows:
        qid = row["id"]
        correct_opt = row["correct_answer"]
        user_opt = answers_map.get(str(qid))
        if user_opt is None:
            user_opt = answers_map.get(qid)

        is_correct = False
        if user_opt is not None and int(user_opt) == correct_opt:
            is_correct = True
            correct_count += 1

        review_list.append({
            "question_id": qid,
            "category": row["category"],
            "question": row["question_text"],
            "options": [
                row["option_a"],
                row["option_b"],
                row["option_c"],
                row["option_d"]
            ],
            "user_answer": int(user_opt) if user_opt is not None else None,
            "correct_answer": correct_opt,
            "is_correct": is_correct,
            "explanation": row["explanation"]
        })

    wrong_count = total_questions - correct_count
    percentage = round((correct_count / total_questions) * 100, 2)
    score = correct_count

    # Register or find user in users table
    clean_username = username.strip()
    cursor.execute("INSERT OR IGNORE INTO users (username) VALUES (?);", (clean_username,))
    cursor.execute("SELECT id FROM users WHERE username = ?;", (clean_username,))
    user_row = cursor.fetchone()
    user_id = user_row["id"] if user_row else None

    # Save to quiz_results
    cursor.execute("""
        INSERT INTO quiz_results (
            user_id, username, total_questions, correct_answers,
            wrong_answers, percentage, score
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    """, (user_id, clean_username, total_questions, correct_count, wrong_count, percentage, score))

    result_id = cursor.lastrowid
    conn.commit()

    # Get formatted timestamp
    cursor.execute("SELECT quiz_date FROM quiz_results WHERE id = ?;", (result_id,))
    date_row = cursor.fetchone()
    quiz_date = date_row["quiz_date"] if date_row else ""

    conn.close()

    return {
        "result_id": result_id,
        "username": clean_username,
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "wrong_answers": wrong_count,
        "score": score,
        "percentage": percentage,
        "quiz_date": quiz_date,
        "review": review_list
    }


def get_all_results(limit=50):
    """
    Retrieves previous quiz results ordered by most recent first.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, total_questions, correct_answers,
               wrong_answers, percentage, score, quiz_date
        FROM quiz_results
        ORDER BY quiz_date DESC, id DESC
        LIMIT ?;
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "username": row["username"],
            "total_questions": row["total_questions"],
            "correct_answers": row["correct_answers"],
            "wrong_answers": row["wrong_answers"],
            "percentage": row["percentage"],
            "score": row["score"],
            "quiz_date": row["quiz_date"]
        })
    return results
