// JS file for Navbar and greeting functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {

    /*
    Type greeting when hovering over 'me' in logo span
    Based on w3schools Typewriter example
    Own add-ons: line break, fade-out effect, connection to span hover, and suppression of re-triggering the greeting during typing or if the mouse is hovering over the span when the greeting finishes
    */
    const logoSpan = document.querySelector('.navbar .logo span');
    const greet = document.getElementById('meGreeting');
    let i = 0;
    const txt = "Dr. Hans-Oliver Joachim from Tokyo, Japan";
    const speed = 80;
    let running = false; // Flag to track greeting state
    let hover = false; // Flag to track hover state

    function typeWriter() {
        if (i < txt.length) {
            if (txt.charAt(i) === "\n") {
                greet.innerHTML += "<br>"; // Handle line breaks
            }
            greet.innerHTML += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
        else {
            // Reset the greeting after typing with a fade-out effect
            setTimeout(() => {
                greet.classList.add('fade-out'); // Add the fade-out class
                logoSpan.style.opacity = "1"; // Bring back the span
                setTimeout(() => {
                    greet.innerHTML = ""; // Clear the content after the fade-out
                    greet.classList.remove('fade-out'); // Remove the fade-out class
                    i = 0; // Reset index for next hover
                }, 1000); // Match the duration of the CSS transition (1s in this case)
                running = false; // Reset the running flag
            }, 3000); // Wait for 3 seconds before starting the fade-out
        }
    }

    // Track when the mouse enters the logo span
    logoSpan.addEventListener('mouseenter', () => {
        if (!running && !hover) { // Prevent triggers during greeting and if mouse hovers when greeting is finished
            logoSpan.style.opacity = "0"; // Hide the span
            greet.innerHTML = ""; // Clear previous content
            running = true; // Set running flag
            hover = true; // Set hover flag
            typeWriter(); // Start typing
        }
        else {
            hover = true; // Set hover flag every time the mouse enters
        }
    });

    // Track when the mouse leaves the logo span
    logoSpan.addEventListener('mouseleave', () => {
        hover = false; // Reset hover flag every time the mouse leaves
    });


    // Mobile menu functionality
    const nav = document.querySelector('nav');
    const mobileBtn = document.getElementById('mobile-cta');  // "burger" image
    const mobileBtnExit = document.getElementById('mobile-exit');  // X symbol

    // Check if elements exist before adding event listeners
    if (mobileBtn && mobileBtnExit && nav) {
        // Click on "burger" image
        mobileBtn.addEventListener('click', () => {
            nav.classList.add('menu-btn');  // Add class to open mobile menu
        });

        // Click on "X" symbol
        mobileBtnExit.addEventListener('click', () => {
            nav.classList.remove('menu-btn');  // Remove class to close mobile menu
        });
    } else {
        console.error("One or more elements (nav, mobileBtn, mobileBtnExit) are missing in the DOM.");
    }

    /*
    With help from CS50 Duck Debugger
    Script to temporarily change the current navbar element from bold to regular when hovering over another navbar element and back to bold when hover ends
    */
    document.querySelectorAll('nav ul.primary-nav li a').forEach(item => {
        const current = document.querySelector('nav ul li.current') // keep track of the current element in a variable
        item.addEventListener('mouseover', event => {
            current.classList.remove('current');
            event.target.classList.add('current');
        });

        item.addEventListener('mouseout', event => {
            event.target.classList.remove('current');
            current.classList.add('current');
        });
    });
});