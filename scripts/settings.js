/**
 * settings.js
 * script handling import of bulk book records via JSON file
 */

import { load, save, addInitialBookRecord, loadSetting, saveSetting } from './storage.js';
import { showMessage } from './app.js';

// Wait for the DOM structure elements to load fully before running
document.addEventListener('DOMContentLoaded', function () { 
    const exportBtn = document.getElementById('settings-export-btn');

    // --- Export All Records Logic ---
    if (exportBtn !== null && exportBtn !== undefined) {
        exportBtn.addEventListener('click', function () {
            const allRecords = load(); // Load array from storage utility
            
            // If there is nothing inside the data list array, show warning notice
            if (allRecords.length === 0) {
                showMessage('No records to export.', 'info', 'message-container');
                return;
            }
            
            const now = new Date();
            
            // Build the date-time code parts step by step using old string additions
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const date = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const timestamp = year + month + date + '_' + hours + minutes + seconds;
            const filename = 'books_vault_all_records_' + timestamp + '.json';
            
            // Create data path address string manually
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allRecords, null, 2));
            
            // Create a temporary link element link node to trick browser into starting downloading
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", filename);
            document.body.appendChild(downloadAnchorNode);
            
            downloadAnchorNode.click(); // force trigger click action
            downloadAnchorNode.remove(); // clear it from page document tree immediately
            
            showMessage('All records exported successfully!', 'success', 'message-container');
        });
    }
});