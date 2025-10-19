// main.js - Main application logic for Budget Dashboard

console.log('Budget Dashboard loading...');

// Import configuration and utility functions
const DEPARTMENT_COLORS = {
    'Arbeids- og inkluderingsdepartementet': '#3b82f6',
    'Barne- og familiedepartementet': '#10b981',
    'Digitaliserings- og forvaltningsdepartementet': '#f59e0b',
    'Energidepartementet': '#ef4444',
    'Finansdepartementet': '#8b5cf6',
    'Forsvarsdepartementet': '#06b6d4',
    'Helse- og omsorgsdepartementet': '#84cc16',
    'Justis- og beredskapsdepartementet': '#f97316',
    'Klima- og miljødepartementet': '#22c55e',
    'Kommunal- og distriktsdepartementet': '#eab308',
    'Kultur- og likestillingsdepartementet': '#ec4899',
    'Kunnskapsdepartementet': '#6366f1',
    'Landbruks- og matdepartementet': '#14b8a6',
    'Nærings- og fiskeridepartementet': '#f43f5e',
    'Samferdselsdepartementet': '#0ea5e9',
    'Utenriksdepartementet': '#a855f7',
    'Ymse': '#64748b'
};

function formatAmount(value) {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(0) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
}

function formatNumber(value) {
    return new Intl.NumberFormat('no-NO').format(value);
}

function getDepartmentAbbreviation(deptName) {
    const abbreviations = {
        'Arbeids- og inkluderingsdepartementet': 'AID',
        'Barne- og familiedepartementet': 'BFD',
        'Digitaliserings- og forvaltningsdepartementet': 'DFD',
        'Energidepartementet': 'ED',
        'Finansdepartementet': 'FIN',
        'Forsvarsdepartementet': 'FD',
        'Helse- og omsorgsdepartementet': 'HOD',
        'Justis- og beredskapsdepartementet': 'JD',
        'Klima- og miljødepartementet': 'KLD',
        'Kommunal- og distriktsdepartementet': 'KDD',
        'Kultur- og likestillingsdepartementet': 'KUD',
        'Kunnskapsdepartementet': 'KD',
        'Landbruks- og matdepartementet': 'LMD',
        'Nærings- og fiskeridepartementet': 'NFD',
        'Samferdselsdepartementet': 'SD',
        'Utenriksdepartementet': 'UD',
        'Ymse': 'YMSE'
    };
    return abbreviations[deptName] || deptName.substring(0, 3).toUpperCase();
}


