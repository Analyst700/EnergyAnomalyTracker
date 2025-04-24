document.addEventListener('DOMContentLoaded', function() {
    // Handle theme toggle
    const darkModeToggle = document.getElementById('dark_mode');
    if (darkModeToggle) {
        // Set initial state based on localStorage
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
        
        // Add event listener
        darkModeToggle.addEventListener('change', function() {
            toggleDarkMode(this.checked);
        });
    }
    
    // Handle anomaly threshold slider
    const thresholdSlider = document.getElementById('anomaly_threshold');
    const thresholdValue = document.getElementById('thresholdValue');
    
    if (thresholdSlider && thresholdValue) {
        // Set initial value
        thresholdValue.textContent = thresholdSlider.value;
        
        // Update when slider changes
        thresholdSlider.addEventListener('input', function() {
            thresholdValue.textContent = this.value;
        });
    }
    
    // Handle notification setting
    const notificationToggle = document.getElementById('notification_enabled');
    if (notificationToggle) {
        notificationToggle.addEventListener('change', function() {
            if (this.checked) {
                // Request notification permission
                requestNotificationPermission();
            }
        });
    }
});

// Function to toggle dark mode
function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// Function to request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
                if (permission !== 'granted') {
                    // If permission is denied, uncheck the toggle
                    const notificationToggle = document.getElementById('notification_enabled');
                    if (notificationToggle) {
                        notificationToggle.checked = false;
                    }
                    
                    // Show warning
                    showPermissionWarning();
                }
            });
        } else if (Notification.permission === 'denied') {
            // Show warning that permissions are blocked
            showPermissionWarning();
        }
    } else {
        // Notifications not supported
        showNotSupportedWarning();
    }
}

// Function to show permission warning
function showPermissionWarning() {
    const warningContainer = document.createElement('div');
    warningContainer.className = 'alert alert-warning alert-dismissible fade show mt-3';
    warningContainer.innerHTML = `
        <strong>Notification Permission Required</strong> 
        Please enable notifications in your browser settings to receive alerts.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find settings form and append warning after it
    const settingsForm = document.querySelector('form');
    if (settingsForm) {
        settingsForm.after(warningContainer);
    }
}

// Function to show not supported warning
function showNotSupportedWarning() {
    const warningContainer = document.createElement('div');
    warningContainer.className = 'alert alert-info alert-dismissible fade show mt-3';
    warningContainer.innerHTML = `
        <strong>Notifications Not Supported</strong> 
        Your browser does not support the notification API.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find settings form and append warning after it
    const settingsForm = document.querySelector('form');
    if (settingsForm) {
        settingsForm.after(warningContainer);
    }
}
