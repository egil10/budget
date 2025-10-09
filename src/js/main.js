// main.js - Main application logic for Budget Dashboard

import { DEPARTMENT_COLORS, CHART_CONFIG, formatAmount, formatNumber } from './config.js';

console.log('Budget Dashboard loading...');

// Global state
let budgetData = {
    '2024': null,
    '2025': null,
    combined: []
};
let currentFilter = 'all';
let currentSort = 'default';
let searchTerm = '';
let currentYear = 'both'; // 'both', '2024', or '2025'

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
    // Initialize UI components
    initSidebar();
    initFilters();
    initSearch();
    initSort();
    
    // Load budget data
    await loadBudgetData();
    
    // Hide loading screen
    hideLoadingScreen();
});

// Initialize sidebar toggle
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-expanded');
            
            // Show/hide backdrop on mobile
            if (window.innerWidth <= 768) {
                if (sidebar.classList.contains('expanded')) {
                    backdrop.style.display = 'block';
                    setTimeout(() => backdrop.classList.add('show'), 10);
                } else {
                    backdrop.classList.remove('show');
                    setTimeout(() => backdrop.style.display = 'none', 150);
                }
            }
        });
        
        // Close sidebar when clicking backdrop
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('expanded');
                sidebar.classList.add('collapsed');
                document.body.classList.remove('sidebar-expanded');
                backdrop.classList.remove('show');
                setTimeout(() => backdrop.style.display = 'none', 150);
            });
        }
    }
}

// Initialize filter panel
function initFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    const filterBackdrop = document.getElementById('filter-backdrop');
    
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', () => {
            const isShown = filterPanel.style.display !== 'none';
            
            if (isShown) {
                filterPanel.classList.remove('show');
                filterBackdrop.classList.remove('show');
                setTimeout(() => {
                    filterPanel.style.display = 'none';
                    filterBackdrop.style.display = 'none';
                }, 300);
            } else {
                filterPanel.style.display = 'block';
                filterBackdrop.style.display = 'block';
                setTimeout(() => {
                    filterPanel.classList.add('show');
                    filterBackdrop.classList.add('show');
                }, 10);
            }
        });
        
        // Close filter panel when clicking backdrop
        if (filterBackdrop) {
            filterBackdrop.addEventListener('click', () => {
                filterPanel.classList.remove('show');
                filterBackdrop.classList.remove('show');
                setTimeout(() => {
                    filterPanel.style.display = 'none';
                    filterBackdrop.style.display = 'none';
                }, 300);
            });
        }
    }
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('headerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderBudgetData();
        });
    }
}

// Initialize sort
function initSort() {
    const sortToggle = document.getElementById('headerSortToggle');
    if (sortToggle) {
        sortToggle.addEventListener('click', () => {
            currentSort = currentSort === 'default' ? 'alpha' : 'default';
            renderBudgetData();
        });
    }
}

// Load budget data from JSON files
async function loadBudgetData() {
    try {
        console.log('Loading budget data...');
        console.log('Current URL:', window.location.href);
        
        // Load 2025 budget
        console.log('Fetching 2025 data from: /data/json/20241002_gulbok_data_til_publ.json');
        let response2025;
        try {
            response2025 = await fetch('/data/json/20241002_gulbok_data_til_publ.json');
        } catch (fetchError) {
            console.error('Fetch error for 2025 data:', fetchError);
            throw new Error(`Network error loading 2025 data: ${fetchError.message}`);
        }
        
        console.log('2025 response status:', response2025.status, response2025.statusText);
        
        if (!response2025.ok) {
            throw new Error(`HTTP error loading 2025 data! status: ${response2025.status} ${response2025.statusText}`);
        }
        
        let data2025;
        try {
            data2025 = await response2025.json();
        } catch (jsonError) {
            console.error('JSON parse error for 2025 data:', jsonError);
            throw new Error(`JSON parse error for 2025 data: ${jsonError.message}`);
        }
        
        console.log('2025 data structure:', Object.keys(data2025));
        console.log('2025 Data array length:', data2025.Data ? data2025.Data.length : 'No Data key');
        
        if (!data2025.Data && !Array.isArray(data2025)) {
            throw new Error('2025 data does not contain expected Data array');
        }
        
        budgetData['2025'] = (data2025.Data || data2025).map(item => ({ ...item, year: 2025 }));
        console.log(`Loaded ${budgetData['2025'].length} budget items for 2025`);
        
        // Load 2024 budget
        console.log('Fetching 2024 data from: /data/json/gul_bok_2024_datagrunnlag.json');
        let response2024;
        try {
            response2024 = await fetch('/data/json/gul_bok_2024_datagrunnlag.json');
        } catch (fetchError) {
            console.error('Fetch error for 2024 data:', fetchError);
            throw new Error(`Network error loading 2024 data: ${fetchError.message}`);
        }
        
        console.log('2024 response status:', response2024.status, response2024.statusText);
        
        if (!response2024.ok) {
            throw new Error(`HTTP error loading 2024 data! status: ${response2024.status} ${response2024.statusText}`);
        }
        
        let data2024;
        try {
            data2024 = await response2024.json();
        } catch (jsonError) {
            console.error('JSON parse error for 2024 data:', jsonError);
            throw new Error(`JSON parse error for 2024 data: ${jsonError.message}`);
        }
        
        console.log('2024 data structure:', Object.keys(data2024));
        console.log('2024 Data array length:', data2024.Data ? data2024.Data.length : 'No Data key');
        
        if (!data2024.Data && !Array.isArray(data2024)) {
            throw new Error('2024 data does not contain expected Data array');
        }
        
        budgetData['2024'] = (data2024.Data || data2024).map(item => ({ ...item, year: 2024 }));
        console.log(`Loaded ${budgetData['2024'].length} budget items for 2024`);
        
        // Combine datasets
        budgetData.combined = [...budgetData['2024'], ...budgetData['2025']];
        console.log(`Total budget items: ${budgetData.combined.length}`);
        
        // Populate department filters
        populateDepartmentFilters();
        
        // Populate categories in sidebar
        populateCategories();
        
        // Add year filter
        addYearFilter();
        
        // Render initial data
        renderBudgetData();
        
        console.log('Budget data loaded successfully!');
        
    } catch (error) {
        console.error('Error loading budget data:', error);
        console.error('Error details:', error.message);
        showError(`Kunne ikke laste budsjettdata: ${error.message}`);
    }
}

