document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    
    if (sidebarCollapse && sidebar && content) {
        sidebarCollapse.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        });
    }
    
    // Responsive behavior for sidebar on mobile
    const handleResize = () => {
        if (window.innerWidth < 992 && sidebar) {
            sidebar.classList.add('collapsed');
            if (content) content.classList.add('expanded');
        }
    };
    
    // Run on load and resize
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Initialize tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Apply theme preferences from settings
    applyThemePreferences();
    
    // Dark mode toggle in navbar
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            const isDarkMode = this.checked;
            
            // Update localStorage
            localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
            
            // Apply theme changes (will redraw charts)
            applyThemePreferences();
            
            // Update icon
            const icon = this.nextElementSibling.querySelector('i');
            if (icon) {
                icon.className = isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
            }
        });
    }
    
    // Check for notifications permission
    checkNotificationPermission();
});

// Function to apply theme preferences (light/dark mode)
function applyThemePreferences() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const prevTheme = document.body.className.match(/(?:dark|energy|alert)-mode/)?.[0] || '';
    
    // Remove all theme classes
    document.body.classList.remove('dark-mode', 'energy-mode', 'alert-mode');
    
    // Apply new theme
    if (currentTheme !== 'light') {
        document.body.classList.add(`${currentTheme}-mode`);
    }
    
    // If theme changed, redraw charts
    if (prevTheme !== `${currentTheme}-mode`) {
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // If the mode changed, we need to redraw the charts
    if (isDarkMode !== wasInDarkMode) {
        // Force reload charts by calling their initialization functions
        if (typeof createEnergyConsumptionChart === 'function') createEnergyConsumptionChart();
        if (typeof createAnomalyDistributionChart === 'function') createAnomalyDistributionChart();
        if (typeof createAnomalyTypesChart === 'function') createAnomalyTypesChart();
        if (typeof createTimeOfDayChart === 'function') createTimeOfDayChart();
        
        // Add watermarks again, if they exist
        if (typeof addEnergyThemedBackground === 'function') {
            setTimeout(addEnergyThemedBackground, 300);
        }
    }
}

// Function to check notification permission
function checkNotificationPermission() {
    // Only check if the Notification API is available
    if ('Notification' in window) {
        // If notification permission is not granted or denied
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // Show a message to the user asking for permission
            const notificationAlert = document.createElement('div');
            notificationAlert.className = 'alert alert-info alert-dismissible fade show';
            notificationAlert.innerHTML = `
                <strong>Enable Notifications</strong> Allow notifications to get alerts when anomaly detection completes.
                <button type="button" id="enableNotifications" class="btn btn-sm btn-primary ms-3">Enable</button>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            // Insert the alert at the top of the main content
            const mainContent = document.querySelector('.main-content');
            if (mainContent && mainContent.firstChild) {
                mainContent.insertBefore(notificationAlert, mainContent.firstChild);
            }
            
            // Add event listener to the enable button
            const enableButton = document.getElementById('enableNotifications');
            if (enableButton) {
                enableButton.addEventListener('click', function() {
                    Notification.requestPermission().then(function(permission) {
                        if (permission === 'granted') {
                            // Show a success message
                            const successAlert = document.createElement('div');
                            successAlert.className = 'alert alert-success alert-dismissible fade show';
                            successAlert.innerHTML = `
                                <strong>Notifications Enabled!</strong> You will now receive alerts for important system events.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            `;
                            notificationAlert.parentNode.replaceChild(successAlert, notificationAlert);
                            
                            // Auto-dismiss the success message after 5 seconds
                            setTimeout(function() {
                                successAlert.classList.remove('show');
                                setTimeout(function() {
                                    successAlert.remove();
                                }, 150);
                            }, 5000);
                        }
                    });
                });
            }
        }
    }
}

// Function to show browser notification
function showNotification(title, message) {
    // Check if notifications are supported and permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
        // Create and show the notification
        const notification = new Notification(title, {
            body: message,
            icon: '/static/assets/logo.svg'
        });
        
        // Close the notification after 5 seconds
        setTimeout(notification.close.bind(notification), 5000);
    }
}

// Function to format numbers for display
function formatNumber(num, decimals = 2) {
    if (num === null || isNaN(num)) return '-';
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Function to format timestamps for display
function formatTimestamp(timestamp, format = 'datetime') {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    
    if (format === 'date') {
        return date.toLocaleDateString();
    } else if (format === 'time') {
        return date.toLocaleTimeString();
    } else {
        return date.toLocaleString();
    }
}
