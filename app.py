from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import json
import secrets

# Load environment variables
load_dotenv()

app = Flask(__name__)

# JOBS LIST
with open('jobs.json') as f:
    jobs = json.load(f)

@app.route('/')
def home():
    return render_template('index.html', jobs=jobs)

# CONTACT FORM
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

# Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')

mail = Mail(app)

# Rate limiter
limiter = Limiter(get_remote_address)
limiter.init_app(app)

@app.route('/contact', methods=['POST'])
@limiter.limit("3 per hour")
def contact():
    name = request.form['name']
    email = request.form['email']
    message = request.form['message']

    msg = Message(
        subject=f"Website contact form submission from {name}",
        sender=app.config['MAIL_USERNAME'],
        recipients=[app.config['MAIL_USERNAME']],  # Send to yourself
        reply_to=email,
        body=f"From: {name} <{email}>\n\n{message}"
    )
    try:
        mail.send(msg)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)