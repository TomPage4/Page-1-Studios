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
    setTimeout(typeLine1, 3000)
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
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
    window.history.scrollRestoration = "manual";
};








/*----------------------------------------------
  CONTACT FORM VALIDATION AND SUBMISSION
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('contact-form');
    const submitButton = document.getElementById('contact-submit-button');
    const defaultButtonText = submitButton.textContent;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fields = ['name', 'email', 'message'];
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
const canvas = document.getElementById('falling-code');
const ctx = canvas.getContext('2d');
const section = document.querySelector('.source-code');

const computedStyles = window.getComputedStyle(section);
const fontSizePx = computedStyles.fontSize;
const fontFamily = computedStyles.fontFamily;
const fontSize = parseFloat(fontSizePx);

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

// Observe size changes of the container, not window resizes
const resizeObserver = new ResizeObserver(resizeCanvasToSection);
resizeObserver.observe(section);

// Initial setup
resizeCanvasToSection();
drawMatrix();







/*----------------------------------------------
  PRELOADER PAGE ANIMATION
----------------------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    const NUM_BLOCKS = 6;

    const preloaderContainer = document.getElementById('preloader-blocks-container');
    const preloaderLogo = document.getElementById('preloader-logo-container');
    const mainContent = document.getElementById('preloader-main-content');

    for (let i = 0; i < NUM_BLOCKS; i++) {
        const block = document.createElement('div');
        block.classList.add('preloader-block-bar');
        block.style.width = `${100 / NUM_BLOCKS}%`;
        block.style.left = `${(100 / NUM_BLOCKS) * i}%`;
        preloaderContainer.appendChild(block);
    }

    const preloaderBlocks = document.querySelectorAll('.preloader-block-bar');

    setTimeout(() => {
        preloaderLogo.style.opacity = 0;

        preloaderBlocks.forEach((block, index) => {
            setTimeout(() => {
                block.classList.add('preloader-block-slide-up');
            }, index * 150);
        });

        const totalAnimationTime = NUM_BLOCKS * 200 + 800;
        setTimeout(() => {
            document.getElementById('preloader').style.display = 'none';
            document.documentElement.classList.remove('preload-active');
            document.body.classList.remove('preload-active');
        }, totalAnimationTime - 800);
    }, 1000);
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
  FORCE VIDEO PLAY
----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const video = document.querySelector('.intro-video-background');
  
    if (video) {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && video.paused) {
                video.play();
            }
        });
    }
});