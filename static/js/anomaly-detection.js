document.addEventListener('DOMContentLoaded', function() {
    // Update contamination value display when slider changes
    const contaminationSlider = document.getElementById('contamination');
    const contaminationValue = document.getElementById('contaminationValue');
    
    if (contaminationSlider && contaminationValue) {
        // Set initial value
        contaminationValue.textContent = contaminationSlider.value;
        
        // Update when slider changes
        contaminationSlider.addEventListener('input', function() {
            contaminationValue.textContent = this.value;
        });
    }
    
    // Handle dataset selection change
    const datasetSelect = document.getElementById('dataset');
    const dataPreview = document.getElementById('dataPreview');
    
    if (datasetSelect && dataPreview) {
        datasetSelect.addEventListener('change', function() {
            fetchDatasetPreview(this.value);
        });
        
        // Fetch preview for initially selected dataset
        if (datasetSelect.value) {
            fetchDatasetPreview(datasetSelect.value);
        }
    }
    
    // Handle model selection change
    const modelSelect = document.getElementById('model');
    const modelAccordion = document.getElementById('modelAccordion');
    
    if (modelSelect && modelAccordion) {
        modelSelect.addEventListener('change', function() {
            // Get all accordion items
            const accordionItems = modelAccordion.querySelectorAll('.accordion-collapse');
            const accordionButtons = modelAccordion.querySelectorAll('.accordion-button');
            
            // Find the accordion item that corresponds to the selected model
            const selectedModel = this.value;
            let targetId;
            
            switch(selectedModel) {
                case 'isolation_forest':
                    targetId = 'isolationForestCollapse';
                    break;
                case 'autoencoder':
                    targetId = 'autoencoderCollapse';
                    break;
                case 'kmeans':
                    targetId = 'kmeansCollapse';
                    break;
            }
            
            // Collapse all items
            accordionItems.forEach(item => {
                item.classList.remove('show');
            });
            
            accordionButtons.forEach(button => {
                button.classList.add('collapsed');
                button.setAttribute('aria-expanded', 'false');
            });
            
            // Expand the selected item
            if (targetId) {
                const targetItem = document.getElementById(targetId);
                const targetButton = document.querySelector(`[data-bs-target="#${targetId}"]`);
                
                if (targetItem) {
                    targetItem.classList.add('show');
                }
                
                if (targetButton) {
                    targetButton.classList.remove('collapsed');
                    targetButton.setAttribute('aria-expanded', 'true');
                }
            }
        });
    }
});

// Function to fetch dataset preview
function fetchDatasetPreview(datasetId) {
    if (!datasetId) return;
    
    const dataPreviewContainer = document.querySelector('.data-preview-container');
    if (!dataPreviewContainer) return;
    
    // Show loading indicator
    dataPreviewContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Fetch the preview data
    fetch(`/api/dataset/${datasetId}/preview`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayDataPreview(data, dataPreviewContainer);
        })
        .catch(error => {
            console.error('Error fetching dataset preview:', error);
            dataPreviewContainer.innerHTML = `<div class="alert alert-danger">Error loading preview: ${error.message}</div>`;
        });
}

// Function to display dataset preview
function displayDataPreview(data, container) {
    if (!data || !data.preview || data.preview.length === 0) {
        container.innerHTML = '<p class="text-muted">No data available for preview.</p>';
        return;
    }
    
    // Create table element
    const table = document.createElement('div');
    table.className = 'table-responsive';
    
    // Create table HTML
    let tableHtml = '<table class="table table-sm table-hover">';
    
    // Create header row
    tableHtml += '<thead><tr>';
    data.columns.forEach(column => {
        tableHtml += `<th>${column}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    // Create body rows
    tableHtml += '<tbody>';
    data.preview.forEach(row => {
        tableHtml += '<tr>';
        data.columns.forEach(column => {
            tableHtml += `<td>${row[column] !== null ? row[column] : '-'}</td>`;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    
    // Set table HTML
    table.innerHTML = tableHtml;
    
    // Clear container and append table
    container.innerHTML = '';
    container.appendChild(table);
    
    // Add "more rows" indicator if data was truncated
    if (data.preview.length < 10) {
        const note = document.createElement('p');
        note.className = 'text-muted mt-2 small';
        note.textContent = 'Showing first 10 rows';
        container.appendChild(note);
    }
}
