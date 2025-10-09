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
    const sortText = document.getElementById('sortText');
    
    if (sortToggle) {
        sortToggle.addEventListener('click', () => {
            currentSort = currentSort === 'default' ? 'alpha' : 'default';
            
            // Update button text
            if (sortText) {
                sortText.textContent = currentSort === 'alpha' ? 'Z-A' : 'A-Z';
            }
            
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
        console.log('Fetching 2025 data from: ./data/json/20241002_gulbok_data_til_publ.json');
        let response2025;
        try {
            response2025 = await fetch('./data/json/20241002_gulbok_data_til_publ.json');
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
        console.log('Fetching 2024 data from: ./data/json/gul_bok_2024_datagrunnlag.json');
        let response2024;
        try {
            response2024 = await fetch('./data/json/gul_bok_2024_datagrunnlag.json');
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
        
        // Setup navigation
        setupNavigation();
        
        // Set default active state to "Alle" - wait for navigation to be created
        setTimeout(() => {
            const alleButton = document.querySelector('.nav-link[data-department="all"]');
            if (alleButton) {
                alleButton.classList.add('active');
            }
        }, 100);
        
        // Always show comparison view (both years)
        
        // Render initial data
        renderBudgetData();
        
        console.log('Budget data loaded successfully!');
        
    } catch (error) {
        console.error('Error loading budget data:', error);
        console.error('Error details:', error.message);
        showError(`Kunne ikke laste budsjettdata: ${error.message}`);
    }
}

// Year filter removed - always show comparison view

// Setup navigation categories
function setupNavigation() {
    if (!budgetData.combined || budgetData.combined.length === 0) return;
    
    // Get unique fdep_navn (actual departments) for filter buttons
    // Clean up department names (remove leading/trailing spaces) and remove duplicates
    const uniqueDepartments = [...new Set(budgetData.combined.map(item => item.fdep_navn?.trim()).filter(Boolean))].sort();
    
    console.log('Unique departments (fdep_navn):', uniqueDepartments);
    console.log('Department count:', uniqueDepartments.length);
    
    // Update navigation to show actual departments as filter buttons
    updateNavigationWithDepartments(uniqueDepartments);
    
    // Add click handlers to nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const department = e.target.getAttribute('data-department');
            
            // Set active nav item
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            if (department === 'all') {
                // Show all data
                currentFilter = 'all';
            } else {
                // Filter by specific department
                currentFilter = department;
            }
            
            renderBudgetData();
        });
    });
    
    // Add search functionality
    const searchInput = document.getElementById('headerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderBudgetData();
        });
        
        // Add click handler to focus search
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.addEventListener('click', () => {
                searchInput.focus();
            });
        }
    }
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
    
    // Always use combined data for comparison view
    let dataToUse = budgetData.combined;
    
    // Filter data
    let filtered = dataToUse.filter(item => {
        // Filter by specific department
        if (currentFilter && currentFilter !== 'all') {
            if (item.fdep_navn?.trim() !== currentFilter) {
                return false;
            }
        }
        
        // Filter by search term
        if (searchTerm && !itemMatchesSearch(item, searchTerm)) {
            return false;
        }
        
        return true;
    });
    
    console.log(`Filtered data count: ${filtered.length}`);
    console.log(`Current filter: ${currentFilter}`);
    if (filtered.length > 0) {
        console.log('Sample filtered item:', filtered[0]);
    }
    
    // Sort data by kat_navn (category name) for better organization
    if (currentSort === 'alpha') {
        filtered.sort((a, b) => (a.kat_navn || '').localeCompare(b.kat_navn || ''));
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // Always show comparison view (both years)
    renderComparisonView(filtered);
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
    
    // Group by individual posts (post_nr + post_navn) for one post per chart
    const groupedByPost = {};
    
    filtered.forEach(item => {
        const key = `${item.post_nr}|||${item.post_navn}`;
        if (!groupedByPost[key]) {
            groupedByPost[key] = {
                postNr: item.post_nr,
                postNavn: item.post_navn,
                kapNr: item.kap_nr,
                kapNavn: item.kap_navn,
                gdepNavn: item.gdep_navn,
                omrNavn: item.omr_navn,
                katNavn: item.kat_navn,
                '2024': [],
                '2025': []
            };
        }
        groupedByPost[key][item.year].push(item);
    });
    
    console.log(`Grouped posts count: ${Object.keys(groupedByPost).length}`);
    // Log first few groups to debug
    const firstFewGroups = Object.values(groupedByPost).slice(0, 3);
    firstFewGroups.forEach((group, index) => {
        console.log(`Group ${index + 1}:`, {
            post: `${group.postNr} - ${group.postNavn}`,
            '2024 items': group['2024'].length,
            '2025 items': group['2025'].length
        });
    });
    
    // Group by department for section headers
    const groupedByDepartment = {};
    Object.values(groupedByPost).forEach(data => {
        const deptName = data.gdepNavn;
        if (!groupedByDepartment[deptName]) {
            groupedByDepartment[deptName] = [];
        }
        groupedByDepartment[deptName].push(data);
    });
    
    // Create department sections
    Object.entries(groupedByDepartment).forEach(([deptName, posts]) => {
        // Create department header with context
        const section = document.createElement('div');
        section.className = 'department-section';
        
        const header = document.createElement('div');
        header.className = 'department-header';
        header.innerHTML = `
            <h2>${deptName.toUpperCase()}</h2>
        `;
        section.appendChild(header);
        
        // Create cards for this department in 3-column grid
        const deptGrid = document.createElement('div');
        deptGrid.className = 'department-grid';
        
        posts.forEach(data => {
            const card = createComparisonCard(data, data['2024'], data['2025']);
            deptGrid.appendChild(card);
        });
        
        section.appendChild(deptGrid);
        grid.appendChild(section);
    });
}

