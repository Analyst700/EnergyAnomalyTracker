document.addEventListener('DOMContentLoaded', function() {
    // Create model comparison chart
    createModelComparisonChart();
    
    // Update model metrics tables
    updateModelMetrics();
    
    // Create anomaly count by model chart
    createAnomalyCountChart();
    
    // Create detection timeline chart
    createTimelineChart();
});

function createModelComparisonChart() {
    const chart = document.getElementById('modelComparisonChart');
    if (!chart) return;
    
    // Sample data for model performance comparison
    const metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score'];
    
    // Sample values for each model
    const isolationForestValues = [0.85, 0.78, 0.72, 0.75];
    const autoencoderValues = [0.78, 0.83, 0.65, 0.73];
    const kmeansValues = [0.73, 0.68, 0.79, 0.73];
    
    // Create traces for each model
    const isolationForestTrace = {
        x: metrics,
        y: isolationForestValues,
        type: 'bar',
        name: 'Isolation Forest',
        marker: {
            color: '#3498db'
        }
    };
    
    const autoencoderTrace = {
        x: metrics,
        y: autoencoderValues,
        type: 'bar',
        name: 'Autoencoder',
        marker: {
            color: '#2ecc71'
        }
    };
    
    const kmeansTrace = {
        x: metrics,
        y: kmeansValues,
        type: 'bar',
        name: 'K-Means',
        marker: {
            color: '#e74c3c'
        }
    };
    
    // Define layout
    const layout = {
        title: 'Model Performance Comparison',
        autosize: true,
        height: 500,
        barmode: 'group',
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: 'Metrics'
        },
        yaxis: {
            title: 'Score',
            range: [0, 1]
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1.1,
            orientation: 'h'
        }
    };
    
    // Create the chart
    Plotly.newPlot('modelComparisonChart', [isolationForestTrace, autoencoderTrace, kmeansTrace], layout, {responsive: true});
}

function updateModelMetrics() {
    // Sample metrics for each model
    const isolationMetrics = {
        adr: '85%',
        time: '0.25 seconds',
        memory: '45 MB'
    };
    
    const autoencoderMetrics = {
        adr: '78%',
        time: '1.2 seconds',
        memory: '120 MB'
    };
    
    const kmeansMetrics = {
        adr: '73%',
        time: '0.45 seconds',
        memory: '60 MB'
    };
    
    // Update Isolation Forest metrics
    document.getElementById('isolation-adr').textContent = isolationMetrics.adr;
    document.getElementById('isolation-time').textContent = isolationMetrics.time;
    document.getElementById('isolation-memory').textContent = isolationMetrics.memory;
    
    // Update Autoencoder metrics
    document.getElementById('autoencoder-adr').textContent = autoencoderMetrics.adr;
    document.getElementById('autoencoder-time').textContent = autoencoderMetrics.time;
    document.getElementById('autoencoder-memory').textContent = autoencoderMetrics.memory;
    
    // Update K-Means metrics
    document.getElementById('kmeans-adr').textContent = kmeansMetrics.adr;
    document.getElementById('kmeans-time').textContent = kmeansMetrics.time;
    document.getElementById('kmeans-memory').textContent = kmeansMetrics.memory;
}

function createAnomalyCountChart() {
    const chart = document.getElementById('anomalyCountChart');
    if (!chart) return;
    
    // Sample data for anomaly count by model
    const models = ['Isolation Forest', 'Autoencoder', 'K-Means'];
    const counts = [45, 38, 52];
    
    // Create the chart
    createBarChart('anomalyCountChart', models, counts, {
        title: 'Anomalies Detected by Model',
        xAxisTitle: 'Model',
        yAxisTitle: 'Anomaly Count',
        barColor: '#9b59b6',
        height: 300
    });
}

function createTimelineChart() {
    const chart = document.getElementById('timelineChart');
    if (!chart) return;
    
    // Sample data for detection timeline
    const dates = [];
    const isolationForestCounts = [];
    const autoencoderCounts = [];
    const kmeansCounts = [];
    
    // Generate dates for the past 10 detections
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 9);
    
    // Generate data for each day
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date).toISOString().split('T')[0]);
        
        // Generate random counts for each model
        isolationForestCounts.push(Math.floor(Math.random() * 10) + 1);
        autoencoderCounts.push(Math.floor(Math.random() * 10) + 1);
        kmeansCounts.push(Math.floor(Math.random() * 10) + 1);
    }
    
    // Create traces for each model
    const isolationForestTrace = {
        x: dates,
        y: isolationForestCounts,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Isolation Forest',
        line: {
            color: '#3498db'
        }
    };
    
    const autoencoderTrace = {
        x: dates,
        y: autoencoderCounts,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Autoencoder',
        line: {
            color: '#2ecc71'
        }
    };
    
    const kmeansTrace = {
        x: dates,
        y: kmeansCounts,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'K-Means',
        line: {
            color: '#e74c3c'
        }
    };
    
    // Define layout
    const layout = {
        title: 'Anomaly Detection Timeline',
        autosize: true,
        height: 300,
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Anomalies Detected'
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1.1,
            orientation: 'h'
        }
    };
    
    // Create the chart
    Plotly.newPlot('timelineChart', [isolationForestTrace, autoencoderTrace, kmeansTrace], layout, {responsive: true});
}
