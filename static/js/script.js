// Detects when user scrolls to make header appear
document.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});



// Typewriter effect on intro text
const line1Text = "Hello, my name is ";
const nameText = "Tom Page";
const secondLinePhrases = [
    "I am a full stack web developer",
    "I turn your ideas into code",
    "I care about performance and design"
];

const line1El = document.getElementById("intro-line-1");
const line2El = document.getElementById("intro-line-2");

let line1Index = 0;
let nameIndex = 0;
let typingName = false;
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

document.addEventListener("DOMContentLoaded", () => {
    line1El.classList.add("typewriter-cursor"); // Show cursor on line 1
    typeLine1();
});

function typeLine1() {
    if (!typingName) {
        if (line1Index < line1Text.length) {
            line1El.textContent += line1Text.charAt(line1Index);
            line1Index++;
            setTimeout(typeLine1, 70);
        } else {
            typingName = true;
            // Create the <a> tag so we can type inside it
            const a = document.createElement("a");
            a.href = "#about";
            a.id = "name-link";
            line1El.appendChild(a);
            setTimeout(typeLine1, 100);
        }
    } else {
        const nameLink = document.getElementById("name-link");
        if (nameIndex < nameText.length) {
            nameLink.textContent += nameText.charAt(nameIndex);
            nameIndex++;
            setTimeout(typeLine1, 70);
        } else {
            // Remove cursor from line 1, show it on line 2
            line1El.classList.remove("typewriter-cursor");
            line2El.classList.add("typewriter-cursor");

            setTimeout(typeSecondLine, 800);
        }
    }
}

function typeSecondLine() {
    const currentPhrase = secondLinePhrases[phraseIndex];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    line2El.textContent = currentPhrase.substring(0, charIndex);

    if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => isDeleting = true, 800);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % secondLinePhrases.length;
    }

    const speed = isDeleting ? 40 : 80;
    setTimeout(typeSecondLine, speed);
}




// IMAGE SCROLL ON ABOUT
const slideshowTrack = document.querySelector('.slideshow-track');
const images = slideshowTrack.querySelectorAll('img');
const slideCount = images.length;
const slideWidth = window.innerWidth / 2; // 50vw
let currentIndex = 0;

// Clone the first image and append it
const firstClone = images[0].cloneNode(true);
slideshowTrack.appendChild(firstClone);

function moveSlide() {
    currentIndex++;
    slideshowTrack.style.transition = 'transform 1s ease-in-out';
    slideshowTrack.style.transform = `translateX(-${slideWidth * currentIndex}px)`;

    // When hitting the clone (end), reset without animation
    if (currentIndex === slideCount) {
        setTimeout(() => {
        slideshowTrack.style.transition = 'none';
        slideshowTrack.style.transform = `translateX(0px)`;
        currentIndex = 0;
        }, 1000); // Match this to your transition duration (1s)
    }
}

setInterval(moveSlide, 4000);




// SEND USER TO THE TOP OF THE PAGE ON PAGE REFRESH
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
    window.history.scrollRestoration = "manual"; // prevent auto-scroll
};




// MOUSE MOVEMENT MOVES INTRO OVERLAY
document.querySelector('.intro').addEventListener('mousemove', (e) => {
    const svg1 = document.querySelector('#duck-web'); // First SVG with ID svg1
    const svg2 = document.querySelector('#html-cmd'); // Second SVG with ID svg2

    const mouseX = e.pageX;
    const mouseY = e.pageY;

    svg1.style.transform = `translate(${(mouseX - window.innerWidth / 2) * 0.05}px, ${(mouseY - window.innerHeight / 2) * 0.05}px)`;
    svg2.style.transform = `translate(${(window.innerWidth / 2 - mouseX) * 0.05}px, ${(window.innerHeight / 2 - mouseY) * 0.05}px)`;
});






// CONTACT FORM REQUIRED FIELDS AND SUBMISSION
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fields = ['name', 'email', 'message'];
        let isValid = true;

        fields.forEach(field => {
            const input = document.getElementById(field);
            const error = document.getElementById(`${field}-error`);
            input.classList.remove('error');
            error.textContent = '';
        });

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');

        if (name.value.trim() === '') {
            showError(name, 'Name is required');
            isValid = false;
        } else if (!/^[a-zA-Z\s'-]+$/.test(name.value)) {
            showError(name, 'Name must only contain letters and spaces');
            isValid = false;
        } else {
            name.classList.remove('invalid');
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() === '') {
            showError(email, 'Email is required');
            isValid = false;
        } else if (!emailPattern.test(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            email.classList.remove('invalid');
        }

        if (message.value.trim() === '') {
            showError(message, 'Message cannot be empty');
            isValid = false;
        } else if (message.value.length > 999) {
            showError(message, 'Message is to long')
            isValid = false;
        } else {
            message.classList.remove('invalid');
        }

        if (isValid) {
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
            }
        }

        function showError(input, message) {
            input.classList.add('error', 'invalid');
            const error = document.getElementById(`${input.id}-error`);
            error.textContent = message;
        }
    });
});






// FALLING CODE
const canvas = document.getElementById('falling-code');
const ctx = canvas.getContext('2d');

// Read font size and family from CSS
const section = document.querySelector('.source-code');
const computedStyles = window.getComputedStyle(section);
const fontSizePx = computedStyles.fontSize;
const fontFamily = computedStyles.fontFamily;

// Convert font size to number
const fontSize = parseFloat(fontSizePx);

// Resize canvas to match screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

const letters = 'アァイィウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

let frame = 0;
const frameDelay = 2; // Slows down animation

function drawMatrix() {
  if (frame % frameDelay === 0) {
    ctx.fillStyle = 'rgba(4, 20, 22, 0.1)';
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

drawMatrix();
window.addEventListener('resize', () => {
  resizeCanvas();
});
