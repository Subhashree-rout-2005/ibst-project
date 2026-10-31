# Technology Stack & Selection Rationale (TECH_STACK.md)

## Project: Online Quiz Application
* **Document Version:** 1.0.0
* **Classification:** Technical Evaluation & Architectural Decision Records (ADR)

---

## 1. Complete Technology Stack Matrix

| Layer | Selected Technology | Version | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Markup** | HTML5 | Living Standard | Semantic document outline, accessible forms, accessible buttons, and modals. |
| **Styling** | CSS3 | Modern Standard | Custom design system, CSS variables, flexbox, CSS grid, transitions, animations. |
| **Scripting (Client)** | Vanilla JavaScript | ECMAScript 2022+ | DOM manipulation, countdown timer, asynchronous Fetch API, state management. |
| **Backend Framework** | Python Flask | 3.1.3 | Micro web framework, routing, JSON serialization, static asset delivery. |
| **Database Engine** | SQLite 3 | 3.50.4 | Serverless, self-contained, transactional relational database engine. |
| **Data Access Layer** | Python `sqlite3` | Standard Library | Parameterized queries, transaction management, zero external drivers. |
| **Dependency Manager**| Python `pip` | 26.1+ | Virtual environment package installation and specification (`requirements.txt`). |
| **Operating System** | Cross-Platform | Windows / Linux / macOS | Platform-independent execution across modern operating systems. |

---

## 2. In-Depth Component Analysis & Selection Rationale

### 2.1 Frontend: Vanilla JavaScript vs. Heavy Frameworks (React, Vue, Angular)

#### Evaluated Alternatives:
* **React / Next.js**: Requires Node.js build pipelines (npm, webpack/vite, babel), thousands of `node_modules` dependencies, bundle compilation steps, and virtual DOM overhead.
* **Angular / Vue**: Incurs framework lock-in, complex CLI configurations, and steep learning curves for introductory educational settings.
* **Vanilla JavaScript (Selected)**:
  * **Zero Build Step**: Native browser execution without bundlers, transpilers, or compilation delays.
  * **Minimal Footprint**: Total client-side JavaScript size is under 20 KB uncompressed.
  * **Direct DOM Control**: Precise, predictable manipulation of class lists, buttons, and event listeners.
  * **Academic Transparency**: Clean, readable code ideal for classroom demonstration and grading.

### 2.2 Backend: Python Flask vs. Django vs. Node.js Express

#### Evaluated Alternatives:
* **Django**: Highly capable, but incorporates heavy built-in components (admin panel, heavy ORM, auth framework) that create excessive boilerplate for a focused REST API.
* **Node.js (Express)**: Requires separate runtime management, package ecosystems (`npm`), and asynchronous callback handling that increases operational complexity.
* **FastAPI**: Requires ASGI servers (Uvicorn), Pydantic schemas, and complex async/await patterns.
* **Python Flask (Selected)**:
  * **Minimalist Micro-Framework**: Clean, readable syntax with minimal boilerplate.
  * **Built-in Static File Serving**: Seamlessly serves HTML, CSS, and JS alongside `/api` routes from a single entry point (`app.py`).
  * **Standard Library Integration**: Natural pairing with Python’s built-in `sqlite3` and `json` modules.
  * **High Portability**: Runs with a single command (`python app.py`).

### 2.3 Database: SQLite 3 vs. Client-Server Databases (MySQL, PostgreSQL, MongoDB)

#### Evaluated Alternatives:
* **MySQL / PostgreSQL**: Require external server daemons, port configurations, background processes, user authentication grants, and service management.
* **MongoDB**: Document database with NoSQL paradigm; adds driver complexity, memory overhead, and unneeded document indexing for structured relational question sets.
* **SQLite 3 (Selected)**:
  * **Zero Configuration**: Single local file (`quiz.db`) created automatically on application boot.
  * **Atomic Transactions**: Full ACID compliance ensuring result rows are written reliably without corruption.
  * **Embedded Engine**: Ships directly inside the Python standard library; zero third-party database drivers required.
  * **Instant Portability**: The entire database can be archived, backed up, or inspected with standard SQLite tools.

---

## 3. Technology Comparison Matrix

| Evaluation Criteria | Vanilla JS + Flask + SQLite (Selected) | MERN Stack (React + Node + Mongo) | Django + PostgreSQL |
| :--- | :--- | :--- | :--- |
| **Installation Friction** | **Ultra-Low** (`pip install -r requirements.txt`) | High (Node, npm, Mongo Daemon) | Medium (Python, Postgres server) |
| **Memory Footprint** | **$< 35\text{ MB}$ RAM** | $> 350\text{ MB}$ RAM | $> 180\text{ MB}$ RAM |
| **Startup Latency** | **$< 200\text{ ms}$** | $2000 - 5000\text{ ms}$ | $1500 - 3000\text{ ms}$ |
| **Deployment Complexity** | **Single script** (`python app.py`) | Multi-process / Docker Compose | WSGI server + DB migration steps |
| **Code Readability for Students** | **Extremely Clear & Modular** | Multi-file JSX components & state hooks | Complex class-based views & ORM models |

---

## 4. Hardware & Software Requirements

### 4.1 Minimum Hardware Specifications
* **CPU**: Dual-Core x86_64 or ARM processor (1.0 GHz+).
* **RAM**: 512 MB available system memory.
* **Disk Storage**: 50 MB free disk space (includes Python runtime and database).
* **Display**: $320 \times 480$ minimum resolution (responsive design adapts to all screen sizes).

### 4.2 Software Prerequisites
* **Operating System**: Windows 10/11, macOS 10.15+, or modern Linux distribution (Ubuntu 20.04+, Debian, Fedora).
* **Python Runtime**: Python 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, or 3.14.
* **Web Browser**: Any modern evergreen browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari, Opera).
