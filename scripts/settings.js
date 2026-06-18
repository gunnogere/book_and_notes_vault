/**
 * settings.js
 * Summary: UI Controller for the Settings page, handling settings persistence and bulk import/export.
 * Updated: 2026-06-18
 */

import { load, save, addInitialBookRecord, loadSetting, saveSetting } from './storage.js';
import { showMessage } from './app.js';

document.addEventListener('DOMContentLoaded', () => { 
    const exportBtn = document.getElementById('settings-export-btn');

 
 

    // --- Export All Records Logic (Moved from add_book.js, adapted for all records) ---
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const allRecords = load();
            if (allRecords.length === 0) {
                showMessage('No records to export.', 'info', 'message-container');
                return;
            }
            const now = new Date();
            const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            const filename = `books_vault_all_records_${timestamp}.json`;
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allRecords, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", filename);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            showMessage('All records exported successfully!', 'success', 'message-container');
        });
    }
});