// Add year filter to header
function addYearFilter() {
    const rightSection = document.querySelector('.right-section');
    if (!rightSection) return;
    
    // Create year filter dropdown
    const yearFilter = document.createElement('select');
    yearFilter.id = 'yearFilter';
    yearFilter.className = 'year-filter';
    yearFilter.innerHTML = `
        <option value="both">Begge år</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
    `;
    yearFilter.style.cssText = `
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: calc(var(--radius) - 8px);
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        color: var(--text);
        cursor: pointer;
        font-family: inherit;
    `;
    
    yearFilter.addEventListener('change', (e) => {
        currentYear = e.target.value;
        renderBudgetData();
    });
    
    // Insert before search
    const headerSearch = rightSection.querySelector('.header-search');
    if (headerSearch) {
        rightSection.insertBefore(yearFilter, headerSearch);
    }
}

// Populate department filters
function populateDepartmentFilters() {
    if (!budgetData.combined || budgetData.combined.length === 0) return;
    
    // Get unique departments
    const departments = [...new Set(budgetData.combined.map(item => item.gdep_navn))].filter(Boolean).sort();
    
    const filtersContainer = document.getElementById('departmentFilters');
    if (!filtersContainer) return;
    
    // Clear existing filters (except "Alle")
    const allButton = filtersContainer.querySelector('[data-filter="all"]');
    filtersContainer.innerHTML = '';
    if (allButton) filtersContainer.appendChild(allButton);
    
    // Add department filters
    departments.forEach(dept => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', dept);
        button.textContent = dept;
        button.addEventListener('click', () => {
            // Update active state
            filtersContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update filter
            currentFilter = dept;
            renderBudgetData();
        });
        filtersContainer.appendChild(button);
    });
}

