/**
 * add_book.js
 * Summary: UI Controller for the Add Book form, containing frontend validation and storage invocation.
 * Updated: 2026-06-18
 */

// CRITICAL: Import the storage function from your module file
import { addInitialBookRecord, load } from './storage.js';
import { showMessage } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('book-form');
    const importInput = document.getElementById('import-json');
    
    // Form Input Elements
    const fields = {
        id: document.getElementById('record-id'),
        title: document.getElementById('title'),
        author: document.getElementById('author'),
        pages: document.getElementById('pages'),
        tag: document.getElementById('tag'),
        dateAdded: document.getElementById('date-added')
    };

    // Validation Regex Patterns
    const patterns = {
        text: /^\S(?:.*\S)?$/, // Forbid leading/trailing spaces & collapse doubles
        numeric: /^(0|[1-9]\d*)(\.\d{1,2})?$/, // Match positive integers/decimals
        date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, // YYYY-MM-DD
        tag: /^[A-Za-z-]+(?:,[A-Za-z-]+)*$/, // Letters, hyphens, comma-separated (no spaces)
        duplicateCheck: /\b(\w+)\s+\1\b/i // Advanced look: Catch duplicate words (case-insensitive)
    };

    // Handle Edit Mode from URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    const loadBookForEditing = () => {
        if (!editId) return;
        
        const books = load();
        const bookToEdit = books.find(b => b.id === editId);

        if (bookToEdit) {
            fields.id.value = bookToEdit.id;
            fields.title.value = bookToEdit.title;
            fields.author.value = bookToEdit.author;
            fields.pages.value = bookToEdit.pages;
            fields.tag.value = bookToEdit.tag;
            fields.dateAdded.value = bookToEdit.dateAdded;

            // Update UI for Edit Mode
            document.querySelector('h2').textContent = 'Edit Book';
            document.getElementById('save-btn').textContent = 'Update Book';
        }
    };

    loadBookForEditing();

    // Re-check for edit data if it was seeded after the script ran
    window.addEventListener('data-seeded', () => {
        if (editId && !fields.id.value) {
            loadBookForEditing();
        }
    });

    // Error message helpers
    const clearErrors = () => {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    };

    const setError = (fieldId, message) => {
        document.getElementById(`${fieldId}-error`).textContent = message;
    };

    /**
     * Runs schema and rule validation on form fields.
     * @returns {boolean} True if the form is fully valid.
     */
    const validateForm = () => {
        clearErrors();
        let isValid = true;

        // 1. Validate Title
        const titleVal = fields.title.value.trim();
        if (!patterns.text.test(titleVal)) {
            setError('title', 'Title cannot be empty or have leading/trailing spaces. Example: "Atomic Habits".');
            isValid = false;
        } else if (patterns.duplicateCheck.test(titleVal)) {
            setError('title', 'Title contains consecutive duplicate words. Expected distinct words (e.g., avoid "The The").');
            isValid = false;
        }

        // 2. Validate Author
        const authorVal = fields.author.value.trim();
        if (!patterns.text.test(authorVal)) {
            setError('author', 'Author name is invalid. Expected format: "James Clear".');
            isValid = false;
        }

        // 3. Validate Pages
        if (!patterns.numeric.test(fields.pages.value)) {
            setError('pages', 'Please enter a valid number of pages. Expected: positive integer (e.g., 320).');
            isValid = false;
        }

        // 4. Validate Tag
        if (!patterns.tag.test(fields.tag.value.trim())) {
            setError('tag', 'Tags must be letters or hyphens, separated by commas without spaces. Example: "Self-Help,Habits".');
            isValid = false;
        }

        // 5. Validate Date
        if (!patterns.date.test(fields.dateAdded.value)) {
            setError('date', 'Please choose a valid date. Expected format: YYYY-MM-DD (e.g., 2026-06-18).');
            isValid = false;
        }

        return isValid;
    };

    // Handle Form Submit Event
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('Please fix the errors in the form before saving.', 'error', 'message-container');
            return;
        }

        // Gather clean payload
        const bookPayload = {
            id: fields.id.value || null,
            title: fields.title.value.trim(),
            author: fields.author.value.trim(),
            pages: fields.pages.value,
            tag: fields.tag.value.trim(),
            dateAdded: fields.dateAdded.value
        };

        try {
            // FIX: Use the imported function name from your guidelines wrapper
            const { record, wasUpdated } = addInitialBookRecord(bookPayload);
            
            // Provide specific status message based on whether it was an update or addition
            const statusMsg = wasUpdated 
                ? `Updated existing record: "${record.title}".` 
                : `"${record.title}" successfully added to your library!`;

            showMessage(statusMsg, 'success', 'message-container');
            form.reset();
            if (fields.id) fields.id.value = ''; 
            // Redirect to records.html after a short delay on successful update
            if (wasUpdated) {
                setTimeout(() => window.location.href = 'records.html', 2000);
            }
        } catch (error) {
            // Fail-safe handling
            showMessage('Failure: An error occurred while trying to save the book.', 'error', 'message-container');
        }
    });

    // Handle Bulk Import
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Enforce .json only type requirement
        if (!file.name.toLowerCase().endsWith('.json')) {
            showMessage('Invalid file type. Only .json files are allowed.', 'error', 'message-container');
            importInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const booksArray = Array.isArray(data) ? data : [data];
                
                let added = 0;
                let updated = 0;

                booksArray.forEach(book => {
                    const result = addInitialBookRecord(book);
                    if (result.wasUpdated) updated++;
                    else added++;
                });

                showMessage(`Import successful: ${added} added, ${updated} updated.`, 'success', 'message-container');
            } catch (err) {
                showMessage('Failed to parse JSON. Ensure the file format is correct.', 'error', 'message-container');
            }
            importInput.value = ''; // Reset input to allow re-uploading same file
        };
        reader.readAsText(file);
    }); 
});