# Deployment & Execution Guide (DEPLOYMENT.md)

## Project: Online Quiz Application
* **Deployment Models:** Local Workstation, Production WSGI (Waitress/Gunicorn), Containerized (Docker)
* **Application Server:** Python Flask
* **Persistent Storage:** Local SQLite (`quiz.db`)

---

## 1. Local Workstation Deployment (Development Mode)

### Step 1: Environment Preparation
Ensure that Python 3.8 or higher is installed:
```bash
python --version
```

### Step 2: Navigate to Project Directory
```bash
cd "c:\Users\srout\OneDrive\Desktop\online quiz applicaton"
```

### Step 3: Install Required Dependencies
Install the required packages using `pip`:
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
Execute the main application script:
```bash
python app.py
```

### Step 5: Access the Web Application
Open your web browser and navigate to:
👉 **`http://127.0.0.1:5000`**

---

## 2. Production WSGI Deployment on Windows (Using Waitress)

For production scenarios on Windows, use a multi-threaded production WSGI server such as **Waitress**:

### Step 1: Install Waitress
```bash
pip install waitress
```

### Step 2: Launch via Waitress
```bash
waitress-serve --listen=0.0.0.0:5000 app:app
```
This serves the application across all network interfaces with multi-threaded request processing.

---

## 3. Production Deployment on Linux (Gunicorn + Nginx + Systemd)

### Step 1: Install Production Server
```bash
pip install gunicorn
```

### Step 2: Systemd Service Unit (`/etc/systemd/system/quiz.service`)
```ini
[Unit]
Description=Online Quiz Application Flask WSGI Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/online_quiz_application
Environment="PATH=/var/www/online_quiz_application/venv/bin"
ExecStart=/var/www/online_quiz_application/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### Step 3: Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/quiz`)
```nginx
server {
    listen 80;
    server_name quiz.example.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Containerized Deployment (Docker)

### Dockerfile
```dockerfile
# Base Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy dependency manifest
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose HTTP port
EXPOSE 5000

# Run with Flask
CMD ["python", "app.py"]
```

### Docker Commands
```bash
# Build Docker image
docker build -t online-quiz-app .

# Run Docker container with volume for SQLite persistence
docker run -d -p 5000:5000 -v $(pwd)/quiz.db:/app/quiz.db --name quiz-server online-quiz-app
```

---

## 5. Troubleshooting & Operational FAQs

### Issue: Port 5000 is already in use
* **Solution**: You can specify an alternative port in `app.py` (e.g., `port=5050`) or run via Python with a flag:
  ```bash
  python -c "import app; app.app.run(port=5050)"
  ```
  Then access at `http://127.0.0.1:5050`.

### Issue: SQLite database locked error
* **Solution**: SQLite handles multiple readers cleanly. If writing high concurrency, ensure transaction blocks in `database.py` remain brief and close connections promptly.

### Issue: Browser shows outdated cached styles or scripts
* **Solution**: Perform a hard refresh using `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (Mac).