// Global state
let budgetData = {
    '2024': null,
    '2025': null,
    '2026': null,
    combined: []
};
let currentFilter = 'all';
let currentSort = 'default';
let searchTerm = '';
let currentYear = 'both'; // 'both', '2024', '2025', or '2026'

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
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
        
        // Load 2026 budget
        console.log('Fetching 2026 data from: ./data/json/2026_gulbok_datagrunnlag.json');
        let response2026;
        try {
            response2026 = await fetch('./data/json/2026_gulbok_datagrunnlag.json');
        } catch (fetchError) {
            console.error('Fetch error for 2026 data:', fetchError);
            throw new Error(`Network error loading 2026 data: ${fetchError.message}`);
        }
        
        console.log('2026 response status:', response2026.status, response2026.statusText);
        
        if (!response2026.ok) {
            throw new Error(`HTTP error loading 2026 data! status: ${response2026.status} ${response2026.statusText}`);
        }
        
        let data2026;
        try {
            data2026 = await response2026.json();
        } catch (jsonError) {
            console.error('JSON parse error for 2026 data:', jsonError);
            throw new Error(`JSON parse error for 2026 data: ${jsonError.message}`);
        }
        
        console.log('2026 data structure:', Object.keys(data2026));
        console.log('2026 Data array length:', data2026.Data ? data2026.Data.length : 'No Data key');
        
        if (!data2026.Data && !Array.isArray(data2026)) {
            throw new Error('2026 data does not contain expected Data array');
        }
        
        budgetData['2026'] = (data2026.Data || data2026).map(item => ({ ...item, year: 2026 }));
        console.log(`Loaded ${budgetData['2026'].length} budget items for 2026`);
        
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
        
        // Merge OLJE- OG ENERGIDEPARTEMENTET with Energidepartementet
        budgetData['2024'] = budgetData['2024'].map(item => ({
            ...item,
            fdep_navn: item.fdep_navn === 'Olje- og energidepartementet' ? 'Energidepartementet' : item.fdep_navn
        }));
        budgetData['2025'] = budgetData['2025'].map(item => ({
            ...item,
            fdep_navn: item.fdep_navn === 'Olje- og energidepartementet' ? 'Energidepartementet' : item.fdep_navn
        }));
        budgetData['2026'] = budgetData['2026'].map(item => ({
            ...item,
            fdep_navn: item.fdep_navn === 'Olje- og energidepartementet' ? 'Energidepartementet' : item.fdep_navn
        }));
        
        // Combine datasets
        budgetData.combined = [...budgetData['2024'], ...budgetData['2025'], ...budgetData['2026']];
        console.log(`Total budget items: ${budgetData.combined.length}`);
        
        // Setup navigation
        setupNavigation();
        
        // Set default active state to "Hjem" - wait for navigation to be created
        setTimeout(() => {
            const hjemButton = document.querySelector('.nav-link[data-department="all"]');
            if (hjemButton) {
                hjemButton.classList.add('active');
            }
            
            // Set mobile dropdown to "all" by default
            const mobileSelect = document.getElementById('mobileDepartmentSelect');
            if (mobileSelect) {
                mobileSelect.value = 'all';
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
            
            // Sync mobile dropdown
            const mobileSelect = document.getElementById('mobileDepartmentSelect');
            if (mobileSelect) {
                mobileSelect.value = department;
            }
            
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
        
        // Check for negative values (income vs expenses)
        const negativeValues = filtered.filter(item => parseFloat(item['beløp'] || item['belop'] || 0) < 0);
        const positiveValues = filtered.filter(item => parseFloat(item['beløp'] || item['belop'] || 0) > 0);
        console.log(`Negative values (income?): ${negativeValues.length}`);
        console.log(`Positive values (expenses?): ${positiveValues.length}`);
        
        if (negativeValues.length > 0) {
            console.log('Sample negative value:', negativeValues[0]);
        }
    }
    
    // Sort data by kat_navn (category name) for better organization
    if (currentSort === 'alpha') {
        filtered.sort((a, b) => (a.kat_navn || '').localeCompare(b.kat_navn || ''));
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // If on "Hjem" (all), show department aggregates
    if (currentFilter === 'all') {
        renderDepartmentAggregates(filtered);
    } else {
        // Show detailed comparison view for specific department
    renderComparisonView(filtered);
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

// Render department aggregates for "Hjem" view
function renderDepartmentAggregates(filtered) {
    const grid = document.getElementById('budgetGrid');
    
    // Group by fdep_navn
    const groupedByFdep = {};
    
    filtered.forEach(item => {
        const fdepName = item.fdep_navn?.trim() || 'Ukjent';
        if (!groupedByFdep[fdepName]) {
            groupedByFdep[fdepName] = {
                name: fdepName,
                '2024': [],
                '2025': []
            };
        }
        groupedByFdep[fdepName][item.year].push(item);
    });
    
    // Convert to array and sort alphabetically
    const departments = Object.values(groupedByFdep).sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    console.log(`Rendering ${departments.length} department aggregates`);
    
    // Create a grid container for department cards
    const deptGrid = document.createElement('div');
    deptGrid.className = 'department-grid';
    deptGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1rem;
        padding: 1rem;
    `;
    
    // Create card for each department
    departments.forEach(dept => {
        const card = createDepartmentAggregateCard(dept);
        deptGrid.appendChild(card);
    });
    
    grid.appendChild(deptGrid);
}

// Create aggregate card for department
function createDepartmentAggregateCard(deptData) {
    const card = document.createElement('div');
    card.className = 'budget-card comparison-card';
    card.style.cursor = 'pointer';
    
    // Calculate totals
    const total2024 = deptData['2024'].reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const total2025 = deptData['2025'].reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const total2026 = deptData['2026'].reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const change = total2026 - total2024;
    let changePercent = '0%';
    
    if (total2024 === 0 && total2026 > 0) {
        changePercent = '∞';
    } else if (total2024 > 0) {
        const percent = ((change / total2024) * 100);
        changePercent = percent.toFixed(1) + '%';
    }
    
    // Get department abbreviation
    const abbreviation = getDepartmentAbbreviation(deptData.name);
    
    card.innerHTML = `
        <div class="budget-card-header">
            <div class="budget-card-header-left">
                <h3>${deptData.name}</h3>
                <div class="budget-card-subtitle">${abbreviation}</div>
            </div>
            <button class="download-btn" title="Download as HTML">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
        <div class="year-comparison">
            <div class="year-label">2024</div>
            <div class="year-amount">${formatAmount(total2024)}</div>
            <div class="year-label">2025</div>
            <div class="year-amount">${formatAmount(total2025)}</div>
            <div class="year-label">2026</div>
            <div class="year-amount">${formatAmount(total2026)}</div>
            <div class="net-change-label">NET CHANGE</div>
            <div class="net-change-value" style="color: ${change >= 0 ? '#2E7D32' : '#C62828'};">
                (${change >= 0 ? '+' : ''}${changePercent}) ${formatAmount(Math.abs(change))}
            </div>
        </div>
        <div class="chart-wrapper" style="margin-top: 0.125rem; height: 200px; position: relative; overflow: hidden;">
            <div class="html-chart" style="width: 100%; height: 100%; max-height: 200px;"></div>
        </div>
    `;
    
    // Add download button functionality
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        
        // Create HTML content for download
        const cardClone = card.cloneNode(true);
        
        // Remove the download button from clone
        const downloadBtnClone = cardClone.querySelector('.download-btn');
        if (downloadBtnClone) {
            downloadBtnClone.remove();
        }
        
        // Create complete HTML document
        const htmlContent = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${deptData.name} - Statsbudsjettet</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            margin: 20px;
            background: #ffffff;
            color: #000000;
        }
        .budget-card {
            border: 1px solid #000000;
            padding: 30px;
            max-width: 90vw;
            margin: 0 auto;
            background: #ffffff;
            min-height: 60vh;
        }
        .budget-card-header-left h3 {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .budget-card-subtitle {
            font-size: 16px;
            color: #000000;
            font-weight: 400;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .year-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            font-size: 20px;
        }
        .year-label {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .year-amount {
            font-weight: 700;
            color: #000000;
            font-size: 24px;
        }
        .net-change-label {
            grid-column: 1 / -1;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 20px;
            font-size: 18px;
        }
        .net-change-value {
            grid-column: 1 / -1;
            font-weight: 700;
            margin-top: 10px;
            font-size: 22px;
        }
        .chart-wrapper {
            height: 38vh;
            border: 1px solid #e5e5e5;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
            min-height: 260px;
        }
        .html-chart {
            width: 100% !important;
            height: 100% !important;
            max-height: none !important;
        }
        .html-chart svg {
            width: 100% !important;
            height: 100% !important;
        }
        .chart-placeholder {
            text-align: center;
            color: #666666;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #666666;
        }
    </style>
</head>
<body>
    ${cardClone.outerHTML}
    <div class="footer">
        <p>Generated from Statsbudsjettet - ${new Date().toLocaleDateString('no-NO')}</p>
    </div>
</body>
</html>`;
        
        // Create and trigger download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deptData.name.replace(/[^a-zA-Z0-9]/g, '_')}_budget_card.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Add click handler to drill into department
    card.addEventListener('click', () => {
        // Set filter to this department
        currentFilter = deptData.name;
        
        // Update active nav item
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-department') === deptData.name) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Re-render with filtered data
        renderBudgetData();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Add HTML chart after card is in DOM
    setTimeout(() => {
        const chartContainer = card.querySelector('.html-chart');
        if (chartContainer) {
            createHTMLChart(chartContainer, total2024, total2025, total2026, deptData.name);
        }
    }, 100);
    
    return card;
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
                '2025': [],
                '2026': []
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
            '2025 items': group['2025'].length,
            '2026 items': group['2026'].length
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
            const card = createComparisonCard(data, data['2024'], data['2025'], data['2026']);
            deptGrid.appendChild(card);
        });
        
        section.appendChild(deptGrid);
        grid.appendChild(section);
    });
}

// Create comparison card showing both years
function createComparisonCard(postData, items2024, items2025, items2026) {
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
    
    const total2026 = items2026.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const change = total2026 - total2024;
    let changePercent = '0%';
    let changeText = '0%';
    
    if (total2024 === 0 && total2026 > 0) {
        changePercent = '∞';
        changeText = 'Ny post';
    } else if (total2024 === 0 && total2026 === 0) {
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
            <div class="budget-card-header-left">
            <h3>${postData.postNavn} (Post ${postData.postNr})</h3>
            <div class="budget-card-subtitle">${postData.kapNavn} (Kap. ${postData.kapNr})</div>
            </div>
            <button class="download-btn" title="Download as HTML">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
        <div class="context-line">
            ${postData.gdepNavn} · ${postData.omrNavn} · ${postData.katNavn}
        </div>
        <div class="year-comparison">
            <div class="year-label">2024</div>
            <div class="year-amount">${formatAmount(total2024)}</div>
            <div class="year-label">2025</div>
            <div class="year-amount">${formatAmount(total2025)}</div>
            <div class="year-label">2026</div>
            <div class="year-amount">${formatAmount(total2026)}</div>
            <div class="net-change-label">NET CHANGE</div>
            <div class="net-change-value" style="color: ${change >= 0 ? '#2E7D32' : '#C62828'};">
                (${change >= 0 ? '+' : '-'}${changeText}) ${formatAmount(Math.abs(change))}
            </div>
        </div>
        <div class="chart-wrapper" style="margin-top: 0.125rem; height: 200px; position: relative; overflow: hidden;">
            <div class="html-chart" style="width: 100%; height: 100%; max-height: 200px;"></div>
        </div>
    `;
    
    // Add download button functionality
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent any parent click events
        
        // Create HTML content for download
        const cardClone = card.cloneNode(true);
        
        // Remove the download button from clone
        const downloadBtnClone = cardClone.querySelector('.download-btn');
        if (downloadBtnClone) {
            downloadBtnClone.remove();
        }
        
        // Create complete HTML document
        const htmlContent = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${postData.postNavn} - Statsbudsjettet</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            margin: 20px;
            background: #ffffff;
            color: #000000;
        }
        .budget-card {
            border: 1px solid #000000;
            padding: 30px;
            max-width: 90vw;
            margin: 0 auto;
            background: #ffffff;
            min-height: 60vh;
        }
        .budget-card-header-left h3 {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .budget-card-subtitle {
            font-size: 16px;
            color: #000000;
            font-weight: 400;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .context-line {
            font-size: 10px;
            color: #666666;
            margin: 10px 0;
            font-style: italic;
        }
        .year-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            font-size: 20px;
        }
        .year-label {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .year-amount {
            font-weight: 700;
            color: #000000;
            font-size: 24px;
        }
        .net-change-label {
            grid-column: 1 / -1;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 20px;
            font-size: 18px;
        }
        .net-change-value {
            grid-column: 1 / -1;
            font-weight: 700;
            margin-top: 10px;
            font-size: 22px;
        }
        .chart-wrapper {
            height: 38vh;
            border: 1px solid #e5e5e5;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
            min-height: 260px;
        }
        .html-chart {
            width: 100% !important;
            height: 100% !important;
            max-height: none !important;
        }
        .html-chart svg {
            width: 100% !important;
            height: 100% !important;
        }
        .chart-placeholder {
            text-align: center;
            color: #666666;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #666666;
        }
    </style>
</head>
<body>
    ${cardClone.outerHTML}
    <div class="footer">
        <p>Generated from Statsbudsjettet - ${new Date().toLocaleDateString('no-NO')}</p>
    </div>
</body>
</html>`;
        
        // Create and trigger download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${postData.postNavn.replace(/[^a-zA-Z0-9]/g, '_')}_post_${postData.postNr}_budget_card.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Add HTML chart after card is in DOM
    setTimeout(() => {
        const chartContainer = card.querySelector('.html-chart');
        if (chartContainer) {
            createHTMLChart(chartContainer, total2024, total2025, total2026, `Post ${postData.postNr} · ${postData.postNavn}`);
        }
    }, 100); // Slightly longer delay to ensure DOM is ready
    
    return card;
}

// Create HTML/SVG chart for comparison
function createHTMLChart(container, amount2024, amount2025, amount2026, label) {
    // Clear existing content
    container.innerHTML = '';
    
    // Calculate dimensions - maximize chart area
    const width = 300; // Even wider SVG
    const height = 100; // Taller SVG
    const padding = 10; // Minimal padding to maximize chart area
    const bottomPadding = 15; // Extra padding at bottom for x-axis labels
    
    // Calculate min/max for scaling
    const minAmount = Math.min(amount2024, amount2025, amount2026);
    const maxAmount = Math.max(amount2024, amount2025, amount2026);
    const range = maxAmount - minAmount;
    const chartPadding = range * 0.1;
    
    const yMin = Math.max(0, minAmount - chartPadding);
    const yMax = maxAmount + chartPadding;
    
    // formatAmount function is now imported from config.js
    
    // Determine colors - use overall trend from 2024 to 2026
    const isIncrease = amount2026 >= amount2024;
    const lineColor = isIncrease ? '#2E7D32' : '#C62828';
    const fillColor = isIncrease ? '#2E7D32' : '#C62828';
    
    // Calculate positions - start line to the right of y-axis labels
    const x1 = 25; // Start to the right of y-axis labels
    const x2 = 155; // Middle point
    const x3 = 285; // Very close to right edge
    const y1 = height - bottomPadding - ((amount2024 - yMin) / (yMax - yMin)) * (height - padding - bottomPadding);
    const y2 = height - bottomPadding - ((amount2025 - yMin) / (yMax - yMin)) * (height - padding - bottomPadding);
    const y3 = height - bottomPadding - ((amount2026 - yMin) / (yMax - yMin)) * (height - padding - bottomPadding);
    
    // Create SVG chart that fills the container exactly
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    // Create filled area path for 3 data points
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const areaD = `M ${x1} ${height - bottomPadding} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x3} ${height - bottomPadding} Z`;
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('fill', fillColor);
    areaPath.setAttribute('fill-opacity', '0.15');
    areaPath.setAttribute('stroke', 'none');
    svg.appendChild(areaPath);
    
    // Create line segments for 3 data points
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', x1);
    line1.setAttribute('y1', y1);
    line1.setAttribute('x2', x2);
    line1.setAttribute('y2', y2);
    line1.setAttribute('stroke', lineColor);
    line1.setAttribute('stroke-width', '2');
    line1.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line1);
    
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', x2);
    line2.setAttribute('y1', y2);
    line2.setAttribute('x2', x3);
    line2.setAttribute('y2', y3);
    line2.setAttribute('stroke', lineColor);
    line2.setAttribute('stroke-width', '2');
    line2.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line2);
    
    // Add grid lines - span the chart area starting from x1
    for (let i = 1; i < 2; i++) {
        const gridY = padding + (i * (height - padding - bottomPadding) / 2);
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', x1);
        gridLine.setAttribute('y1', gridY);
        gridLine.setAttribute('x2', x3);
        gridLine.setAttribute('y2', gridY);
        gridLine.setAttribute('stroke', '#e5e5e5');
        gridLine.setAttribute('stroke-width', '0.5');
        svg.appendChild(gridLine);
    }
    
    // Add axis labels - positioned at line endpoints with smart padding
    const yearLabels = ['2024', '2025', '2026'];
    const xPositions = [x1, x2, x3];
    yearLabels.forEach((label, index) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        // Move x-axis labels slightly to the right for better alignment
        text.setAttribute('x', xPositions[index] + 3);
        // Position at bottom of chart area
        text.setAttribute('y', height - 5);
        
        // Smart text alignment: first=left, last=right, middle=middle
        let textAnchor;
        if (yearLabels.length === 1) {
            textAnchor = 'middle'; // Single label
        } else if (index === 0) {
            textAnchor = 'start'; // First label - left aligned
        } else if (index === yearLabels.length - 1) {
            textAnchor = 'end'; // Last label - right aligned
        } else {
            textAnchor = 'middle'; // Middle labels - center aligned
        }
        
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('font-family', 'Times New Roman, Times, serif');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#333333');
        text.textContent = label;
        svg.appendChild(text);
    });
    
    // Add y-axis labels - positioned with smart padding to avoid line overlap
    for (let i = 0; i <= 2; i++) {
        const value = yMin + (i * (yMax - yMin) / 2);
        const y = height - bottomPadding - (i * (height - padding - bottomPadding) / 2);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 2); // Even closer to left edge
        text.setAttribute('y', y + 3);
        text.setAttribute('text-anchor', 'start'); // Left-align
        text.setAttribute('font-family', 'Times New Roman, Times, serif');
        text.setAttribute('font-size', '7');
        text.setAttribute('fill', '#666666');
        text.textContent = formatAmount(value);
        svg.appendChild(text);
    }
    
    container.appendChild(svg);
    
    return svg;
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
    
    // Add "Hjem" button first
    const hjemItem = document.createElement('li');
    hjemItem.className = 'nav-item';
    hjemItem.innerHTML = `
        <a href="#" class="nav-link" data-department="all">Hjem</a>
    `;
    navList.appendChild(hjemItem);
    
    // Add mobile dropdown for departments
    const mobileDropdownItem = document.createElement('li');
    mobileDropdownItem.className = 'nav-item mobile-only';
    mobileDropdownItem.innerHTML = `
        <select id="mobileDepartmentSelect" class="mobile-department-select">
            <option value="all">Velg departement...</option>
        </select>
    `;
    navList.appendChild(mobileDropdownItem);
    
    // Add department filter buttons with official abbreviations (desktop only)
    departments.forEach(dept => {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item desktop-only';
        const abbreviation = getDepartmentAbbreviation(dept);
        navItem.innerHTML = `
            <a href="#" class="nav-link" data-department="${dept}" title="${dept}">${abbreviation}</a>
        `;
        navList.appendChild(navItem);
        
        // Also add to mobile dropdown
        const mobileSelect = document.getElementById('mobileDepartmentSelect');
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        mobileSelect.appendChild(option);
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
    
    // Add mobile dropdown event listener
    const mobileSelect = document.getElementById('mobileDepartmentSelect');
    if (mobileSelect) {
        mobileSelect.addEventListener('change', (e) => {
            const selectedDept = e.target.value;
            
            // Update active nav item for desktop
            document.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('data-department') === selectedDept) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            if (selectedDept === 'all') {
                currentFilter = 'all';
            } else {
                currentFilter = selectedDept;
            }
            
            renderBudgetData();
        });
    }
}

// Get official department abbreviations for navigation
// getDepartmentAbbreviation function is now imported from config.js

console.log('Budget Dashboard main.js loaded');


