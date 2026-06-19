
/**
 * add_book.js
 * logic for addding a book (one-by-one and bulk import from json file)
 */

// Import functions from other files
import { addInitialBookRecord, load } from './storage.js';
import { showMessage } from './app.js';

// Wait for the window to load completely before running the code
document.addEventListener('DOMContentLoaded', function () {
    
    // Getting form elements from HTML by their IDs
    const form = document.getElementById('book-form');
    const importInput = document.getElementById('import-json');
    const bulkImportButton = document.getElementById('bulk-process-btn');
    
    // TAB SWITCHING LOGIC FOR THE PAGES
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    // Loop through all tabs to add click listeners
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () {
            const target = tabs[i].dataset.tab;
            
            // Loop again to reset all buttons back to normal styling
            for (let j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
                tabs[j].style.borderBottom = 'none';
                tabs[j].style.fontWeight = 'normal';
                tabs[j].style.color = 'var(--muted)';
            }
            
            // Apply styles to the one clicked
            tabs[i].classList.add('active');
            tabs[i].style.borderBottom = '2px solid var(--primary)';
            tabs[i].style.fontWeight = 'bold';
            tabs[i].style.color = 'var(--text)';

            // Hide all the panes first
            for (let k = 0; k < panes.length; k++) {
                panes[k].style.display = 'none';
            }
            // Show the current active pane
            document.getElementById(target + '-pane').style.display = 'block';
        });
    }
    
    // Getting input elements individually because it is simpler to understand
    const idInput = document.getElementById('record-id');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const pagesInput = document.getElementById('pages');
    const tagInput = document.getElementById('tag');
    const dateAddedInput = document.getElementById('date-added');

    // Regex verification patterns copied from assignment instructions
    const textPattern = /^\S(?:.*\S)?$/; // no space at start/end
    const numericPattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/; // numbers only
    const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // YYYY-MM-DD
    const tagPattern = /^[A-Za-z-]+(?:,[A-Za-z-]+)*$/; // tags separated by comma
    const duplicateWordPattern = /\b(\w+)\s+\1\b/i; // checks if word repeated twice

    // URL parameter reading for editing existing books
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    // Function to load the book data into inputs if we are in edit mode
    function loadBookForEditing() {
        if (editId === null || editId === '') {
            return; // stop here if we are not editing
        }
        
        const books = load(); // load array list from storage.js
        let bookToEdit = null;

        // Simple loop to find the book that matches our edit ID
        for (let i = 0; i < books.length; i++) {
            if (books[i].id === editId) {
                bookToEdit = books[i];
                break; // found it, stop looping
            }
        }

        // Put the data back into the form fields
        if (bookToEdit !== null) {
            idInput.value = bookToEdit.id;
            titleInput.value = bookToEdit.title;
            authorInput.value = bookToEdit.author;
            pagesInput.value = bookToEdit.pages;
            tagInput.value = bookToEdit.tag;
            dateAddedInput.value = bookToEdit.dateAdded;

            // Change form titles to show we are editing
            document.querySelector('h2').textContent = 'Edit Book';
            document.getElementById('save-btn').textContent = 'Update Book';
        }
    }

    // Call the edit function immediately
    loadBookForEditing();

    // Event listener for data seeding updates
    window.addEventListener('data-seeded', function () {
        if (editId && !idInput.value) {
            loadBookForEditing();
        }
    });

    // Function to clear all error text messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        for (let i = 0; i < errorElements.length; i++) {
            errorElements[i].textContent = '';
        }
    }

    // Function to set error message on a specific element
    function setError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + '-error');
        errorElement.textContent = message;
    }

    // Validation function to check all inputs are correct before sending
    function validateForm() {
        clearErrors();
        let isValid = true;

        // 1. Check Title
        const titleVal = titleInput.value.trim();
        if (textPattern.test(titleVal) === false) {
            setError('title', 'Title cannot be empty or have leading/trailing spaces. Example: "Atomic Habits".');
            isValid = false;
        } else if (duplicateWordPattern.test(titleVal) === true) {
            setError('title', 'Title contains consecutive duplicate words. Expected distinct words (e.g., avoid "The The").');
            isValid = false;
        }

        // 2. Check Author
        const authorVal = authorInput.value.trim();
        if (textPattern.test(authorVal) === false) {
            setError('author', 'Author name is invalid. Expected format: "James Clear".');
            isValid = false;
        }

        // 3. Check Pages
        if (numericPattern.test(pagesInput.value) === false) {
            setError('pages', 'Please enter a valid number of pages. Expected: positive integer (e.g., 320).');
            isValid = false;
        }

        // 4. Check Tag
        if (tagPattern.test(tagInput.value.trim()) === false) {
            setError('tag', 'Tags must be letters or hyphens, separated by commas without spaces. Example: "Self-Help,Habits".');
            isValid = false;
        }

        // 5. Check Date
        if (datePattern.test(dateAddedInput.value) === false) {
            setError('date', 'Please choose a valid date. Expected format: YYYY-MM-DD (e.g., 2026-06-18).');
            isValid = false;
        }

        return isValid; // returns true if everything passed
    }

    // When the user clicks Save Book button
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Stop form from refreshing the web page

        // If validation fails, show error message container and stop
        if (validateForm() === false) {
            showMessage('Please fix the errors in the form before saving.', 'error', 'message-container');
            return;
        }

        // Creating the payload data object manually
        let finalRecordId = null;
        if (idInput.value !== '') {
            finalRecordId = idInput.value;
        }

        const bookPayload = {
            id: finalRecordId,
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            pages: pagesInput.value,
            tag: tagInput.value.trim(),
            dateAdded: dateAddedInput.value
        };

        try {
            // Save using our storage function module
            const result = addInitialBookRecord(bookPayload);
            const record = result.record;
            const wasUpdated = result.wasUpdated;
            
            // Check if it updated or added fresh
            let statusMsg = '';
            if (wasUpdated === true) {
                statusMsg = 'Updated existing record: "' + record.title + '".';
            } else {
                statusMsg = '"' + record.title + '" successfully added to your library!';
            }

            showMessage(statusMsg, 'success', 'message-container');
            form.reset(); // clear fields
            
            if (idInput) {
                idInput.value = ''; 
            }
            
            // If it updated, send user to records list after 2 seconds
            if (wasUpdated === true) {
                setTimeout(function () {
                    window.location.href = 'records.html';
                }, 2000);
            }
        } catch (error) {
            // Catching system error if saving crashes
            showMessage('Failure: An error occurred while trying to save the book.', 'error', 'message-container');
        }
    });

    // Bulk JSON Import Function block
    function processBulkFile(file) {
        if (!file) {
            showMessage('Please select a JSON file first.', 'info', 'message-container');
            return;
        }

        // Check if file extension is actually .json
        if (file.name.toLowerCase().endsWith('.json') === false) {
            showMessage('Invalid file type. Only .json files are allowed.', 'error', 'message-container');
            importInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                
                // If it is not an array, turn it into an array list of one item
                let booksArray = [];
                if (Array.isArray(data) === true) {
                    booksArray = data;
                } else {
                    booksArray.push(data);
                }
                
                let added = 0;
                let updated = 0;

                // Loop through the imported items to pass to storage
                for (let i = 0; i < booksArray.length; i++) {
                    const result = addInitialBookRecord(booksArray[i]);
                    if (result.wasUpdated === true) {
                        updated = updated + 1;
                    } else {
                        added = added + 1;
                    }
                }

                showMessage('Import successful: ' + added + ' added, ' + updated + ' updated.', 'success', 'message-container');
            } catch (err) {
                showMessage('Failed to parse JSON. Ensure the file format is correct.', 'error', 'message-container');
            }
            importInput.value = ''; // Reset file input
        };
        reader.readAsText(file);
    }

    // Trigger file reading when bulk upload button clicked
    if (bulkImportButton) {
        bulkImportButton.addEventListener('click', function () {
            processBulkFile(importInput.files[0]);
        });
    }
});
