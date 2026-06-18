
import { load } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('records-table-body');
    const cardsContainer = document.getElementById('records-cards');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('regex-search');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('sort-select');
    const feedback = document.getElementById('regex-feedback');
    const exportBtn = document.getElementById('export-results-btn');

    let allRecords = load();
    let filteredRecords = [...allRecords];

    /**
     * Escapes HTML special characters to prevent XSS.
     */
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    /**
     * Highlights text based on regex match.
     * Note: We escape HTML first, then inject the <mark> tags safely.
     */
    const highlight = (text, regex) => {
        const safeText = escapeHTML(text);
        if (!regex || !safeText) return safeText;
        return safeText.replace(regex, (match) => `<mark>${match}</mark>`);
    };

    /**
     * Renders records to both table and mobile cards.
     */
    const render = (regex = null) => {
        tableBody.innerHTML = '';
        cardsContainer.innerHTML = '';

        if (filteredRecords.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filteredRecords.forEach(book => {
            // Use regex for highlighting
            const displayTitle = highlight(book.title, regex);
            const displayAuthor = highlight(book.author, regex);
            
            // Render tags as badges for consistency
            const tagsHtml = book.tag ? book.tag.split(',').map(t => {
                const safeT = highlight(t.trim(), regex);
                return `<span class="tag-badge">${safeT}</span>`;
            }).join('') : '';

            // Render Table Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${displayTitle}</td>
                <td>${displayAuthor}</td>
                <td>${book.pages}</td>
                <td><div class="tags-container">${tagsHtml}</div></td>
                <td>${book.dateAdded}</td>
                <td>
                    <button class="btn-small" onclick="window.location.href='add_book.html?edit=${book.id}'">Edit</button>
                </td>
            `;
            tableBody.appendChild(tr);

            // Render Mobile Card
            const card = document.createElement('div');
            card.className = 'record-card';
            card.innerHTML = `
                <h3>${displayTitle}</h3>
                <p><strong>Author:</strong> ${displayAuthor}</p>
                <p><strong>Pages:</strong> ${book.pages}</p>
                <div class="tags-container"><strong>Tags:</strong> ${tagsHtml}</div>
                <p><small>Added: ${book.dateAdded}</small></p>
                <div class="record-actions">
                    <button onclick="window.location.href='add_book.html?edit=${book.id}'">Edit</button>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    };

    /**
     * Handles sorting logic.
     */
    const handleSort = () => {
        const [criteria, direction] = sortSelect.value.split('-');
        filteredRecords.sort((a, b) => {
            let valA = a[criteria];
            let valB = b[criteria];

            if (criteria === 'pages') {
                valA = parseInt(valA);
                valB = parseInt(valB);
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA === valB) return 0;
            const comparison = valA > valB ? 1 : -1;
            return direction === 'asc' ? comparison : -comparison;
        });
        render();
    };

    /**
     * Handles Regex Search logic.
     */
    const handleSearch = () => {
        const query = searchInput.value.trim();
        feedback.textContent = '';
        
        if (!query) {
            filteredRecords = [...allRecords];
            handleSort();
            return;
        }

        try {
            const regex = new RegExp(query, 'gi');
            filteredRecords = allRecords.filter(book =>
                regex.test(book.title) || 
                regex.test(book.author) || 
                regex.test(book.tag)
            );
            render(regex);
        } catch (e) {
            feedback.textContent = 'Invalid Regular Expression';
        }
    };

    /**
     * Exports only the fliters results as a JSON file downloaded to the user's device
     */
    const handleExport = () => {
        if (filteredRecords.length === 0) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "books_vault_export_by_joshua.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove(); 
    };

    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        feedback.textContent = '';
        filteredRecords = [...allRecords];
        handleSort();
    });

    sortSelect.addEventListener('change', handleSort);

    exportBtn.addEventListener('click', handleExport);

    // Initial Load
    handleSort();
});