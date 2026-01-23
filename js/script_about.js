// JS file for About page functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    
    /*
    Script to change the span element in text-container, the images, and the image caption
    */
    const imgContainer = document.querySelector('.img-container');
    const frogText = document.querySelector('.frog-text');
    const oliverText = document.querySelector('.oliver-text');
    const frogImg = document.querySelector('.main-img1');
    const oliverImg = document.querySelector('.main-img2');
    const frogCap = document.querySelector('.frog-caption');
    let showingOliver = false;
    let revertTimeout = null;
    
    function showOliver() {
        if (!showingOliver) {
            frogText.classList.add('hide');
            frogText.classList.remove('show');
            oliverText.classList.add('show');
            oliverText.classList.remove('hide');
            frogImg.classList.add('hide');
            frogImg.classList.remove('show');
            frogCap.classList.add('hide');
            frogCap.classList.remove('show');
            oliverImg.classList.add('show');
            oliverImg.classList.remove('hide');
            showingOliver = true;
        }
    }

    function showFrog() {
        if (showingOliver) {
            frogText.classList.add('show');
            frogText.classList.remove('hide');
            oliverText.classList.add('hide');
            oliverText.classList.remove('show');
            frogImg.classList.add('show');
            frogImg.classList.remove('hide');
            frogCap.classList.add('show');
            frogCap.classList.remove('hide');
            oliverImg.classList.add('hide');
            oliverImg.classList.remove('show');
            showingOliver = false;
        }
    }

    // Mouse hover: show Oliver, revert after 5s
    imgContainer.addEventListener('mouseenter', function() {
        showOliver();
        if (revertTimeout) clearTimeout(revertTimeout);
        revertTimeout = setTimeout(showFrog, 5000);
    });

    // Mouse leave: revert immediately
    imgContainer.addEventListener('mouseleave', function() {
        if (revertTimeout) clearTimeout(revertTimeout);
        showFrog();
    });

    // Mobile tap functionality: tap to show Oliver and revert after 5s, or tap again to revert immediately
    imgContainer.addEventListener('touchstart', function(e) {
        // Prevent default touch behavior, like scrolling
        e.preventDefault();
        if (!showingOliver) {
            showOliver();
            if (revertTimeout) clearTimeout(revertTimeout);
            revertTimeout = setTimeout(showFrog, 5000);
        } else {
            // If already showing Oliver, revert immediately
            if (revertTimeout) clearTimeout(revertTimeout);
            showFrog();
        }
    // tells the browser that the event listener might call preventDefault(), so it should not perform the default action (like scrolling) until the event listener has finished executing    
    }, {passive: false});
});
