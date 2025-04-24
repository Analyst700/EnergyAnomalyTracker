document.addEventListener('DOMContentLoaded', function() {
    // Create sample dashboard charts with mock data
    createEnergyConsumptionChart();
    createAnomalyDistributionChart();
    createAnomalyTypesChart();
    createTimeOfDayChart();
});

// Function to check if dark mode is active
function isDarkMode() {
    return document.body.classList.contains('dark-mode');
}

function createEnergyConsumptionChart() {
    const chart = document.getElementById('consumptionChart');
    if (!chart) return;
    
    // Generate sample data for energy consumption
    const timeData = [];
    const valueData = [];
    const anomalyData = [];
    
    // Create date range for the past 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    // Generate daily data points
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        timeData.push(new Date(date).toISOString().split('T')[0]);
        
        // Generate a random value with a trend
        const baseValue = 20 + 5 * Math.sin(timeData.length / 5);
        const randomFactor = Math.random() * 3;
        let value = baseValue + randomFactor;
        
        // Add some anomalies
        if (timeData.length % 10 === 0) {
            value += 15;
            anomalyData.push(true);
        } else if (timeData.length % 15 === 0) {
            value -= 10;
            anomalyData.push(true);
        } else {
            anomalyData.push(false);
        }
        
        valueData.push(value);
    }
    
    // Create the chart
    createAnomalyLineChart('consumptionChart', timeData, valueData, anomalyData, {
        title: 'Energy Consumption Trend (Last 30 Days)',
        height: 300,
        plotBgColor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        paperBgColor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        textColor: isDarkMode() ? '#ecf0f1' : '#333',
        gridColor: isDarkMode() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    });
}

function createAnomalyDistributionChart() {
    const chart = document.getElementById('anomalyDistributionChart');
    if (!chart) return;
    
    // Sample data for anomaly distribution by day of week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const anomalyCounts = [5, 3, 7, 12, 9, 4, 6];
    
    // Create bar chart
    createBarChart('anomalyDistributionChart', daysOfWeek, anomalyCounts, {
        title: 'Anomalies by Day of Week',
        xAxisTitle: 'Day',
        yAxisTitle: 'Anomaly Count',
        barColor: '#e74c3c',
        height: 300,
        plotBgColor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        paperBgColor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        textColor: isDarkMode() ? '#ecf0f1' : '#333',
        gridColor: isDarkMode() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    });
}

function createAnomalyTypesChart() {
    const chart = document.getElementById('anomalyTypesChart');
    if (!chart) return;
    
    // Sample data for anomaly types
    const anomalyTypes = ['Spike', 'Drop', 'Shift', 'Trend Change', 'Oscillation'];
    const typeCounts = [45, 25, 15, 10, 5];
    
    // Create pie chart
    createPieChart('anomalyTypesChart', anomalyTypes, typeCounts, {
        title: 'Anomaly Types Distribution',
        height: 250,
        paperBgColor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        textColor: isDarkMode() ? '#ecf0f1' : '#333',
        colors: isDarkMode() ? ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'] : undefined
    });
}

// Add energy-themed imagery background to charts
function addEnergyThemedBackground() {
    // Energy-themed backgrounds for each chart container
    const themeBackgrounds = [
        { id: 'consumptionChart', icon: 'fa-bolt', label: 'Energy Consumption' },
        { id: 'anomalyDistributionChart', icon: 'fa-exclamation-triangle', label: 'Anomaly Distribution' },
        { id: 'anomalyTypesChart', icon: 'fa-chart-pie', label: 'Anomaly Types' },
        { id: 'timeOfDayChart', icon: 'fa-clock', label: 'Time Analysis' }
    ];
    
    // Add visual elements to each chart
    themeBackgrounds.forEach(theme => {
        const container = document.getElementById(theme.id);
        if (!container) return;
        
        // Add an icon watermark
        const watermark = document.createElement('div');
        watermark.className = 'chart-watermark';
        watermark.innerHTML = `<i class="fas ${theme.icon}"></i>`;
        
        // Add the watermark before the chart
        container.parentNode.insertBefore(watermark, container);
        
        // Add chart label for accessibility
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = theme.label;
        container.parentNode.appendChild(label);
    });
}

function createTimeOfDayChart() {
    const chart = document.getElementById('timeOfDayChart');
    if (!chart) return;
    
    // Call function to add energy-themed elements after all charts are loaded
    setTimeout(addEnergyThemedBackground, 500);
    
    // Sample data for time-of-day analysis
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const normalUsage = Array.from({length: 24}, (_, i) => {
        // Create a realistic daily pattern
        if (i >= 0 && i < 6) {
            return 5 + Math.random() * 2; // Night - low usage
        } else if (i >= 6 && i < 9) {
            return 15 + Math.random() * 5; // Morning peak
        } else if (i >= 9 && i < 17) {
            return 10 + Math.random() * 3; // Working hours
        } else if (i >= 17 && i < 22) {
            return 20 + Math.random() * 5; // Evening peak
        } else {
            return 8 + Math.random() * 3; // Late evening
        }
    });
    
    const anomalyUsage = Array.from({length: 24}, (_, i) => {
        // Anomalies occur at specific times
        if (i === 8 || i === 18) {
            return normalUsage[i] * 1.8; // Significant spikes
        } else if (i === 3) {
            return normalUsage[i] * 0.2; // Significant drop
        } else {
            return null; // No anomaly
        }
    });
    
    // Create traces for the chart
    const normalTrace = {
        x: hours,
        y: normalUsage,
        type: 'scatter',
        mode: 'lines',
        name: 'Normal Usage',
        line: {
            color: '#2980b9',
            width: 2
        }
    };
    
    const anomalyTrace = {
        x: hours,
        y: anomalyUsage,
        type: 'scatter',
        mode: 'markers',
        name: 'Anomalies',
        marker: {
            color: '#e74c3c',
            size: 10,
            symbol: 'circle'
        }
    };
    
    // Define layout
    const layout = {
        title: 'Energy Usage by Hour of Day',
        autosize: true,
        height: 250,
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: 'Time of Day',
            showgrid: false,
            color: isDarkMode() ? '#ecf0f1' : '#333'
        },
        yaxis: {
            title: 'Energy Usage (kWh)',
            showgrid: true,
            gridcolor: isDarkMode() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            color: isDarkMode() ? '#ecf0f1' : '#333'
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1.1,
            orientation: 'h',
            font: {
                color: isDarkMode() ? '#ecf0f1' : '#333'
            }
        },
        hovermode: 'closest',
        plot_bgcolor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        paper_bgcolor: isDarkMode() ? 'rgba(40, 55, 71, 0.9)' : 'rgba(255,255,255,0.9)',
        font: {
            color: isDarkMode() ? '#ecf0f1' : '#333'
        }
    };
    
    // Create the chart
    Plotly.newPlot('timeOfDayChart', [normalTrace, anomalyTrace], layout, {responsive: true});
}