// Populate categories in sidebar
function populateCategories() {
    if (!budgetData.combined || budgetData.combined.length === 0) return;
    
    // Get unique categories
    const categories = [...new Set(budgetData.combined.map(item => item.kat_navn))].filter(Boolean).sort();
    
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    categoryList.innerHTML = '<h4 style="margin-bottom: 1rem;">Budsjettoversikt</h4>';
    
    // Add year comparison summary
    const summary = document.createElement('div');
    summary.className = 'budget-summary';
    summary.style.cssText = `
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: calc(var(--radius) - 8px);
        padding: 1rem;
        margin-bottom: 1rem;
    `;
    
    const total2024 = budgetData['2024'].reduce((sum, item) => 
        sum + (parseFloat(item['beløp'] || item['belop'] || 0) * 1000), 0
    );
    const total2025 = budgetData['2025'].reduce((sum, item) => 
        sum + (parseFloat(item['beløp'] || item['belop'] || 0) * 1000), 0
    );
    const change = total2025 - total2024;
    const changePercent = ((change / total2024) * 100).toFixed(1);
    
    summary.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Totalt budsjett</div>
        <div style="font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 0.25rem;">
            2024: ${formatAmount(total2024)}
        </div>
        <div style="font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem;">
            2025: ${formatAmount(total2025)}
        </div>
        <div style="font-size: 0.8rem; font-weight: 600; color: ${change >= 0 ? '#22c55e' : '#ef4444'};">
            ${change >= 0 ? '↑' : '↓'} ${formatAmount(Math.abs(change))} (${changePercent}%)
        </div>
    `;
    categoryList.appendChild(summary);
    
    // Add categories
    const categoriesTitle = document.createElement('h4');
    categoriesTitle.textContent = 'Kategorier';
    categoriesTitle.style.cssText = 'margin-bottom: 0.5rem; font-size: 0.9rem;';
    categoryList.appendChild(categoriesTitle);
    
    categories.slice(0, 20).forEach(category => { // Limit to 20 for performance
        const item = document.createElement('div');
        item.className = 'category-item';
        item.textContent = category;
        item.addEventListener('click', () => {
            searchTerm = category.toLowerCase();
            document.getElementById('headerSearch').value = category;
            renderBudgetData();
        });
        categoryList.appendChild(item);
    });
}

// Render budget data
function renderBudgetData() {
    if (!budgetData.combined || budgetData.combined.length === 0) return;
    
    const grid = document.getElementById('budgetGrid');
    if (!grid) return;
    
    // Get data based on year filter
    let dataToUse = budgetData.combined;
    if (currentYear === '2024') {
        dataToUse = budgetData['2024'];
    } else if (currentYear === '2025') {
        dataToUse = budgetData['2025'];
    }
    
    // Filter data
    let filtered = dataToUse.filter(item => {
        // Filter by department
        if (currentFilter !== 'all' && item.gdep_navn !== currentFilter) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm && !itemMatchesSearch(item, searchTerm)) {
            return false;
        }
        
        return true;
    });
    
    // Sort data
    if (currentSort === 'alpha') {
        filtered.sort((a, b) => (a.kap_navn || '').localeCompare(b.kap_navn || ''));
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // If showing both years, create comparison cards
    if (currentYear === 'both') {
        renderComparisonView(filtered);
    } else {
        // Group by department and chapter for single year view
        const grouped = groupByDepartmentAndChapter(filtered);
        
        // Render cards
        Object.entries(grouped).forEach(([deptName, chapters]) => {
            Object.entries(chapters).forEach(([chapName, items]) => {
                const card = createBudgetCard(deptName, chapName, items);
                grid.appendChild(card);
            });
        });
    }
    
    // Show message if no results
    if (grid.children.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">Ingen resultater funnet</div>';
    }
}

// Check if item matches search term
function itemMatchesSearch(item, term) {
    const searchableFields = [
        item.gdep_navn,
        item.kap_navn,
        item.post_navn,
        item.kat_navn,
        item.stikkord
    ];
    
    return searchableFields.some(field => 
        field && field.toLowerCase().includes(term)
    );
}

// Group data by department and chapter
function groupByDepartmentAndChapter(data) {
    const grouped = {};
    
    data.forEach(item => {
        const dept = item.gdep_navn || 'Ukjent departement';
        const chapter = item.kap_navn || 'Ukjent kapittel';
        
        if (!grouped[dept]) grouped[dept] = {};
        if (!grouped[dept][chapter]) grouped[dept][chapter] = [];
        
        grouped[dept][chapter].push(item);
    });
    
    return grouped;
}

// Render comparison view (both years)
function renderComparisonView(filtered) {
    const grid = document.getElementById('budgetGrid');
    
    // Group by department and chapter
    const groupedByChapter = {};
    
    filtered.forEach(item => {
        const key = `${item.gdep_navn}|||${item.kap_navn}`;
        if (!groupedByChapter[key]) {
            groupedByChapter[key] = {
                deptName: item.gdep_navn,
                chapName: item.kap_navn,
                '2024': [],
                '2025': []
            };
        }
        groupedByChapter[key][item.year].push(item);
    });
    
    // Create comparison cards
    Object.values(groupedByChapter).forEach(data => {
        const card = createComparisonCard(data.deptName, data.chapName, data['2024'], data['2025']);
        grid.appendChild(card);
    });
}

// Create comparison card showing both years
function createComparisonCard(deptName, chapName, items2024, items2025) {
    const card = document.createElement('div');
    card.className = 'budget-card comparison-card';
    
    // Calculate totals
    const total2024 = items2024.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0) * 1000;
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const total2025 = items2025.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0) * 1000;
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const change = total2025 - total2024;
    let changePercent = '0%';
    let changeText = '0%';
    
    if (total2024 === 0 && total2025 > 0) {
        changePercent = '∞';
        changeText = 'Ny post';
    } else if (total2024 === 0 && total2025 === 0) {
        changePercent = '0%';
        changeText = '0%';
    } else if (total2024 > 0) {
        const percent = ((change / total2024) * 100);
        changePercent = percent.toFixed(1) + '%';
        changeText = changePercent;
    }
    
    // Get department color
    const color = DEPARTMENT_COLORS[deptName] || '#3b82f6';
    
    card.innerHTML = `
        <div class="budget-card-header">
            <h3>${chapName}</h3>
            <div class="budget-card-subtitle">${deptName}</div>
        </div>
        <div class="year-comparison">
            <div class="year-column">
                <div class="year-label">2024</div>
                <div class="budget-amount" style="color: ${color}; font-size: 1.2rem;">
                    ${formatAmount(total2024)}
                </div>
            </div>
            <div class="change-indicator" style="color: ${change >= 0 ? '#00aa00' : '#aa0000'};">
                ${change >= 0 ? '↑' : '↓'} ${changeText}
            </div>
            <div class="year-column">
                <div class="year-label">2025</div>
                <div class="budget-amount" style="color: ${color}; font-size: 1.2rem;">
                    ${formatAmount(total2025)}
                </div>
            </div>
        </div>
        <div class="budget-details">
            <div class="budget-detail-row">
                <span class="budget-detail-label">Net Change:</span>
                <span class="budget-detail-value" style="color: ${change >= 0 ? '#000000' : '#000000'}; font-weight: 700;">
                    ${formatAmount(Math.abs(change))}
                </span>
            </div>
            <div class="budget-detail-row">
                <span class="budget-detail-label">Items 2024:</span>
                <span class="budget-detail-value">${items2024.length}</span>
            </div>
            <div class="budget-detail-row">
                <span class="budget-detail-label">Items 2025:</span>
                <span class="budget-detail-value">${items2025.length}</span>
            </div>
            <div class="budget-detail-row">
                <span class="budget-detail-label">Status:</span>
                <span class="budget-detail-value" style="font-weight: 700; text-transform: uppercase;">
                    ${change >= 0 ? 'Increase' : 'Decrease'}
                </span>
            </div>
        </div>
        <div class="chart-wrapper" style="margin-top: 0.25rem; height: 50px; position: relative; overflow: hidden;">
            <canvas class="trend-chart" style="width: 100%; height: 100%; max-height: 50px;"></canvas>
        </div>
    `;
    
    // Add chart after card is in DOM
    setTimeout(() => {
        const canvas = card.querySelector('.trend-chart');
        if (canvas && typeof Chart !== 'undefined') {
            // Set fixed dimensions before creating chart
            canvas.style.width = '100%';
            canvas.style.height = '50px';
            canvas.style.maxHeight = '50px';
            
            createTrendChart(canvas, total2024, total2025, chapName);
        }
    }, 100); // Slightly longer delay to ensure DOM is ready
    
    return card;
}

// Create trend chart for comparison
function createTrendChart(canvas, amount2024, amount2025, label) {
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025'],
            datasets: [{
                label: label,
                data: [amount2024, amount2025],
                borderColor: amount2025 >= amount2024 ? '#00aa00' : '#aa0000',
                backgroundColor: amount2025 >= amount2024 ? 'rgba(0, 170, 0, 0.1)' : 'rgba(170, 0, 0, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    display: false,
                    grid: {
                        display: false
                    }
                },
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 0
                },
                line: {
                    tension: 0.1,
                    borderWidth: 3
                }
            }
        }
    });
    
    // Store chart reference
    canvas.chart = chart;
    
    return chart;
}

// Create budget card for single year
function createBudgetCard(deptName, chapName, items) {
    const card = document.createElement('div');
    card.className = 'budget-card';
    
    // Calculate total amount
    const total = items.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0) * 1000;
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Get department color
    const color = DEPARTMENT_COLORS[deptName] || '#3b82f6';
    
    // Get year
    const year = items[0]?.year || '';
    
    card.innerHTML = `
        <div class="budget-card-header">
            <h3>${chapName}</h3>
            <div class="budget-card-subtitle">${deptName} ${year ? `· ${year}` : ''}</div>
        </div>
        <div class="budget-amount" style="color: ${color}">
            ${formatAmount(total)}
        </div>
        <div class="budget-details">
            <div class="budget-detail-row">
                <span class="budget-detail-label">Total Items:</span>
                <span class="budget-detail-value">${items.length}</span>
            </div>
            ${items.slice(0, 2).map(item => `
                <div class="budget-detail-row">
                    <span class="budget-detail-label">${(item.post_navn || 'Unknown').substring(0, 20)}${(item.post_navn || '').length > 20 ? '...' : ''}</span>
                    <span class="budget-detail-value">${formatNumber(parseFloat(item['beløp'] || item['belop'] || 0) * 1000)}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    return card;
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Show error message
function showError(message) {
    const grid = document.getElementById('budgetGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--danger);">
                <h3>Feil</h3>
                <p>${message}</p>
                <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.8;">
                    Sjekk konsollen for flere detaljer (F12 → Console)
                </p>
            </div>
        `;
    }
    hideLoadingScreen();
}

console.log('Budget Dashboard main.js loaded');

