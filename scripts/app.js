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