// JS file for About page functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    
    /* Script to change span element in text-container when hovering over image in img-container */
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

    // Mouse enter: show Oliver, revert after 3s
    imgContainer.addEventListener('mouseenter', function() {
        showOliver();
        if (revertTimeout) clearTimeout(revertTimeout);
        revertTimeout = setTimeout(showFrog, 3000);
    });

    // Mouse leave: revert immediately
    imgContainer.addEventListener('mouseleave', function() {
        if (revertTimeout) clearTimeout(revertTimeout);
        showFrog();
    });

    // Touch start: show Oliver, revert after 3s
    imgContainer.addEventListener('touchstart', function(e) {
        showOliver();
        if (revertTimeout) clearTimeout(revertTimeout);
        revertTimeout = setTimeout(showFrog, 3000);
    });

    // Tap again to revert immediately
    imgContainer.addEventListener('touchend', function(e) {
        if (showingOliver) {
            if (revertTimeout) clearTimeout(revertTimeout);
            showFrog();
        }
    });
});

