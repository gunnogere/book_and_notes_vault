/**
 * records.js
 * Logic for showing, searching, sorting, deleting, and exporting books
 */

import { load, deleteRecord } from './storage.js';
import { showMessage } from './app.js';

// Wait for the window DOM items to finish loading up
document.addEventListener('DOMContentLoaded', function () {
    
    // Grabbing all elements needed from the HTML page
    const tableBody = document.getElementById('records-table-body');
    const cardsContainer = document.getElementById('records-cards');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('regex-search');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('sort-select');
    const feedback = document.getElementById('regex-feedback');
    const exportBtn = document.getElementById('export-results-btn');

    let allRecords = load(); // Load array from storage file
    
    // Clone all records into the filtered list manually at the beginning
    let filteredRecords = [];
    for (let i = 0; i < allRecords.length; i++) {
        filteredRecords.push(allRecords[i]);
    }

    /**
     * Escapes HTML special characters to prevent script injection (XSS).
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Highlights text based on regex match.
     */
    function highlight(text, regex) {
        const safeText = escapeHTML(text);
        if (regex === null || regex === undefined || safeText === '') {
            return safeText;
        }
        
        // Use standard string replace with a callback to add mark tag wraps
        return safeText.replace(regex, function (match) {
            return '<mark>' + match + '</mark>';
        });
    }

    /**
     * Renders records to both table and mobile cards layouts.
     */
    function render(regex = null) {
        // Clear old things inside containers before drawing new ones
        tableBody.innerHTML = '';
        cardsContainer.innerHTML = '';

        // If list is empty, show empty notice and stop
        if (filteredRecords.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Loop through filtered list items one by one
        for (let i = 0; i < filteredRecords.length; i++) {
            const book = filteredRecords[i];
            
            // Apply highlighting rule matching
            const displayTitle = highlight(book.title, regex);
            const displayAuthor = highlight(book.author, regex);
            
            // Splitting and drawing tag spans manually via a basic loop
            let tagsHtml = '';
            if (book.tag) {
                const singleTags = book.tag.split(',');
                for (let j = 0; j < singleTags.length; j++) {
                    const cleanT = highlight(singleTags[j].trim(), regex);
                    tagsHtml = tagsHtml + '<span class="tag-badge">' + cleanT + '</span>';
                }
            }

            // Create table row item element manually
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${displayTitle}</td>
                <td>${displayAuthor}</td>
                <td>${book.pages}</td>
                <td><div class="tags-container">${tagsHtml}</div></td>
                <td>${book.dateAdded}</td>
                <td>
                    <button class="btn-small" onclick="window.location.href='add_book.html?edit=${book.id}'">Edit</button>
                    <button id="btn_delete" class="btn-small btn-delete" data-id="${book.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);

            // Create mobile card wrapper item element manually
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
                    <button class="btn-delete" data-id="${book.id}">Delete</button>
                </div>
            `;
            cardsContainer.appendChild(card);
        }
    }

    /**
     * Handles sorting logic.
     */
    function handleSort() {
        const valueSplit = sortSelect.value.split('-');
        const criteria = valueSplit[0];
        const direction = valueSplit[1];

        // Traditional javascript sorting compare logic
        filteredRecords.sort(function (a, b) {
            let valA = a[criteria];
            let valB = b[criteria];

            if (criteria === 'pages') {
                valA = parseInt(valA, 10);
                valB = parseInt(valB, 10);
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA === valB) {
                return 0;
            }
            
            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else {
                comparison = -1;
            }
            
            if (direction === 'asc') {
                return comparison;
            } else {
                return -comparison; // Reverse order for descending
            }
        });
        
        render(); // redraw list elements
    }

    /**
     * Handles Regex Search logic.
     */
    function handleSearch() {
        const query = searchInput.value.trim();
        feedback.textContent = '';
        
        // If query box is empty, load back all values
        if (query === '') {
            filteredRecords = [];
            for (let i = 0; i < allRecords.length; i++) {
                filteredRecords.push(allRecords[i]);
            }
            handleSort();
            return;
        }

        try {
            const regex = new RegExp(query, 'gi');
            
            // Clear current list and build filtered records using a basic loop
            filteredRecords = [];
            for (let i = 0; i < allRecords.length; i++) {
                const book = allRecords[i];
                
                // Perform regex match testing on fields
                const matchTitle = regex.test(book.title);
                const matchAuthor = regex.test(book.author);
                
                let matchTag = false;
                if (book.tag) {
                    matchTag = regex.test(book.tag);
                }

                if (matchTitle === true || matchAuthor === true || matchTag === true) {
                    filteredRecords.push(book);
                }
            }
            
            render(regex);
        } catch (e) {
            // If regex has formatting error, catch it here
            feedback.textContent = 'Invalid Regular Expression';
        }
    }

    /**
     * Handles the deletion of a record.
     */
    function handleDelete(id) {
        if (confirm('Are you sure you want to delete this book record?') === true) {
            deleteRecord(id);
            
            allRecords = load(); // reload latest data list arrays
            
            // Re-apply search patterns and refresh layout views
            handleSearch(); 
            showMessage('Book record deleted successfully!', 'success', 'message-container');
        } else {
            showMessage('Deletion cancelled.', 'info', 'message-container');
        }
    }

    // Checking clicks anywhere on page to catch delete buttons (Event Delegation)
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-delete') === true) {
            const id = e.target.dataset.id;
            if (id !== undefined && id !== null) {
                handleDelete(id);
            }
        }
    });

    /**
     * Exports only the filtered results as a JSON file downloaded to the user's device
     */
    function handleExport() {
        if (filteredRecords.length === 0) {
            return; // do nothing if no rows are shown
        }
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
        const now = new Date();
        
        // Building custom file timestamp string chunk by chunk
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const timestamp = year + month + date + '_' + hours + minutes + seconds;
        const filename = 'books_vault_export_by_joshua_' + timestamp + '.json';
        
        // Creating fake click download element trigger
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode);
        
        downloadAnchorNode.click(); // simulate click
        downloadAnchorNode.remove(); // delete it from DOM
    }

    // Setting click listeners onto elements
    searchBtn.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        feedback.textContent = '';
        
        // Copy back records manually on clear action click
        filteredRecords = [];
        for (let i = 0; i < allRecords.length; i++) {
            filteredRecords.push(allRecords[i]);
        }
        handleSort();
    });

    sortSelect.addEventListener('change', handleSort);
    exportBtn.addEventListener('click', handleExport);

    // Run sort layout generation routine at start
    handleSort();

    // Look for data seeding completed event announcements
    window.addEventListener('data-seeded', function () {
        console.log('Data seeded, refreshing records table...');
        allRecords = load();
        
        filteredRecords = [];
        for (let i = 0; i < allRecords.length; i++) {
            filteredRecords.push(allRecords[i]);
        }
        handleSort();
    });
});