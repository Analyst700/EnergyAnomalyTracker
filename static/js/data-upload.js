document.addEventListener('DOMContentLoaded', function() {
    // Handle sample dataset download button
    const downloadSampleBtn = document.getElementById('downloadSample');
    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', generateSampleDataset);
    }
    
    // Handle file upload changes
    const fileInput = document.getElementById('file');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            validateFile(this);
        });
    }
});

function validateFile(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const fileTypeError = document.getElementById('fileTypeError');
    
    // Create error element if it doesn't exist
    if (!fileTypeError) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.id = 'fileTypeError';
        fileInput.parentNode.appendChild(errorDiv);
    }
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        document.getElementById('fileTypeError').textContent = 'Please upload a CSV file.';
        fileInput.value = '';
    } else {
        document.getElementById('fileTypeError').textContent = '';
    }
}

function generateSampleDataset(e) {
    e.preventDefault();
    
    // Create headers
    let csvContent = 'timestamp,energy_kwh\n';
    
    // Generate sample data for one month, hourly readings
    const startDate = new Date(2023, 0, 1); // January 1, 2023
    const endDate = new Date(2023, 0, 31); // January 31, 2023
    
    for (let date = new Date(startDate); date <= endDate; date.setHours(date.getHours() + 1)) {
        const timestamp = date.toISOString().replace('T', ' ').substring(0, 19);
        
        // Generate realistic energy consumption values
        // Base value varies by hour of day to simulate daily patterns
        const hour = date.getHours();
        let baseValue;
        
        if (hour >= 0 && hour < 6) {
            // Night - low usage
            baseValue = 5 + Math.random() * 2;
        } else if (hour >= 6 && hour < 9) {
            // Morning peak
            baseValue = 15 + Math.random() * 5;
        } else if (hour >= 9 && hour < 17) {
            // Working hours
            baseValue = 10 + Math.random() * 3;
        } else if (hour >= 17 && hour < 22) {
            // Evening peak
            baseValue = 20 + Math.random() * 5;
        } else {
            // Late evening
            baseValue = 8 + Math.random() * 3;
        }
        
        // Weekend adjustment
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            baseValue *= 1.2; // Higher consumption on weekends
        }
        
        // Add some anomalies
        if (
            (date.getDate() === 10 && hour === 14) || 
            (date.getDate() === 20 && hour === 19) ||
            (date.getDate() === 25 && hour === 2)
        ) {
            // Spike or drop anomalies
            const anomalyFactor = Math.random() > 0.5 ? 2.5 : 0.2;
            baseValue *= anomalyFactor;
        }
        
        // Round to 2 decimal places
        const energyValue = baseValue.toFixed(2);
        
        // Add row to CSV
        csvContent += `${timestamp},${energyValue}\n`;
    }
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_energy_data.csv');
    document.body.appendChild(link);
    
    // Download the file
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}
