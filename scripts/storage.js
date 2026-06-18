/**
 * Summary: Persistent state storage utility utilizing the assignment's data guidelines.
 * Updated: 2026-06-18
 */

const KEY = 'app:data';

/**
 * Loads and parses the current list of items from localStorage.
 * Defaults to an empty array if no data exists.
 * @returns {Array}
 */
export const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');

/**
 * Serializes and writes data to localStorage.
 * @param {Array} data - The complete updated array of books.
 */
export const save = data => localStorage.setItem(KEY, JSON.stringify(data));

/**
 * Business logic wrapper to handle id assignment and appending records.
 * @param {Object} bookData - Raw input fields from the UI form.
 * @returns {Object} The saved book record.
 */
export const addInitialBookRecord = (bookData) => {
    // Load existing array list using your schema guide
    const books = load();

    let existingIndex = -1;

    // Priority 1: Match by ID (for explicit edits)
    if (bookData.id) {
        existingIndex = books.findIndex(b => b.id === bookData.id);
    }

    // Priority 2: Match by title (duplicate prevention / implicit updates)
    if (existingIndex === -1) {
        existingIndex = books.findIndex(b => 
            b.title.trim().toLowerCase() === bookData.title.trim().toLowerCase()
        );
    }

    if (existingIndex > -1) {
        const updatedBook = {
            ...books[existingIndex],
            title: bookData.title,
            author: bookData.author,
            pages: parseInt(bookData.pages, 10),
            tag: bookData.tag,
            dateAdded: bookData.dateAdded,
            updatedAt: new Date().toISOString()
        };
        books[existingIndex] = updatedBook;
        save(books);
        return { record: updatedBook, wasUpdated: true };
    }

    // ID Generation: e.g., rec_0001
    const nextIdNumber = books.length > 0 
        ? Math.max(...books.map(b => parseInt(b.id.replace('rec_', ''), 10))) + 1 
        : 1;
    const newId = `rec_${String(nextIdNumber).padStart(4, '0')}`;

    const newBook = {
        id: newId,
        title: bookData.title,
        author: bookData.author,
        pages: parseInt(bookData.pages, 10),
        tag: bookData.tag,
        dateAdded: bookData.dateAdded,
        updatedAt: new Date().toISOString()
    };

    // Append new item to the array
    books.push(newBook);

    // Save the fully compiled array back using the guideline function
    save(books);

    return { record: newBook, wasUpdated: false };
};