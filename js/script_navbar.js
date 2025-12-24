// JS file for Navbar and greeting functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {

    /*
    Type greeting when hovering over 'me' in logo span
    Based on w3schools Typewriter example
    Own add-ons: fade-out effect, connection to span hover, and suppression of re-triggering the greeting during typing or if the mouse is hovering over the span when the greeting finishes
    */
    const logoSpan = document.querySelector('.navbar .logo span');
    const greet = document.getElementById('meGreeting');
    let i = 0;
    const txt = "Dr. Hans-Oliver Joachim from Tokyo, Japan";
    const speed = 40;
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


    // Track when the mouse enters or user taps the logo span
    logoSpan.addEventListener('mouseenter', startGreeting);
    logoSpan.addEventListener('touchstart', startGreeting);
    
    // Track when the mouse leaves or user lifts finger from the logo span
    logoSpan.addEventListener('mouseleave', endGreeting);
    logoSpan.addEventListener('touchend', endGreeting);
    
    function startGreeting(e) {
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
    };

    function endGreeting(e) {
        hover = false; // Reset hover flag
    };


    // Mobile menu functionality
    const nav = document.querySelector('nav');
    const mobileBtn = document.getElementById('mobile-cta');  // "burger" image
    const mobileBtnExit = document.getElementById('mobile-exit');  // X symbol

    // Check if elements exist before adding event listeners
    if (mobileBtn && mobileBtnExit && nav) {
        // Click or tap on "burger" image
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Suppress default action for touch devices
            nav.classList.add('menu-btn');  // Add class to open mobile menu
        }, {passive: false});
        
        // Click or tap on "X" symbol
        mobileBtnExit.addEventListener('click', (e) => {
            e.preventDefault(); // Suppress default action for touch devices
            nav.classList.remove('menu-btn');  // Remove class to close mobile menu
        }, {passive: false});

        // Close mobile menue at window resize >768px
        window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('menu-btn');
            // nav.style.display = ''; // Reset display property
            }
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