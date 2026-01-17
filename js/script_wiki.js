// Wikipedia Preview Pop-up Implementation
(function() {
    'use strict';

    // Cache for API responses
    const cache = new Map();
    
    // Preview element
    let previewElement = null;
    let showTimeout = null;
    let hideTimeout = null;
    let currentLink = null;

    // Global constants
    const SHOW_DELAY = 400; // ms delay before showing preview
    const HIDE_DELAY = 300; // ms delay before hiding preview
    const API_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

    // Check if device is mobile
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || ('ontouchstart' in window) 
               || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    }

    // Initialize
    function init() {
        // Don't initialize on mobile devices
        if (isMobileDevice()) {
            return;
        }
        
        createPreviewElement();
        attachEventListeners();
    }

    // Create the preview DOM element
    function createPreviewElement() {
        previewElement = document.createElement('div');
        previewElement.className = 'wiki-preview';
        document.body.appendChild(previewElement);

        // Keep preview visible when hovering over it
        previewElement.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        // Hide when mouse leaves the preview window
        previewElement.addEventListener('mouseleave', () => {
            hidePreview();
        });

        // Make entire preview clickable to open Wikipedia page
        previewElement.addEventListener('click', (e) => {
            const url = previewElement.dataset.wikiUrl;
            if (url) {
                window.open(url, '_blank');
            }
        });
    }

    // Attach event listeners to all Wikipedia links
    function attachEventListeners() {
        const wikiLinks = document.querySelectorAll('a[href*="wikipedia.org/wiki/"]');
        
        wikiLinks.forEach(link => {
            link.addEventListener('mouseenter', handleMouseEnter);
            link.addEventListener('mouseleave', handleMouseLeave);
        });
    }

    // Handle mouse enter
    function handleMouseEnter(event) {
        const link = event.currentTarget;
        currentLink = link;

        // Clear any pending hide
        clearTimeout(hideTimeout);

        // Set delay before showing
        showTimeout = setTimeout(() => {
            showPreview(link);
        }, SHOW_DELAY);
    }

    // Handle mouse leave
    function handleMouseLeave() {
        // Clear show timeout
        clearTimeout(showTimeout);

        // Set delay before hiding
        hideTimeout = setTimeout(() => {
            hidePreview();
        }, HIDE_DELAY);
    }

    // Extract article title from Wikipedia URL
    function extractArticleTitle(url) {
        const match = url.match(/\/wiki\/([^#?]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    // Fetch article data from Wikipedia API
    async function fetchArticleData(title) {
        // Check cache first
        if (cache.has(title)) {
            return cache.get(title);
        }

        try {
            const response = await fetch(API_ENDPOINT + encodeURIComponent(title));
            
            if (!response.ok) {
                throw new Error('Failed to fetch article');
            }

            const data = await response.json();
            
            // Cache the result
            cache.set(title, data);
            
            return data;
        } catch (error) {
            console.error('Error fetching Wikipedia article:', error);
            throw error;
        }
    }

    // Show preview
    async function showPreview(link) {
        const articleTitle = extractArticleTitle(link.href);
        
        if (!articleTitle) {
            return;
        }

        // Show loading state
        previewElement.innerHTML = '<div class="wiki-preview-loading">Loading...</div>';
        positionPreview(link);
        previewElement.classList.add('show');

        try {
            const data = await fetchArticleData(articleTitle);
            
            // Only update if we're still hovering over the same link
            if (currentLink === link) {
                renderPreview(data);
                
                // Check if there's an image to wait for
                const img = previewElement.querySelector('.wiki-preview-thumbnail');
                
                if (img) {
                    // Image exists - wait for it to load
                    if (img.complete) {
                        // Image already loaded (from cache)
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                if (currentLink === link) {
                                    positionPreview(link);
                                }
                            });
                        });
                    } else {
                        // Wait for image to load
                        img.onload = () => {
                            if (currentLink === link) {
                                positionPreview(link);
                            }
                        };
                        img.onerror = () => {
                            if (currentLink === link) {
                                positionPreview(link);
                            }
                        };
                    }
                } else {
                    // No image - use double RAF for DOM update
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            if (currentLink === link) {
                                positionPreview(link);
                            }
                        });
                    });
                }
            }
        } catch (error) {
            if (currentLink === link) {
                previewElement.innerHTML = '<div class="wiki-preview-error">Failed to load preview</div>';
            }
        }
    }

    // Render preview content
    function renderPreview(data) {
        const thumbnail = data.thumbnail?.source || '';
        const title = data.title || '';
        const extract = data.extract || 'No description available.';
        const url = data.content_urls?.desktop?.page || '';

        // Store URL in dataset for click handler
        previewElement.dataset.wikiUrl = url;

        let html = '<div class="wiki-preview-content">';
        
        if (thumbnail) {
            html += `<img src="${thumbnail}" alt="${title}" class="wiki-preview-thumbnail">`;
        }

        // Check if title appears near the beginning of extract
        let formattedText;
        const titleIndex = extract.indexOf(title);
        
        if (titleIndex !== -1 && titleIndex < 50) {
            // Title found in first ~50 characters, make it bold in place
            formattedText = extract.substring(0, titleIndex) + 
                           `<span class="wiki-preview-title">${title}</span>` + 
                           extract.substring(titleIndex + title.length);
        } else {
            // Title not at beginning, prepend it
            formattedText = `<span class="wiki-preview-title">${title}.</span> ${extract}`;
        }

        html += `<p class="wiki-preview-extract">${formattedText}</p>`;
        html += '</div>';

        previewElement.innerHTML = html;
    }

    // Position preview relative to link
    function positionPreview(link) {
        const linkRect = link.getBoundingClientRect();
        const previewWidth = 320;
        const padding = 10;

        // Get main-container boundaries
        const mainContainer = document.querySelector('.main-container');
        const containerRect = mainContainer.getBoundingClientRect();
        const rightBoundary = containerRect.right;
        const bottomBoundary = containerRect.bottom;

        let left = linkRect.left + window.scrollX;

        // Check if preview goes off right edge of main-container - shift it left
        const previewRight = linkRect.left + previewWidth;
        if (previewRight > rightBoundary) {
            left = rightBoundary - previewWidth + window.scrollX;
        }

        // Get actual height of current content
        const previewHeight = previewElement.offsetHeight;

        // Start by positioning below the link
        let top = linkRect.bottom + padding;
        
        // Check if preview would go beyond bottom of main-container (in viewport coordinates)
        const previewBottom = top + previewHeight;
        if (previewBottom > bottomBoundary - padding) {
            // Shift up so preview bottom aligns with container bottom (with padding)
            top = bottomBoundary - previewHeight - padding;
        }

        // Convert to document coordinates
        top = top + window.scrollY;

        previewElement.style.top = `${top}px`;
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