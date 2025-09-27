/*----------------------------------------------
  HEADER APPEARS ON SCROLL
----------------------------------------------*/
document.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});





/*----------------------------------------------
  TYPEWRITER EFFECT ON INTRO
----------------------------------------------*/
const line1Text = "WEB-DEVELOPER";
const secondLinePhrases = [
    "ELEVATING USER EXPERIENCES",
    "BUILDING WITH CLARITY & PURPOSE",
    "CREATING WITH CARE",
    "TURNING VISION INTO CODE",
];

const line1El = document.getElementById("intro-line-1");
const line2El = document.getElementById("intro-line-2");

let line1Index = 0;
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

document.addEventListener("DOMContentLoaded", () => {
    line1El.classList.add("typewriter-cursor");
    setTimeout(typeLine1, 1000)
});

function typeLine1() {
    if (line1Index < line1Text.length) {
        line1El.textContent += line1Text.charAt(line1Index);
        line1Index++;
        setTimeout(typeLine1, 70);
    } else {
        line1El.classList.remove("typewriter-cursor");
        line2El.classList.add("typewriter-cursor");
        setTimeout(typeSecondLine, 800);
    }
}

function typeSecondLine() {
    const currentPhrase = secondLinePhrases[phraseIndex];
    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }
    
    // Add line breaks when text reaches certain length
    let displayText = currentPhrase.substring(0, charIndex);
    if (!isDeleting && displayText.length > 20) {
        // Find the last space before the 20th character
        const lastSpace = displayText.lastIndexOf(' ', 20);
        if (lastSpace !== -1) {
            displayText = displayText.substring(0, lastSpace) + '\n' + displayText.substring(lastSpace + 1);
        }
    }
    
    line2El.textContent = displayText;
    
    if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => isDeleting = true, 1500); // Increased pause time
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % secondLinePhrases.length;
    }
    const speed = isDeleting ? 40 : 80;
    setTimeout(typeSecondLine, speed);
}




/*----------------------------------------------
  SEND USER TO TOP OF PAGE ON REFRESH
----------------------------------------------*/
// window.onbeforeunload = function () {
//     window.scrollTo(0, 0);
//     window.history.scrollRestoration = "manual";
// };








