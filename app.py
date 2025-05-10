from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_mail import Mail, Message
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import json
import re
import bleach
from datetime import datetime

load_dotenv()

app = Flask(__name__)

# Load job data
with open('jobs.json') as f:
    jobs = json.load(f)

@app.route('/')
def home():
    return render_template('index.html', jobs=jobs)

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy-policy.html')

@app.route('/terms-of-service')
def terms_of_service():
    return render_template('terms-of-service.html')

# Mail Configuration
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
    MAIL_SENDER=os.environ.get('MAIL_SENDER'),
    MAIL_RECEIVER=os.environ.get('MAIL_RECEIVER')
)

mail = Mail(app)

# Rate limiting
limiter = Limiter(get_remote_address, default_limits=["200 per day", "50 per hour"])
limiter.init_app(app)

# Limit request size to prevent DoS
@app.before_request
def limit_request_size():
    if request.content_length and request.content_length > 10_000:
        return jsonify({"success": False, "error": "Payload too large"}), 413

# Add security headers
@app.after_request
def apply_csp(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "style-src-elem 'self' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "object-src 'none'; "
        "base-uri 'self';"
    )
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    return response

@app.route('/contact', methods=['POST'])
@limiter.limit("3 per hour")
def contact():
    # Honeypot check
    if request.form.get('referral_code'):
        return jsonify({"success": False, "message": "Spam detected"}), 400


    name = bleach.clean(request.form.get('name', '').strip())
    email = bleach.clean(request.form.get('email', '').strip())
    message = bleach.clean(request.form.get('message', '').strip())

    # Basic input validation
    if not name or not re.match(r"^[a-zA-Z\s'-]+$", name):
        return jsonify({"success": False, "error": "Invalid name"}), 400

    if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"success": False, "error": "Invalid email"}), 400

    if '\n' in email or '\r' in email or '\n' in name or '\r' in name:
        return jsonify({"success": False, "error": "Header injection attempt"}), 400

    if not message or len(message) > 1000:
        return jsonify({"success": False, "error": "Invalid message"}), 400

    msg = Message(
        subject=f"📨 New Contact Form Submission: {name}",
        sender=("Page 1 Studios Notifications", app.config['MAIL_SENDER']),
        recipients=[app.config['MAIL_RECEIVER']],
        reply_to=email,
        body=(
            f"📥 You've received a new message from your website contact form:\n\n"
            f"🧑 Name: {name}\n"
            f"📧 Email: {email}\n"
            f"🕒 Received: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            f"💬 Message:\n"
            f"{'-' * 40}\n"
            f"{message}\n"
            f"{'-' * 40}\n"
        )
    )

    try:
        print("About to send mail to:", msg.recipients)
        mail.send(msg)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/robots.txt')
def robots():
    return send_from_directory(app.static_folder, 'robots.txt')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory(app.static_folder, 'sitemap.xml')

if __name__ == '__main__':
    # app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
    app.run(debug=True)
