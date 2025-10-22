from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for
from flask_mail import Mail, Message
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import json
import re
import bleach
from datetime import datetime
import requests
import threading

load_dotenv()

app = Flask(__name__)

# Load job data
with open('jobs.json', 'r', encoding='utf-8') as f:
    jobs = json.load(f)

# Load blog data
with open('blogs.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

def ping_site(url):
    try:
        requests.get(url)  # short timeout, in case site is slow
        print(f"Pinged {url}")
    except Exception as e:
        print(f"Ping failed: {e}")

@app.route('/')
def home():
    url = "https://train-with-reece.onrender.com/"
    
    threading.Thread(target=ping_site, args=(url,), daemon=True).start()
    
    return render_template('index.html', jobs=jobs)

@app.route('/<job_id>')
def job(job_id):
    # Find the job with matching id
    job = next((j for j in jobs if j['id'] == job_id), None)
    if job is None:
        return redirect(url_for('home'))
    
    # Set page metadata
    page_title = f"Page 1 Studios | {job['title']}"
    page_description = job['description']
    page_url = url_for('job', job_id=job_id, _external=True)
    
    # Add structured data for the job
    structured_data = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{page_url}#webpage",
        "url": page_url,
        "name": page_title,
        "description": page_description,
        "publisher": {
            "@type": "Organization",
            "name": "Page 1 Studios",
            "url": "https://www.page1studios.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.page1studios.com/static/images/logo.svg"
            }
        }
    }
    
    return render_template('job.html', 
                         job=job,
                         page_title=page_title,
                         page_description=page_description,
                         page_url=page_url,
                         structured_data=structured_data)

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy-policy.html')

@app.route('/terms-of-service')
def terms_of_service():
    return render_template('terms-of-service.html')

@app.route('/blog')
def blog_list():
    # Set page metadata
    page_title = "Page 1 Studios | Blog - Web Projects, Coursework & Learning Insights"
    page_description = "Explore the Page 1 Studios blog featuring client website projects, coursework write-ups, and personal learning experiences in web development, cybersecurity, and design."
    page_url = url_for('blog_list', _external=True)
    
    # Add structured data for the blog list
    structured_data = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": f"{page_url}#blog",
        "url": page_url,
        "name": "Page 1 Studios Blog",
        "description": page_description,
        "publisher": {
            "@type": "Organization",
            "name": "Page 1 Studios",
            "url": "https://www.page1studios.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.page1studios.com/static/images/logo.svg"
            }
        },
        "blogPost": [
            {
                "@type": "BlogPosting",
                "headline": blog["title"],
                "url": url_for('blog_detail', blog_id=blog["id"], _external=True),
                "datePublished": blog["date_published"],
                "author": {
                    "@type": "Person",
                    "name": blog["author"]
                },
            } for blog in blogs
        ]
    }
    
    return render_template('blog-list.html', 
                         blogs=blogs,
                         page_title=page_title,
                         page_description=page_description,
                         page_url=page_url,
                         structured_data=structured_data)

@app.route('/blog/<blog_id>')
def blog_detail(blog_id):
    # Find the blog with matching id
    blog = next((b for b in blogs if b['id'] == blog_id), None)
    if blog is None:
        return redirect(url_for('blog_list'))
    
    # Set page metadata
    page_title = f"Page 1 Studios | {blog['seo_title']}"
    page_description = blog['seo_description']
    page_url = url_for('blog_detail', blog_id=blog_id, _external=True)
    
    # Add structured data for the blog post
    structured_data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": f"{page_url}#blogpost",
        "url": page_url,
        "headline": blog['title'],
        "description": blog['seo_description'],
        "datePublished": blog['date_published'],
        "author": {
            "@type": "Person",
            "name": blog['author']
        },
        "publisher": {
            "@type": "Organization",
            "name": "Page 1 Studios",
            "url": "https://www.page1studios.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.page1studios.com/static/images/logo.svg"
            }
        },
        "image": {
            "@type": "ImageObject",
            "url": f"https://www.page1studios.com{blog['featured_image']}"
        }
    }
    
    return render_template('blog-detail.html', 
                         blog=blog,
                         page_title=page_title,
                         page_description=page_description,
                         page_url=page_url,
                         structured_data=structured_data)

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt', mimetype='text/plain')

@app.before_request
def redirect_non_www():
    if request.host == "page1studios.com":
        return redirect(f"https://www.page1studios.com{request.path}", code=301)

# Mail Configuration
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
    MAIL_SENDER=os.environ.get('MAIL_SENDER'),
    MAIL_RECEIVER=os.environ.get('MAIL_RECEIVER'),
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
    referral_source = bleach.clean(request.form.get('referral_source', '').strip())
    message = bleach.clean(request.form.get('message', '').strip())

    # Basic input validation
    if not name or not re.match(r"^[a-zA-Z\s'-]+$", name):
        return jsonify({"success": False, "error": "Invalid name"}), 400

    if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"success": False, "error": "Invalid email"}), 400

    if not referral_source or referral_source not in ['search', 'social', 'word', 'referral', 'other']:
        return jsonify({"success": False, "error": "Invalid referral source"}), 400

    if '\n' in email or '\r' in email or '\n' in name or '\r' in name:
        return jsonify({"success": False, "error": "Header injection attempt"}), 400

    if not message or len(message) > 1000:
        return jsonify({"success": False, "error": "Invalid message"}), 400

    # Map referral source values to display text
    referral_source_map = {
        'search': 'Search engine',
        'social': 'Social media',
        'word': 'Word of mouth',
        'referral': 'Referral',
        'other': 'Other'
    }

    msg = Message(
        subject=f"📨 New Contact Form Submission: {name}",
        sender=("Page 1 Studios Notifications", app.config['MAIL_SENDER']),
        recipients=[app.config['MAIL_RECEIVER']],
        reply_to=email,
        body=(
            f"📥 You've received a new message from your website contact form:\n\n"
            f"🧑 Name: {name}\n"
            f"📧 Email: {email}\n"
            f"🔍 Referral Source: {referral_source_map.get(referral_source, 'Unknown')}\n"
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

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'])
    # app.run(debug=False)