// Create comparison card showing both years
function createComparisonCard(postData, items2024, items2025) {
    const card = document.createElement('div');
    card.className = 'budget-card comparison-card';
    
    // Calculate totals - handle both 'beløp' and 'belop' fields
    const total2024 = items2024.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const total2025 = items2025.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
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
    const color = DEPARTMENT_COLORS[postData.gdepNavn] || '#3b82f6';
    
    card.innerHTML = `
        <div class="budget-card-header">
            <h3>Post ${postData.postNr} · ${postData.postNavn}</h3>
            <div class="budget-card-subtitle">Kap. ${postData.kapNr} · ${postData.kapNavn}</div>
        </div>
        <div class="context-line">
            ${postData.gdepNavn} · ${postData.omrNavn} · ${postData.katNavn}
        </div>
        <div class="year-comparison">
            <div class="year-label">2024</div>
            <div class="year-amount">${formatAmount(total2024)}</div>
            <div class="year-label">2025</div>
            <div class="year-amount">${formatAmount(total2025)}</div>
            <div class="year-label"></div>
            <div class="change-percentage" style="color: ${change >= 0 ? '#00aa00' : '#aa0000'};">
                ${change >= 0 ? '↑' : '↓'} ${changeText}
            </div>
            <div class="net-change-label">NET CHANGE</div>
            <div class="net-change-value" style="color: ${change >= 0 ? '#00aa00' : '#aa0000'};">
                ${formatAmount(Math.abs(change))}
            </div>
        </div>
        <div class="chart-wrapper" style="margin-top: 0.5rem; height: 50px; position: relative; overflow: hidden;">
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
            
                    createTrendChart(canvas, total2024, total2025, `Post ${postData.postNr} · ${postData.postNavn}`);
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
            <h3>${chapName.toUpperCase()}</h3>
            <div class="budget-card-subtitle">${deptName.toUpperCase()} ${year ? `· ${year}` : ''}</div>
        </div>
        <div class="budget-amount">
            ${formatAmount(total)}
        </div>
        <div class="budget-details">
            <div class="budget-detail-row">
                <span class="budget-detail-label">Total Items:</span>
                <span class="budget-detail-value">${items.length}</span>
            </div>
            ${items.slice(0, 2).map(item => `
                <div class="budget-detail-row">
                    <span class="budget-detail-label">${(item.post_navn || 'Unknown').substring(0, 15)}${(item.post_navn || '').length > 15 ? '...' : ''}</span>
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

// Update navigation with actual departments
function updateNavigationWithDepartments(departments) {
    const navList = document.querySelector('.nav-list');
    if (!navList) {
        console.error('Nav list not found!');
        return;
    }
    
    console.log('Updating navigation with departments:', departments.length);
    
    // Clear all existing nav items
    navList.innerHTML = '';
    
    // Add "Alle" button first
    const alleItem = document.createElement('li');
    alleItem.className = 'nav-item';
    alleItem.innerHTML = `
        <a href="#" class="nav-link" data-department="all">Alle</a>
    `;
    navList.appendChild(alleItem);
    
    // Add department filter buttons with original names (truncated by CSS)
    departments.forEach(dept => {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        navItem.innerHTML = `
            <a href="#" class="nav-link" data-department="${dept}" title="${dept}">${dept}</a>
        `;
        navList.appendChild(navItem);
    });
    
    // Add search and sort at the end
    const searchItem = document.createElement('li');
    searchItem.className = 'nav-item';
    searchItem.innerHTML = `
        <div class="search-container">
            <input type="text" id="headerSearch" placeholder="Søk..." class="nav-search-input">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
            </svg>
        </div>
    `;
    navList.appendChild(searchItem);
    
    const sortItem = document.createElement('li');
    sortItem.className = 'nav-item';
    sortItem.innerHTML = `
        <button id="headerSortToggle" class="nav-sort-btn" aria-label="Sorter alfabetisk" title="Sorter alfabetisk">
            <span id="sortText">A-Z</span>
        </button>
    `;
    navList.appendChild(sortItem);
}

// Get shortened department names for navigation
function getShortDepartmentName(fullName) {
    const shortNames = {
        'Digitaliserings- og forvaltningsdepartementet': 'Digitalisering',
        'Finansdepartementet': 'Finans',
        'Forsvarsdepartementet': 'Forsvar',
        'Helse- og omsorgsdepartementet': 'Helse',
        'Justis- og beredskapsdepartementet': 'Justis',
        'Klima- og miljødepartementet': 'Klima',
        'Kommunal- og distriktsdepartementet': 'Kommunal',
        'Kultur- og likestillingsdepartementet': 'Kultur',
        'Kunnskapsdepartementet': 'Utdanning',
        'Landbruks- og matdepartementet': 'Landbruk',
        'Nærings- og fiskeridepartementet': 'Næring',
        'Samferdselsdepartementet': 'Samferdsel',
        'Utenriksdepartementet': 'Utenriks',
        'Arbeids- og inkluderingsdepartementet': 'Arbeid',
        'Barne- og familiedepartementet': 'Barnevern',
        'Energidepartementet': 'Energi',
        'Olje- og energidepartementet': 'Olje & Energi',
        'Ymse': 'Ymse'
    };
    
    return shortNames[fullName] || fullName.substring(0, 12) + '...';
}

console.log('Budget Dashboard main.js loaded');


