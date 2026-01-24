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
    let currentLink = null; // Tracks which link is currently being hovered (prevents race conditions)

    // Configuration constants
    const SHOW_DELAY = 400; // 400ms wait before showing
    const HIDE_DELAY = 300; // 300ms wait before hiding
    const API_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary/'; // Wikipedia REST API endpoint for fetching article summaries
    const PREVIEW_WIDTH = 320; // Fixed width of pop-up in px
    const PADDING = 10; // Space in px between link and pop-up, and from container edges

    // Check if device is mobile (if any of the three conditions are true)
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) // Regex test on user agent string
               || ('ontouchstart' in window) // Detects touch capability
               || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches); // Checks if screen is ≤768px wide
    }

    // Initialize
    function init() {
        if (isMobileDevice()) return;

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
            if (url) window.open(url, '_blank'); // Opens Wikipedia page in new tab on click
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
        currentLink = event.currentTarget;
        clearTimeout(hideTimeout);
        showTimeout = setTimeout(() => showPreview(currentLink), SHOW_DELAY);
    }

    // Handle mouse leave
    function handleMouseLeave() {
        clearTimeout(showTimeout);
        hideTimeout = setTimeout(hidePreview, HIDE_DELAY);
    }

    // Extract article title from Wikipedia URL
    function extractArticleTitle(url) {
        const match = url.match(/\/wiki\/([^#?]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    // Fetch article data from Wikipedia API
    async function fetchArticleData(title) {
        if (cache.has(title)) return cache.get(title);

        const response = await fetch(API_ENDPOINT + encodeURIComponent(title));
        if (!response.ok) throw new Error('Failed to fetch article');
        
        const data = await response.json();
        cache.set(title, data);
        return data;
    }

    // Reposition preview after content loads
    function repositionWhenReady(link) {
        if (currentLink !== link) return;

        const img = previewElement.querySelector('.wiki-preview-thumbnail');
        
        const doPosition = () => {
            if (currentLink === link) positionPreview(link);
        };

        if (img && !img.complete) {
            // Wait for image to load
            img.onload = img.onerror = doPosition;
        } else {
            // Use double RAF for layout completion
            requestAnimationFrame(() => requestAnimationFrame(doPosition));
        }
    }

    // Show preview
    async function showPreview(link) {
        const articleTitle = extractArticleTitle(link.href);
        if (!articleTitle) return;

        previewElement.innerHTML = '<div class="wiki-preview-loading">Loading...</div>';
        positionPreview(link);
        previewElement.classList.add('show');

        try {
            const data = await fetchArticleData(articleTitle);
            if (currentLink === link) {
                renderPreview(data);
                repositionWhenReady(link);
            }
        } catch (error) {
            if (currentLink === link) {
                previewElement.innerHTML = '<div class="wiki-preview-error">Failed to load preview</div>';
            }
            console.error('Error fetching Wikipedia article:', error);
        }
    }

    // Render preview content
    function renderPreview(data) {
        const thumbnail = data.thumbnail?.source || '';
        const title = data.title || '';
        const extract = data.extract || 'No description available.';
        const url = data.content_urls?.desktop?.page || '';

        previewElement.dataset.wikiUrl = url;

        let html = '<div class="wiki-preview-content">';
        
        if (thumbnail) {
            html += `<img src="${thumbnail}" alt="${title}" class="wiki-preview-thumbnail">`;
        }

        // Format text with title
        const titleIndex = extract.indexOf(title);
        const formattedText = (titleIndex !== -1 && titleIndex < 50)
            ? extract.substring(0, titleIndex) + 
              `<span class="wiki-preview-title">${title}</span>` + 
              extract.substring(titleIndex + title.length)
            : `<span class="wiki-preview-title">${title}.</span> ${extract}`;

        html += `<p class="wiki-preview-extract">${formattedText}</p>`;
        html += '<div class="wiki-preview-footer"><img src="./images/W_in_blue.svg" alt="Wikipedia logo" class="wiki-icon"></div>';
        html += '</div>';
        previewElement.innerHTML = html;
    }

    // Position preview relative to link
    function positionPreview(link) {
        const linkRect = link.getBoundingClientRect();
        const containerRect = mainContainer.getBoundingClientRect();

        // Calculate horizontal position
        let left = linkRect.left + window.scrollX;
        if (linkRect.left + PREVIEW_WIDTH > containerRect.right) {
            left = containerRect.right - PREVIEW_WIDTH + window.scrollX;
        }

        // Calculate vertical position
        const previewHeight = previewElement.offsetHeight;
        let top = linkRect.bottom + PADDING;
        
        if (top + previewHeight > containerRect.bottom - PADDING) {
            top = containerRect.bottom - previewHeight - PADDING;
        }

        previewElement.style.top = `${top + window.scrollY}px`;
        previewElement.style.left = `${left}px`;
    }

    // Hide preview
    function hidePreview() {
        previewElement.classList.remove('show');
        currentLink = null;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();