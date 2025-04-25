document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main chart with anomalies
    initMainChart();
    
    // Calculate and display average deviation
    calculateAverageDeviation();
    
    // Create model performance chart
    createModelPerformanceChart();
    
    // Create distribution chart
    createDistributionChart();
    
    // Create anomaly scores chart
    createScoresChart();
});

function initMainChart() {
    // Create normal consumption trace
    const normalTrace = {
        x: timeData,
        y: valueData,
        type: 'scatter',
        mode: 'lines',
        name: 'Energy Consumption',
        line: {
            color: '#2980b9',
            width: 2
        }
    };
    
    // Create anomaly points trace
    const anomalyPoints = {
        x: timeData.filter((_, i) => anomalyBoolArray[i]),
        y: valueData.filter((_, i) => anomalyBoolArray[i]),
        type: 'scatter',
        mode: 'markers',
        name: 'Anomalies',
        marker: {
            color: '#e74c3c',
            size: 8,
            symbol: 'circle'
        }
    };
    
    // Define layout
    const layout = {
        title: 'Energy Consumption with Detected Anomalies',
        autosize: true,
        height: 400,
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: 'Time',
            showgrid: true,
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Energy Usage (kWh)',
            showgrid: true,
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1.1,
            orientation: 'h'
        }
    };
    
    // Create the chart
    Plotly.newPlot('mainChart', [normalTrace, anomalyPoints], layout, {responsive: true});
}

function calculateAverageDeviation() {
    const avgDeviationElement = document.getElementById('avgDeviation');
    if (!avgDeviationElement) return;
    
    // Calculate average values for normal and anomaly points
    let normalSum = 0;
    let normalCount = 0;
    let anomalySum = 0;
    let anomalyCount = 0;
    
    for (let i = 0; i < valueData.length; i++) {
        if (anomalyBoolArray[i]) {
            anomalySum += valueData[i];
            anomalyCount++;
        } else {
            normalSum += valueData[i];
            normalCount++;
        }
    }
    
    const normalAvg = normalCount > 0 ? normalSum / normalCount : 0;
    const anomalyAvg = anomalyCount > 0 ? anomalySum / anomalyCount : 0;
    
    // Calculate percentage deviation
    let percentDeviation = 0;
    if (normalAvg > 0) {
        percentDeviation = ((anomalyAvg - normalAvg) / normalAvg) * 100;
    }
    
    // Display the result
    const formattedDeviation = percentDeviation.toFixed(1);
    const deviation = Math.abs(formattedDeviation);
    const direction = percentDeviation >= 0 ? 'higher' : 'lower';
    
    avgDeviationElement.textContent = `${deviation}% ${direction}`;
    
    // Add color based on deviation magnitude
    if (deviation > 50) {
        avgDeviationElement.className = 'text-danger';
    } else if (deviation > 20) {
        avgDeviationElement.className = 'text-warning';
    } else {
        avgDeviationElement.className = 'text-success';
    }
}

function createModelPerformanceChart() {
    const chart = document.getElementById('modelPerformanceChart');
    if (!chart) return;
    
    // Sample metrics for the model
    // In a real application, these would be provided by the backend
    const metrics = {
        'Accuracy': 0.85,
        'Precision': 0.78,
        'Recall': 0.72,
        'F1 Score': 0.75
    };
    
    // Create model metrics chart
    createModelMetricsChart('modelPerformanceChart', metrics, {
        title: `${modelName} Performance Metrics`,
        height: 220
    });
}

function createDistributionChart() {
    const chart = document.getElementById('distributionChart');
    if (!chart) return;
    
    // Calculate distribution by time period (e.g., hour of day)
    const hourCounts = {};
    const hourLabels = [];
    
    // Initialize all hours with 0 count
    for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
        hourLabels.push(`${i}:00`);
    }
    
    // Count anomalies by hour
    for (let i = 0; i < timeData.length; i++) {
        if (anomalyBoolArray[i]) {
            // Parse hour from timestamp (assuming format like "2023-01-01 08:00:00")
            const hour = new Date(timeData[i]).getHours();
            hourCounts[hour]++;
        }
    }
    
    // Convert to arrays for charting
    const countValues = Object.values(hourCounts);
    
    // Create the chart
    createBarChart('distributionChart', hourLabels, countValues, {
        title: 'Anomaly Distribution by Hour of Day',
        xAxisTitle: 'Hour',
        yAxisTitle: 'Anomaly Count',
        barColor: '#e74c3c',
        height: 300
    });
}

function createScoresChart() {
    const chart = document.getElementById('scoresChart');
    if (!chart) return;
    
    // Create a histogram of anomaly scores
    const bins = 10;
    const minScore = Math.min(...scoreData);
    const maxScore = Math.max(...scoreData);
    const binSize = (maxScore - minScore) / bins;
    
    // Create bin ranges
    const binRanges = [];
    const binCounts = Array(bins).fill(0);
    
    for (let i = 0; i < bins; i++) {
        const binStart = minScore + i * binSize;
        const binEnd = binStart + binSize;
        binRanges.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
    }
    
    // Count scores in each bin
    for (let i = 0; i < scoreData.length; i++) {
        const score = scoreData[i];
        const binIndex = Math.min(Math.floor((score - minScore) / binSize), bins - 1);
        binCounts[binIndex]++;
    }
    
    // Create threshold line
    const thresholdValue = document.querySelector('#mainChart').getAttribute('data-threshold') || 
                          (minScore + (maxScore - minScore) * 0.95);
    
    // Create the histogram chart
    const trace = {
        x: binRanges,
        y: binCounts,
        type: 'bar',
        marker: {
            color: binRanges.map((_, i) => {
                const binMidpoint = minScore + (i + 0.5) * binSize;
                return binMidpoint > thresholdValue ? '#e74c3c' : '#3498db';
            })
        }
    };
    
    const layout = {
        title: 'Distribution of Anomaly Scores',
        autosize: true,
        height: 300,
        margin: {
            l: 60,
            r: 40,
            b: 80,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: 'Anomaly Score Range',
            tickangle: -45
        },
        yaxis: {
            title: 'Count'
        },
        shapes: [{
            type: 'line',
            x0: -0.5,
            y0: thresholdValue,
            x1: bins - 0.5,
            y1: thresholdValue,
            line: {
                color: 'red',
                width: 2,
                dash: 'dash'
            }
        }],
        annotations: [{
            x: binRanges[Math.floor(bins * 0.75)],
            y: Math.max(...binCounts) * 0.9,
            text: 'Anomaly Threshold',
            showarrow: true,
            arrowhead: 1,
            ax: -40,
            ay: -40
        }]
    };
    
    Plotly.newPlot('scoresChart', [trace], layout, {responsive: true});
}
