function deleteRecommendation(id) {
    if (!confirm('Are you sure you want to delete this recommendation?')) return;
    
    fetch(`/delete_recommendation/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const element = document.querySelector(`.recommendation-card[data-recommendation-id="${id}"], .recommendation-item[data-recommendation-id="${id}"]`);
            if (element) {
                element.style.opacity = '0';
                element.style.transition = 'opacity 0.3s ease';
                setTimeout(() => element.remove(), 300);
            }
            // Refresh the page if no more recommendations
            const remainingRecommendations = document.querySelectorAll('.recommendation-card, .recommendation-item');
            if (remainingRecommendations.length <= 1) {
                setTimeout(() => location.reload(), 400);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize recommendation filtering
    initRecommendationFilters();
    
    // Create recommendation summary chart
    createRecommendationSummaryChart();
});

function initRecommendationFilters() {
    const filterButtons = document.querySelectorAll('.filter-controls button');
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    
    if (filterButtons.length === 0 || recommendationCards.length === 0) return;
    
    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected filter
            const filter = this.getAttribute('data-filter');
            
            // Show/hide recommendation cards based on filter
            recommendationCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-priority') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function createRecommendationSummaryChart() {
    const chart = document.getElementById('recommendationChart');
    if (!chart) return;
    
    // Count recommendations by priority
    let highCount = document.querySelectorAll('.recommendation-card[data-priority="high"]').length;
    let mediumCount = document.querySelectorAll('.recommendation-card[data-priority="medium"]').length;
    let lowCount = document.querySelectorAll('.recommendation-card[data-priority="low"]').length;
    
    // If no recommendations are found, use sample data
    if (highCount === 0 && mediumCount === 0 && lowCount === 0) {
        highCount = 3;
        mediumCount = 7;
        lowCount = 5;
    }
    
    // Create pie chart
    createPieChart('recommendationChart', ['High Priority', 'Medium Priority', 'Low Priority'], [highCount, mediumCount, lowCount], {
        title: 'Recommendations by Priority',
        height: 250,
        colors: ['#e74c3c', '#f39c12', '#3498db']
    });
}
