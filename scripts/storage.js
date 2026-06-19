/**
 *  this javascript file handle the access to local storage to retrieve, update or add new records
 * the data is stored as a dictionary 
 * Sample
 * [
  {
    "id": "book_0001",
    "title": "How to Code - Intro for firsttimers",
    "author": "Joshua Mulongo",
    "pages": 23,
    "tag": "firsttimercoder,newbieDev",
    "dateAdded": "2026-06-17",
    "updatedAt": "2026-06-18T15:18:23.887Z"
  },
  {
    "id": "book_0002",
    "title": "How to Understand Women",
    "author": "Broke Guy",
    "pages": 1,
    "tag": "Humor,Relationships",
    "dateAdded": "2026-06-17",
    "updatedAt": "2026-06-18T15:18:23.887Z"
}]
 */

export const KEY = 'app:data';

/**
 * Loads and parses the current list of items from localStorage.
 * Defaults to an empty array if no data exists.
 * @returns {Array}
 */
export function load() {
    const rawData = localStorage.getItem(KEY);
    if (rawData === null || rawData === undefined || rawData === '') {
        return []; // return an empty list if nothing is stored yet
    }
    return JSON.parse(rawData);
}

/**
 * Loads a specific setting from localStorage.
 * @param {string} settingKey - The key for the setting.
 * @param {*} defaultValue - The default value if the setting is not found.
 * @returns {*} The setting value or default.
 */
export function loadSetting(settingKey, defaultValue) {
    const value = localStorage.getItem('app:settings:' + settingKey);
    if (value !== null) {
        return JSON.parse(value);
    } else {
        return defaultValue; // send back default if key doesn't exist
    }
}

/**
 * Saves a specific setting to localStorage.
 * @param {string} settingKey - The key for the setting.
 * @param {*} value - The value to save.
 */
export function saveSetting(settingKey, value) {
    localStorage.setItem('app:settings:' + settingKey, JSON.stringify(value));
}

/**
 * Serializes and writes data to localStorage.
 * @param {Array} data - The complete updated array of books.
 */
export function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

/**
 * Deletes a record from localStorage by its ID.
 * @param {string} id - The ID of the record to delete.
 * @returns {boolean} True if the record was found and deleted, false otherwise.
 */
export function deleteRecord(id) {
    const books = load();
    const initialLength = books.length;
    const remainingBooks = [];

    // Use a standard loop instead of filter to remove the matching record
    for (let i = 0; i < books.length; i++) {
        if (books[i].id !== id) {
            remainingBooks.push(books[i]);
        }
    }

    save(remainingBooks);

    // If the remaining list length is smaller, it means we found and dropped an item
    if (remainingBooks.length < initialLength) {
        return true;
    } else {
        return false;
    }
}

/**
 * Business logic wrapper to handle id assignment and appending records.
 * @param {Object} bookData - Raw input fields from the UI form.
 * @returns {Object} The saved book record.
 */
export function addInitialBookRecord(bookData) {
    // Load existing array list using your schema guide
    const books = load();

    let existingIndex = -1;

    // Priority 1: Match by ID (for explicit edits)
    if (bookData.id) {
        for (let i = 0; i < books.length; i++) {
            if (books[i].id === bookData.id) {
                existingIndex = i;
                break; // found it, exit loop
            }
        }
    }

    // Priority 2: Match by title AND author (composite key duplicate prevention)
    if (existingIndex === -1) {
        for (let i = 0; i < books.length; i++) {
            const currentTitle = books[i].title.trim().toLowerCase();
            const currentAuthor = books[i].author.trim().toLowerCase();
            const targetTitle = bookData.title.trim().toLowerCase();
            const targetAuthor = bookData.author.trim().toLowerCase();

            if (currentTitle === targetTitle && currentAuthor === targetAuthor) {
                existingIndex = i;
                break; // found duplication, exit loop
            }
        }
    }

    const timestamp = new Date().toISOString();

    // If matching item was found, update it
    if (existingIndex > -1) {
        const oldBook = books[existingIndex];
        
        // Build the updated object property by property without using ... spread rules
        const updatedBook = {
            id: oldBook.id,
            title: bookData.title,
            author: bookData.author,
            pages: parseInt(bookData.pages, 10),
            tag: bookData.tag,
            dateAdded: bookData.dateAdded,
            createdAt: oldBook.createdAt || timestamp, // keep old creation date if present
            updatedAt: timestamp
        };
        
        books[existingIndex] = updatedBook;
        save(books);
        return { record: updatedBook, wasUpdated: true };
    }

    // ID Generation: e.g., book_0001
    let maxIdNum = 0;
    if (books.length > 0) {
        // Basic loops instead of Math.max(...array.map()) expressions
        for (let i = 0; i < books.length; i++) {
            const rawNumericPart = books[i].id.replace('book_', '');
            const parsedNum = parseInt(rawNumericPart, 10);
            if (isNaN(parsedNum) === false) {
                if (parsedNum > maxIdNum) {
                    maxIdNum = parsedNum;
                }
            }
        }
    }
    
    const nextIdNumber = maxIdNum + 1;
    const newId = 'book_' + String(nextIdNumber).padStart(4, '0');

    // Create a fresh book record literal structure maps
    const newBook = {
        id: newId,
        title: bookData.title,
        author: bookData.author,
        pages: parseInt(bookData.pages, 10),
        tag: bookData.tag,
        dateAdded: bookData.dateAdded,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    // Append new item into array tracking lists
    books.push(newBook);

    // Save the fully compiled array back using the guideline function
    save(books);

    return { record: newBook, wasUpdated: false };
}