/*----------------------------------------------
  CONTACT FORM VALIDATION AND SUBMISSION
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('contact-form');
    const submitButton = document.getElementById('contact-submit-button');
    const defaultButtonText = submitButton.textContent;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fields = ['name', 'email', 'referral_source', 'message'];
        let isValid = true;

        // Clear previous errors
        fields.forEach(field => {
            const input = document.getElementById(field);
            const error = document.getElementById(`${field}-error`);
            input.classList.remove('error', 'invalid');
            error.textContent = '';
        });

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const referralSource = document.getElementById('referral_source');
        const message = document.getElementById('message');
        const honeypot = document.getElementById('referral_code');

        if (honeypot && honeypot.value.trim() !== "") {
            return;
        }

        if (name.value.trim() === '') {
            showError(name, 'Name is required');
            isValid = false;
        } else if (!/^[a-zA-Z\s'-]+$/.test(name.value)) {
            showError(name, 'Name must only contain letters and spaces');
            isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() === '') {
            showError(email, 'Email is required');
            isValid = false;
        } else if (!emailPattern.test(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        }

        if (referralSource.value === '') {
            showError(referralSource, 'Please select how you heard about us');
            isValid = false;
        }

        if (message.value.trim() === '') {
            showError(message, 'Message cannot be empty');
            isValid = false;
        } else if (message.value.length > 999) {
            showError(message, 'Message is too long');
            isValid = false;
        }

        if (isValid) {
            // Disable button and show sending text
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
            submitButton.classList.add("submitting");


            try {
                const formData = new FormData(form);
                const response = await fetch("/contact", {
                    method: "POST",
                    body: formData,
                });

                if (response.status === 429) {
                    alert("Too many submissions. Please try again later.");
                    return;
                }

                const result = await response.json();

                if (result.success) {
                    form.reset();
                    alert("Thanks for reaching out!");
                } else {
                    alert("Something went wrong. Please try again later.");
                }
            } catch (error) {
                console.error("Form submission error:", error);
                alert("Failed to submit form.");
            } finally {
                // Re-enable button and restore text
                submitButton.disabled = false;
                submitButton.textContent = defaultButtonText;
                submitButton.classList.remove("submitting");

            }
        }

        function showError(input, message) {
            input.classList.add('error', 'invalid');
            const error = document.getElementById(`${input.id}-error`);
            error.textContent = message;
        }
    });
});









/*----------------------------------------------
  FALLING CODE ON SOURCE CODE
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('falling-code');
    const section = document.querySelector('.source-code');

    if (!canvas || !section) return; // exit early if elements missing

    const ctx = canvas.getContext('2d');
    const computedStyles = window.getComputedStyle(section);
    const fontSize = parseFloat(computedStyles.fontSize);
    const fontFamily = computedStyles.fontFamily;

    const letters = 'アァイィウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    let columns;
    let drops = [];
    let frame = 0;
    const frameDelay = 5;

    function resizeCanvasToSection() {
        const rect = section.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    }

    function drawMatrix() {
        if (frame % frameDelay === 0) {
            ctx.fillStyle = 'rgba(12, 12, 12, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FF2692';
            ctx.font = `${fontSize}px ${fontFamily}`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        }
        frame++;
        requestAnimationFrame(drawMatrix);
    }

    // Only observe if section exists
    const resizeObserver = new ResizeObserver(resizeCanvasToSection);
    resizeObserver.observe(section);

    // Start animation
    resizeCanvasToSection();
    drawMatrix();
});














/*----------------------------------------------
  SOLUTIONS CARD CURSOR GLOW
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.solution-card').forEach(card => {
        const glow = card.querySelector('.glow');
  
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
        });
  
        card.addEventListener('mouseenter', () => {
            glow.style.opacity = '1';
        });
  
        card.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });
    });
});








/*----------------------------------------------
  HEADER BURGER MENU
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const headerBurger = document.getElementById('header-burger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');
    const overlay = document.getElementById('overlay');

    headerBurger.addEventListener('click', () => {
        headerBurger.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            headerBurger.classList.remove('active');
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
        });
    });

    overlay.addEventListener("click", () => {
        headerBurger.classList.remove("active");
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
    });
});







/*----------------------------------------------
  SCROLL ANIMATIONS
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    // Create intersection observer for work and solution cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // For work cards, add animation with delay based on index
                if (entry.target.classList.contains('work-card')) {
                    const cards = document.querySelectorAll('.work-card');
                    const index = Array.from(cards).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 200); // 200ms delay between each card
                }
                // For solution cards, animate them with different delays
                else if (entry.target.classList.contains('solution-card')) {
                    const delay = entry.target.classList.contains('solution-card-1') ? 0 :
                                entry.target.classList.contains('solution-card-2') ? 200 :
                                entry.target.classList.contains('solution-card-3') ? 100 : 0;
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, delay);
                }
                // For strategy section elements
                else if (entry.target.classList.contains('strategy-content') || 
                         entry.target.classList.contains('strategy-image-container')) {
                    entry.target.classList.add('animate-in');
                }
                // For individual strategy sections
                else if (entry.target.classList.contains('strategy-section')) {
                    const sections = document.querySelectorAll('.strategy-section');
                    const index = Array.from(sections).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 200); // 200ms delay between each section
                }
            }
        });
    }, {
        threshold: 0.1, // Lower threshold for cards
        rootMargin: '0px 0px -50px 0px'
    });

    // Create separate observer for contact section with higher threshold
    const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'contact-form' || 
                    entry.target.classList.contains('contact-header-container')) {
                    console.log('Contact element intersecting:', entry.target.id || 'header-container');
                    entry.target.classList.add('animate-in');
                }
            }
        });
    }, {
        threshold: 0.3, // Higher threshold for contact section
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe work cards
    document.querySelectorAll('.work-card').forEach(card => {
        observer.observe(card);
    });

    // Observe solution cards
    document.querySelectorAll('.solution-card').forEach(card => {
        observer.observe(card);
    });

    // Observe strategy section elements
    const strategyContent = document.querySelector('.strategy-content');
    const strategyImage = document.querySelector('.strategy-image-container');
    if (strategyContent) observer.observe(strategyContent);
    if (strategyImage) observer.observe(strategyImage);

    // Observe individual strategy sections
    document.querySelectorAll('.strategy-section').forEach(section => {
        observer.observe(section);
    });

    // Observe contact section elements with the contact-specific observer
    const contactHeader = document.querySelector('.contact-header-container');
    const contactForm = document.getElementById('contact-form');
    
    if (contactHeader) {
        contactObserver.observe(contactHeader);
    }
    if (contactForm) {
        contactObserver.observe(contactForm);
    }
});