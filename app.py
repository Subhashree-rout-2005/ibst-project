"""
=============================================================================
Online Quiz Application - Flask Backend Server & REST API
Provides RESTful endpoints for questions, quiz submission, and result history.
Serves static frontend assets (HTML, CSS, JS) from the current folder.
=============================================================================
"""

import os
import sys
from flask import Flask, request, jsonify, send_from_directory
import database

# Initialize Flask application
app = Flask(__name__, static_folder=".", static_url_path="")

# Ensure database and tables are created upon initialization
with app.app_context():
    database.init_db()


# -----------------------------------------------------------------------------
# Frontend Static Asset Routes
# -----------------------------------------------------------------------------

@app.route("/")
def serve_index():
    """Serves the primary Single Page Application interface."""
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    """Serves CSS, JavaScript, and other static files from the project directory."""
    return send_from_directory(".", filename)


# -----------------------------------------------------------------------------
# REST API Endpoints
# -----------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """System health-check endpoint."""
    return jsonify({
        "status": "healthy",
        "app": "Online Quiz Application",
        "version": "1.0.0"
    }), 200


@app.route("/api/questions", methods=["GET"])
def get_questions():
    """
    GET /api/questions
    Fetches all quiz questions without revealing correct answers or explanations.
    """
    try:
        questions = database.get_all_questions(include_answers=False)
        return jsonify({
            "success": True,
            "total": len(questions),
            "questions": questions
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch questions: " + str(e)
        }), 500


@app.route("/api/questions/<int:question_id>", methods=["GET"])
def get_single_question(question_id):
    """
    GET /api/questions/<id>
    Fetches one question by ID without revealing its correct answer.
    """
    try:
        question = database.get_question_by_id(question_id, include_answers=False)
        if not question:
            return jsonify({
                "success": False,
                "error": f"Question with ID {question_id} not found."
            }), 404

        return jsonify({
            "success": True,
            "question": question
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch question: " + str(e)
        }), 500


@app.route("/api/submit-quiz", methods=["POST"])
def submit_quiz():
    """
    POST /api/submit-quiz
    Validates user answers on the backend, calculates final score and percentage,
    records the attempt in SQLite database, and returns the score with full review.
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Request body must be valid JSON."
        }), 400

    payload = request.get_json() or {}

    # 1. Validate username
    username = payload.get("username", "")
    if not isinstance(username, str) or not username.strip():
        return jsonify({
            "success": False,
            "error": "Candidate username is required and cannot be empty."
        }), 400

    clean_username = username.strip()
    if len(clean_username) > 60:
        return jsonify({
            "success": False,
            "error": "Username must not exceed 60 characters."
        }), 400

    # 2. Validate answers
    raw_answers = payload.get("answers")
    if raw_answers is None:
        return jsonify({
            "success": False,
            "error": "Answers dictionary or array is required."
        }), 400

    # Normalize answers into a dict {question_id: selected_option_index}
    answers_map = {}
    if isinstance(raw_answers, dict):
        for qid_str, selected_val in raw_answers.items():
            try:
                qid = int(qid_str)
                opt = int(selected_val) if selected_val is not None else None
                answers_map[qid] = opt
            except (ValueError, TypeError):
                continue
    elif isinstance(raw_answers, list):
        for item in raw_answers:
            if isinstance(item, dict) and "question_id" in item:
                try:
                    qid = int(item["question_id"])
                    opt = int(item.get("selected_option")) if item.get("selected_option") is not None else None
                    answers_map[qid] = opt
                except (ValueError, TypeError):
                    continue

    try:
        # Process and persist submission via database module
        submission_result = database.process_quiz_submission(clean_username, answers_map)
        return jsonify({
            "success": True,
            "message": "Quiz submitted and evaluated successfully.",
            "data": submission_result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Submission processing failed: " + str(e)
        }), 500


@app.route("/api/results", methods=["GET"])
def get_results():
    """
    GET /api/results
    Retrieves previous quiz results ordered by newest first.
    Supports optional query parameter 'limit' (default 50).
    """
    try:
        limit = request.args.get("limit", default=50, type=int)
        if limit <= 0 or limit > 100:
            limit = 50

        results = database.get_all_results(limit=limit)
        return jsonify({
            "success": True,
            "total": len(results),
            "results": results
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to retrieve results: " + str(e)
        }), 500


# -----------------------------------------------------------------------------
# Application Runner
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    print("==================================================")
    print("  Starting Online Quiz Application (Flask Backend)")
    print("  Local URL: http://127.0.0.1:5000")
    print("==================================================")
    app.run(host="127.0.0.1", port=5000, debug=True)
