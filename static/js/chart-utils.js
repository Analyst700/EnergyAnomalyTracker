/**
 * Utility functions for creating and managing charts
 */

// Function to create a line chart with anomaly detection
function createAnomalyLineChart(elementId, timeData, valueData, anomalyData, options = {}) {
    // Extract anomaly points
    const anomalyIndices = [];
    for (let i = 0; i < anomalyData.length; i++) {
        if (anomalyData[i]) {
            anomalyIndices.push(i);
        }
    }
    
    const anomalyTimes = anomalyIndices.map(i => timeData[i]);
    const anomalyValues = anomalyIndices.map(i => valueData[i]);
    
    // Set default options
    const defaultOptions = {
        title: 'Energy Consumption with Anomalies',
        xAxisTitle: 'Time',
        yAxisTitle: 'Energy Usage (kWh)',
        lineColor: '#2980b9',
        anomalyColor: '#e74c3c',
        height: 400,
        showLegend: true
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create traces for the chart
    const normalTrace = {
        x: timeData,
        y: valueData,
        type: 'scatter',
        mode: 'lines',
        name: 'Energy Consumption',
        line: {
            color: chartOptions.lineColor,
            width: 2
        }
    };
    
    const anomalyTrace = {
        x: anomalyTimes,
        y: anomalyValues,
        type: 'scatter',
        mode: 'markers',
        name: 'Anomalies',
        marker: {
            color: chartOptions.anomalyColor,
            size: 10,
            symbol: 'circle'
        }
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: chartOptions.xAxisTitle,
            showgrid: false
        },
        yaxis: {
            title: chartOptions.yAxisTitle,
            showgrid: true
        },
        showlegend: chartOptions.showLegend,
        legend: {
            x: 0,
            y: 1.1,
            orientation: 'h'
        },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(255,255,255,0.9)',
        paper_bgcolor: 'rgba(255,255,255,0.9)'
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [normalTrace, anomalyTrace], layout, {responsive: true});
}

// Function to create a bar chart
function createBarChart(elementId, labels, values, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Bar Chart',
        xAxisTitle: 'Categories',
        yAxisTitle: 'Values',
        barColor: '#3498db',
        height: 400
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create trace for the chart
    const trace = {
        x: labels,
        y: values,
        type: 'bar',
        marker: {
            color: chartOptions.barColor
        }
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: chartOptions.xAxisTitle
        },
        yaxis: {
            title: chartOptions.yAxisTitle
        },
        plot_bgcolor: 'rgba(255,255,255,0.9)',
        paper_bgcolor: 'rgba(255,255,255,0.9)'
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Function to create a pie chart
function createPieChart(elementId, labels, values, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Pie Chart',
        height: 400,
        colors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create trace for the chart
    const trace = {
        labels: labels,
        values: values,
        type: 'pie',
        marker: {
            colors: chartOptions.colors
        },
        textinfo: 'percent',
        hoverinfo: 'label+percent'
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 20,
            r: 20,
            b: 20,
            t: 40,
            pad: 4
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            x: 0,
            y: -0.2
        }
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Function to create a heatmap chart
function createHeatmap(elementId, xLabels, yLabels, zValues, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Heatmap',
        xAxisTitle: 'X Axis',
        yAxisTitle: 'Y Axis',
        height: 400,
        colorscale: 'Viridis'
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create trace for the chart
    const trace = {
        x: xLabels,
        y: yLabels,
        z: zValues,
        type: 'heatmap',
        colorscale: chartOptions.colorscale
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 70,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: chartOptions.xAxisTitle
        },
        yaxis: {
            title: chartOptions.yAxisTitle
        }
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Function to create a gauge chart
function createGaugeChart(elementId, value, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Gauge Chart',
        min: 0,
        max: 100,
        threshold: 70,
        height: 300
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create trace for the chart
    const trace = {
        domain: { x: [0, 1], y: [0, 1] },
        value: value,
        title: { text: chartOptions.title },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: { range: [chartOptions.min, chartOptions.max] },
            bar: { color: "#2980b9" },
            steps: [
                { range: [chartOptions.min, chartOptions.threshold], color: "rgba(46, 204, 113, 0.5)" },
                { range: [chartOptions.threshold, chartOptions.max], color: "rgba(231, 76, 60, 0.5)" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: chartOptions.threshold
            }
        }
    };
    
    // Define layout
    const layout = {
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 30,
            r: 30,
            b: 30,
            t: 30,
            pad: 4
        }
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Function to create a scatter plot with colored points
function createScatterPlot(elementId, xData, yData, colorData, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Scatter Plot',
        xAxisTitle: 'X Axis',
        yAxisTitle: 'Y Axis',
        normalColor: '#3498db',
        anomalyColor: '#e74c3c',
        height: 400
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create colors array based on colorData (boolean array)
    const colors = colorData.map(isAnomaly => 
        isAnomaly ? chartOptions.anomalyColor : chartOptions.normalColor
    );
    
    // Create trace for the chart
    const trace = {
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: colors,
            size: 10
        }
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 60,
            r: 40,
            b: 60,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: chartOptions.xAxisTitle
        },
        yaxis: {
            title: chartOptions.yAxisTitle
        },
        plot_bgcolor: 'rgba(255,255,255,0.9)',
        paper_bgcolor: 'rgba(255,255,255,0.9)'
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Function to create a radar chart
function createRadarChart(elementId, labels, values, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Radar Chart',
        fillColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 1)',
        height: 400
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create trace for the chart
    const trace = {
        type: 'scatterpolar',
        r: values,
        theta: labels,
        fill: 'toself',
        fillcolor: chartOptions.fillColor,
        line: {
            color: chartOptions.borderColor
        }
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 40,
            r: 40,
            b: 40,
            t: 40,
            pad: 4
        },
        polar: {
            radialaxis: {
                visible: true,
                range: [0, Math.max(...values) * 1.2]
            }
        }
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Function to create a horizontal bar chart for model metrics
function createModelMetricsChart(elementId, metrics, options = {}) {
    // Set default options
    const defaultOptions = {
        title: 'Model Performance Metrics',
        height: 250,
        barColor: '#2980b9'
    };
    
    // Merge default options with provided options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Extract metrics
    const labels = Object.keys(metrics);
    const values = Object.values(metrics);
    
    // Create trace for the chart
    const trace = {
        x: values,
        y: labels,
        type: 'bar',
        orientation: 'h',
        marker: {
            color: chartOptions.barColor
        }
    };
    
    // Define layout
    const layout = {
        title: chartOptions.title,
        autosize: true,
        height: chartOptions.height,
        margin: {
            l: 120,
            r: 40,
            b: 40,
            t: 40,
            pad: 4
        },
        xaxis: {
            title: 'Score',
            range: [0, 1]
        },
        yaxis: {
            title: ''
        },
        plot_bgcolor: 'rgba(255,255,255,0.9)',
        paper_bgcolor: 'rgba(255,255,255,0.9)'
    };
    
    // Create the chart
    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}
