// JS file for Wiki pop-up preview functionality

//IIFE (Immediately Invoked Function Expression): (function() { ... })() creates a private scope to avoid polluting the global namespace
(function() { 
    'use strict'; // Enables strict mode for better error checking and prevents common JavaScript pitfalls

    // State variables
    const cache = new Map(); // Map object to store API responses so we don't fetch the same article twice
    let previewElement = null; // Will hold the DOM element for the pop-up window
    let mainContainer = null; // Cached reference to .main-container (the page's content area)
    let showTimeout = null; // Timer ID for the delay before showing preview (prevents flashing on quick hovers)
    let hideTimeout = null; // Timer ID for the delay before hiding preview (keeps it visible when moving to the pop-up)
    let currentLink = null; // Track which link is currently being hovered (prevents race conditions)

    // Configuration constants
    const SHOW_DELAY = 400; // 400ms wait before showing
    const HIDE_DELAY = 300; // 300ms wait before hiding
    const API_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary/'; // Wikipedia REST API endpoint for fetching article summaries
    const PREVIEW_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--preview-width')); // Get fixed preview width from CSS variable
    const PADDING = 10; // Space in px between link and pop-up, and from container edges

    // Check if device is mobile (if any of the three conditions are true)
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) // Regex test on user agent string (/i makes it case-insensitive, userAgent is a string identifying the browser and OS)
               || ('ontouchstart' in window) // Detect touch capability
               || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches); // Check if window.matchMedia exists and screen is ≤768px wide
    }

    // Initialize
    function init() {
        if (isMobileDevice()) return; // Exit if mobile device detected

        // Cache main container once for boundary checks
        mainContainer = document.querySelector('.main-container');
        if (!mainContainer) return; // Exit if no container found
        
        createPreviewElement();
        attachEventListeners();
    }

    // Create the preview DOM element
    function createPreviewElement() {
        previewElement = document.createElement('div'); // New <div> 
        previewElement.className = 'wiki-preview'; // with class wiki-preview for CSS styling
        document.body.appendChild(previewElement); // appends to <body>

        previewElement.addEventListener('mouseenter', () => clearTimeout(hideTimeout)); // Cancel hide timer on mouseenter
        previewElement.addEventListener('mouseleave', hidePreview); // Hide pop-up on mouseleave
        previewElement.addEventListener('click', () => {
            const url = previewElement.dataset.wikiUrl;
            if (url) window.open(url, '_blank'); // Open Wikipedia page in new tab on click
        });
    }

    // Attach event listeners to all Wikipedia links
    function attachEventListeners() {
        document.querySelectorAll('a[href*="wikipedia.org/wiki/"]').forEach(link => {
            link.addEventListener('mouseenter', handleMouseEnter);
            link.addEventListener('mouseleave', handleMouseLeave);
        });
    }

    // Handle mouse enter
    function handleMouseEnter(event) {
        currentLink = event.currentTarget; // Set current link being hovered
        clearTimeout(hideTimeout); // Clear any hide timer
        showTimeout = setTimeout(() => showPreview(currentLink), SHOW_DELAY); // Start show timer
    }

    // Handle mouse leave
    function handleMouseLeave() {
        clearTimeout(showTimeout); // Clear show timer
        hideTimeout = setTimeout(hidePreview, HIDE_DELAY); // Start hide timer
    }

    // Extract article title from Wikipedia URL
    function extractArticleTitle(url) {
        const match = url.match(/\/wiki\/([^#?]+)/); // Regex to capture article title from URL, like /wiki/Article_Title, ignoring fragments (#) and query parameters (?)
        return match ? decodeURIComponent(match[1]) : null; // If match found, decode (e.g., %20 to space) and return 1st captured group, like Article_Title; else return null
    }

    // Fetch article data from Wikipedia API
    async function fetchArticleData(title) {
        if (cache.has(title)) return cache.get(title); // Check cache first

        // Fetch from API
        const response = await fetch(API_ENDPOINT + encodeURIComponent(title));
        if (!response.ok) throw new Error('Failed to fetch article');
        
        const data = await response.json();
        cache.set(title, data); //Store in cache
        return data;
    }

    // Reposition preview after content fully loads
    function repositionWhenReady(link) {
        if (currentLink !== link) return; // Only proceed if still hovering over the same link

        const img = previewElement.querySelector('.wiki-preview-thumbnail'); // Check if there's an image in the preview
        
        const doPosition = () => { // Helper function to call position preview
            if (currentLink === link) positionPreview(link); // if still hovering (user has not moved to a different link during the async wait)
        };

        if (img && !img.complete) { // If image exists and hasn't finished loading yet
            // Wait for image to load
            img.onload = img.onerror = doPosition; // Event listeners for load or error to reposition (uses assignment chaining)
        } else {
            // Use double RAF for layout completion if no image or already loaded
            requestAnimationFrame(() => requestAnimationFrame(doPosition));
        }
    }

    // Show preview
    async function showPreview(link) {
        const articleTitle = extractArticleTitle(link.href); //Extract the article title from the link URL
        if (!articleTitle) return; // Exit if no valid title found

        previewElement.innerHTML = '<div class="wiki-preview-loading">Loading...</div>'; // Set the preview content to display "Loading..."
        positionPreview(link); // Position the preview relative to the link
        previewElement.classList.add('show'); // Make the preview visible by adding 'show' class via CSS

        try { // Try to fetch the article from Wikipedia API
            const data = await fetchArticleData(articleTitle);
            if (currentLink === link) { // If successful and still hovering over the same link
                renderPreview(data); // Render the preview content
                repositionWhenReady(link); // Reposition the preview after content fully loads
            }
        } catch (error) { // If an error occurs during fetch
            if (currentLink === link) { // and still hovering over the same link
                previewElement.innerHTML = '<div class="wiki-preview-error">Failed to load preview</div>'; // Set the preview content to display "Failed to load preview"
            }
            console.error('Error fetching Wikipedia article:', error);
        }
    }

    // Render preview content
    function renderPreview(data) { // Extract key data from API response
        const thumbnail = data.thumbnail?.source || ''; // Thumbnail image URL if available (uses OR || as nullish coalescing, returning the right side if the left is any falsy value (null, undefined, '', 0, false, NaN))
        const title = data.title || ''; // Article title if available
        const extract = data.extract || 'No description available.'; // Excerpt text if available
        const url = data.content_urls?.desktop?.page || ''; // Wikipedia page full URL if available (uses ?. optional chaining)

        previewElement.dataset.wikiUrl = url; // Store the Wikipedia URL as a data attribute so the click handler can open it

        let html = '<div class="wiki-preview-content">'; // Starts building the HTML string
        
        if (thumbnail) { // If thumbnail exists, add image tag
            html += `<img src="${thumbnail}" alt="${title}" class="wiki-preview-thumbnail">`;
        }

        // Format text with title
        const titleIndex = extract.indexOf(title); // Searche for the article title within the extract text and store its position. If the title isn't found, indexOf() return -1
        const formattedText = (titleIndex !== -1 && titleIndex < 75)
            // If found and within the first 75 characters
            ? extract.substring(0, titleIndex) + // Get all text before the title
              `<span class="wiki-preview-title">${title}</span>` + // Wrap title in a span element for styling
              extract.substring(titleIndex + title.length) // Get all text after the title
            // Else prepend title with comma
            : `<span class="wiki-preview-title">${title},</span> ${extract}`;

        html += `<p class="wiki-preview-extract">${formattedText}</p>`; // Add the formatted text in a <p> tag to the HTML string
        html += '<div class="wiki-preview-footer"><img src="./images/W_in_blue.svg" alt="Wikipedia logo" class="wiki-icon"></div>'; // Adds footer with Wikipedia logo
        html += '</div>'; // Close the content div
        previewElement.innerHTML = html; // Set all HTML into the preview element
    }

    // Position preview relative to link
    function positionPreview(link) {
        const linkRect = link.getBoundingClientRect(); // Get hovered link's position on the screen (viewport coordinates, includes top, left, right, bottom. width, height)
        const containerRect = mainContainer.getBoundingClientRect(); // Get main container's position for boundary checks

        // Calculate horizontal position
        let left = linkRect.left + window.scrollX; // Set default position to align with the link's left edge, adjusted for page scroll
        if (linkRect.left + PREVIEW_WIDTH > containerRect.right) { // If preview would overflow container's right edge
            left = containerRect.right - PREVIEW_WIDTH + window.scrollX; // shift it left to fit within container
        }

        // Calculate vertical position
        const previewHeight = previewElement.offsetHeight; // Get the preview's height
        let top = linkRect.bottom + PADDING; // Default position below the link with PADDING1
        
        if (top + previewHeight > containerRect.bottom - PADDING) { // If preview would overflow container's bottom edge
            top = containerRect.bottom - previewHeight - PADDING; // shift it up to fit within container
        }

        previewElement.style.top = `${top + window.scrollY}px`; // Apply the calculated top position, convert viewport coordinate to page coordinate by adding window.scrollY
        previewElement.style.left = `${left}px`; // Apply the calculated left position, already has scroll offset added
    }

    // Hide preview
    function hidePreview() {
        previewElement.classList.remove('show'); // Remove 'show' class from preview elementto hide the preview via CSS
        currentLink = null; // Reset current link variable, i.e., no link is being hovered
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') { // If document is still loading
        document.addEventListener('DOMContentLoaded', init); // wait for DOMContentLoaded event and call init
    } else { // readyState is 'interactive' or 'complete'
        init(); // call init immediately
    }
})();