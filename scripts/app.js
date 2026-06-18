import { load } from './storage.js';

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '🌙'; // Set moon icon for dark mode
} else {
    themeToggle.textContent = '☀️'; // Set sun icon for light mode
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '🌙'; // Update icon to moon
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '☀️'; // Update icon to sun
    }
});


export function showMessage(message, type = 'info', id) {
    const messageContainer = document.getElementById(id || 'message-container');
    if (!messageContainer) return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageContainer.removeChild(messageElement);
    }, 3000);

}

/**
 * Initialize dashboard components by rendering stats and the latest 5 records.
 */
document.addEventListener('DOMContentLoaded', () => {
    const latestContainer = document.getElementById('latest_books');
    if (!latestContainer) return;

    const books = load();

    // Update stat counters on the index page
    const totalBooksEl = document.getElementById('total-books');
    const totalAuthorsEl = document.getElementById('total-authors');
    const totalTagsEl = document.getElementById('total-tags');
    
    if (totalBooksEl) totalBooksEl.textContent = books.length;
    if (totalAuthorsEl) {
        const uniqueAuthors = new Set(books.map(b => b.author?.trim()).filter(Boolean)).size;
        totalAuthorsEl.textContent = uniqueAuthors;
    }
    if (totalTagsEl) {
        const allTags = books.flatMap(b => b.tag ? b.tag.split(',') : []);
        const uniqueTags = new Set(allTags.map(tag => tag.trim()).filter(Boolean)).size;
        totalTagsEl.textContent = uniqueTags;
    }

    // Display only the last 5 added or updated books (sorted by updatedAt descending)
    const latestFive = [...books].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

    latestContainer.innerHTML = latestFive.length > 0
        ? latestFive.map(b => {
            const tagsHtml = b.tag ? b.tag.split(',').map(tag => `<span class="tag-badge">${tag.trim()}</span>`).join(' ') : '';
            const formattedDate = b.dateAdded ? new Date(b.dateAdded).toLocaleDateString() : 'N/A';
            return `
            <div class="stat-card" style="margin-bottom: 10px; border-left-color: var(--primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <strong>${b.title}</strong>
                <small style="color:var(--muted)">by ${b.author}</small>
                <small style="color:var(--muted)">• ${formattedDate}</small>
                <div class="tags-container" style="margin-top: 0; margin-left: auto;">${tagsHtml}</div>
            </div>`;
        }).join('')
        : '<p>No books added yet.</p>';
});
