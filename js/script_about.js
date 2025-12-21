// JS file for About page functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {

    /* Script to change span element in text-container when hovering over image in img-container */
    const imgContainer = document.querySelector('.img-container');
    const frogText = document.querySelector('.frog-text');
    const oliverText = document.querySelector('.oliver-text');

    imgContainer.addEventListener('mouseenter', () => {
        frogText.classList.add('hide');
        oliverText.classList.add('show');
    });

    imgContainer.addEventListener('mouseleave', () => {
        frogText.classList.remove('hide');
        oliverText.classList.remove('show');
    });
});
