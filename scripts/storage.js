/**
 * Summary: Persistent state storage utility utilizing the assignment's data guidelines.
 * Updated: 2026-06-18
 */

export const KEY = 'app:data';

/**
 * Loads and parses the current list of items from localStorage.
 * Defaults to an empty array if no data exists.
 * @returns {Array}
 */
export const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');

/**
 * Loads a specific setting from localStorage.
 * @param {string} settingKey - The key for the setting.
 * @param {*} defaultValue - The default value if the setting is not found.
 * @returns {*} The setting value or default.
 */
export const loadSetting = (settingKey, defaultValue) => {
    const value = localStorage.getItem(`app:settings:${settingKey}`);
    return value !== null ? JSON.parse(value) : defaultValue;
};

/**
 * Saves a specific setting to localStorage.
 * @param {string} settingKey - The key for the setting.
 * @param {*} value - The value to save.
 */
export const saveSetting = (settingKey, value) => localStorage.setItem(`app:settings:${settingKey}`, JSON.stringify(value));

/**
 * Serializes and writes data to localStorage.
 * @param {Array} data - The complete updated array of books.
 */
export const save = data => localStorage.setItem(KEY, JSON.stringify(data));

/**
 * Deletes a record from localStorage by its ID.
 * @param {string} id - The ID of the record to delete.
 * @returns {boolean} True if the record was found and deleted, false otherwise.
 */
export const deleteRecord = (id) => {
    let books = load();
    const initialLength = books.length;
    books = books.filter(book => book.id !== id);
    save(books);
    return books.length < initialLength; // Returns true if a record was removed
};

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

    // ID Generation: e.g., book_0001
    const nextIdNumber = books.length > 0 
        ? Math.max(...books.map(b => parseInt(b.id.replace('book_', ''), 10))) + 1 
        : 1;
    const newId = `book_${String(nextIdNumber).padStart(4, '0')}`;

    const newBook = {
        id: newId,
        title: bookData.title,
        author: bookData.author,
        pages: parseInt(bookData.pages, 10),
        tag: bookData.tag,
        dateAdded: bookData.dateAdded,
        createdAt: new Date().toISOString(), // Add createdAt for new records
        updatedAt: new Date().toISOString()
    };

    // Append new item to the array
    books.push(newBook);

    // Save the fully compiled array back using the guideline function
    save(books);

    return { record: newBook, wasUpdated: false };
};