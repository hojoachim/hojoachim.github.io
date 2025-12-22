// JS file for About page functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    
    /* Script to change span element in text-container when hovering over image in img-container */
    const imgContainer = document.querySelector('.img-container');
    const frogText = document.querySelector('.frog-text');
    const oliverText = document.querySelector('.oliver-text');
    let showingOliver = false;
    
    imgContainer.addEventListener('mouseenter', showOliver);
    imgContainer.addEventListener('touchstart', showOliver);
    
    imgContainer.addEventListener('mouseleave', showFrog);
    imgContainer.addEventListener('touchend', showFrog);

    function showOliver(e) {
        if (!showingOliver) {
            frogText.classList.add('hide');
            oliverText.classList.add('show');
            showingOliver = true;
        }
    }

    function showFrog(e) {
        if (showingOliver) {
            frogText.classList.remove('hide');
            oliverText.classList.remove('show');
            showingOliver = false;
        }
    }

    // Touch/click anywhere switches back to Frog
    // document.addEventListener('touchstart', function(e) {
    //     if (showingOliver && !imgContainer.contains(e.target)) {
    //         showFrog();
    //     }
    // });
});

