/**
 * app.js
 * Main file for holding dashboard rendering, message showing, and loading theme preferences
 */

import { load, loadSetting, save, KEY } from './storage.js';

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference in localStorage
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '🌙'; // Set moon icon for dark mode
} else {
    themeToggle.textContent = '☀️'; // Set sun icon for light mode
}

// When someone clicks the theme change button
themeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');
    
    // Check if dark mode is on after clicking
    if (body.classList.contains('dark-mode') === true) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '🌙'; // Update icon to moon
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '☀️'; // Update icon to sun
    }
});

// Function to create a message popup alert on screen
export function showMessage(message, type = 'info', id) {
    let containerId = 'message-container';
    if (id !== undefined && id !== null && id !== '') {
        containerId = id;
    }
    
    const messageContainer = document.getElementById(containerId);
    if (messageContainer === null) {
        return; // exit function if container element not found
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    // Remove the message after 3 seconds timeout
    setTimeout(function () {
        if (messageElement.parentNode === messageContainer) {
            messageContainer.removeChild(messageElement);
        }
    }, 3000);
}

/**
 * Checks if seed data exists in localStorage. If not, fetches and loads it.
 */
async function initializeSeedData() {
    if (localStorage.getItem(KEY) === null || localStorage.getItem(KEY) === '[]') {
        console.log('No data found in localStorage. Loading seed data...');
        try {
            const response = await fetch('seed.json');
            if (response.ok === false) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            
            const seedData = await response.json();
            const now = new Date().toISOString();
            const processedSeedData = [];
            
            // Loop through seed data to make sure timestamps are filled
            for (let i = 0; i < seedData.length; i++) {
                const book = seedData[i];
                
                let createdAtValue = now;
                if (book.createdAt !== undefined && book.createdAt !== null) {
                    createdAtValue = book.createdAt;
                }
                
                let updatedAtValue = now;
                if (book.updatedAt !== undefined && book.updatedAt !== null) {
                    updatedAtValue = book.updatedAt;
                }

                // Building the new book structure item manually
                const newBookItem = {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    pages: book.pages,
                    tag: book.tag,
                    dateAdded: book.dateAdded,
                    createdAt: createdAtValue,
                    updatedAt: updatedAtValue
                };
                processedSeedData.push(newBookItem);
            }
            
            save(processedSeedData);
            console.log('Seed data loaded successfully.');

            // Notify other scripts that data has been seeded
            window.dispatchEvent(new CustomEvent('data-seeded'));
        } catch (error) {
            console.error('Failed to load seed data:', error);
        }
    } else {
        console.log('Data already exists in localStorage. Skipping seed data load.');
    }
}

/**
 * Renders the dashboard components.
 */
function loadDashboardMetrics() {
    const latestContainer = document.getElementById('latest_books');
    if (latestContainer === null) {
        return; // Only run if on the dashboard page
    }

    const books = load();

    // Getting counter elements from HTML
    const totalBooksEl = document.getElementById('total-books');
    const totalAuthorsEl = document.getElementById('total-authors');
    const totalTagsEl = document.getElementById('total-tags');
    const totalPagesReadEl = document.getElementById('total-pages-read');
    
    // Set total books count
    if (totalBooksEl !== null) {
        totalBooksEl.textContent = books.length;
    }
    
    // Loop to calculate unique authors manually
    if (totalAuthorsEl !== null) {
        const uniqueAuthorsList = [];
        for (let i = 0; i < books.length; i++) {
            if (books[i].author) {
                const cleanAuthor = books[i].author.trim();
                if (cleanAuthor !== '' && uniqueAuthorsList.indexOf(cleanAuthor) === -1) {
                    uniqueAuthorsList.push(cleanAuthor);
                }
            }
        }
        totalAuthorsEl.textContent = uniqueAuthorsList.length;
    }
    
    // Loop to calculate sum of pages manually
    if (totalPagesReadEl !== null) {
        let totalPagesSum = 0;
        for (let i = 0; i < books.length; i++) {
            const pageNum = parseInt(books[i].pages, 10);
            if (isNaN(pageNum) === false) {
                totalPagesSum = totalPagesSum + pageNum;
            }
        }
        totalPagesReadEl.textContent = totalPagesSum;
    }
    
    // Loop to split tags and find unique counts manually
    if (totalTagsEl !== null) {
        const uniqueTagsList = [];
        for (let i = 0; i < books.length; i++) {
            if (books[i].tag) {
                const splitTags = books[i].tag.split(',');
                for (let j = 0; j < splitTags.length; j++) {
                    const cleanTag = splitTags[j].trim();
                    if (cleanTag !== '' && uniqueTagsList.indexOf(cleanTag) === -1) {
                        uniqueTagsList.push(cleanTag);
                    }
                }
            }
        }
        totalTagsEl.textContent = uniqueTagsList.length;
    }

    // Cloning books array manually to sort without altering original data
    const booksCloneForSorting = [];
    for (let i = 0; i < books.length; i++) {
        booksCloneForSorting.push(books[i]);
    }

    // Standard bubble sort or sort function to order by date updated descending
    booksCloneForSorting.sort(function (a, b) {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB - dateA;
    });

    // Take only up to 5 items manually
    const latestFiveBooks = [];
    for (let i = 0; i < booksCloneForSorting.length; i++) {
        if (i < 5) {
            latestFiveBooks.push(booksCloneForSorting[i]);
        } else {
            break; // Stop loop once we have 5 items
        }
    }

    // Build HTML block string via loop
    let finalHtmlString = '';
    if (latestFiveBooks.length > 0) {
        for (let i = 0; i < latestFiveBooks.length; i++) {
            const b = latestFiveBooks[i];
            
            // Generate tag badge strings manually
            let tagsHtml = '';
            if (b.tag) {
                const singleTags = b.tag.split(',');
                for (let j = 0; j < singleTags.length; j++) {
                    tagsHtml = tagsHtml + '<span class="tag-badge">' + singleTags[j].trim() + '</span>';
                }
            }

            let formattedDate = 'N/A';
            if (b.dateAdded) {
                formattedDate = new Date(b.dateAdded).toLocaleDateString();
            }

            // Append record card into string template variable
            finalHtmlString = finalHtmlString + `
            <div class="stat-card" style="margin-bottom: 10px; border-left-color: var(--primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <strong>${b.title}</strong>
                <small style="color:var(--muted)">by ${b.author}</small>
                <small style="color:var(--muted)">• ${formattedDate}</small>
                <div class="tags-container" style="margin-top: 0; margin-left: auto; display: flex; gap: 5px;">${tagsHtml}</div>
            </div>`;
        }
    } else {
        finalHtmlString = '<p>No books added yet.</p>';
    }

    latestContainer.innerHTML = finalHtmlString;
}

/**
 * Main initialization running right after the page has loaded.
 */
document.addEventListener('DOMContentLoaded', async function () {
    await initializeSeedData();
    loadDashboardMetrics();
});