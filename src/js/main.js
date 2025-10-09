// main.js - Main application logic for Budget Dashboard

import { DEPARTMENT_COLORS, CHART_CONFIG, formatAmount, formatNumber } from './config.js';

console.log('Budget Dashboard loading...');

// Global state
let budgetData = null;
let currentFilter = 'all';
let currentSort = 'default';
let searchTerm = '';

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
        
        // Load the first budget file
        const response = await fetch('./data/json/20241002_gulbok_data_til_publ.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded:', data);
        
        // Extract the Data sheet
        budgetData = data.Data || data;
        console.log(`Loaded ${budgetData.length} budget items`);
        
        // Populate department filters
        populateDepartmentFilters();
        
        // Populate categories in sidebar
        populateCategories();
        
        // Render initial data
        renderBudgetData();
        
    } catch (error) {
        console.error('Error loading budget data:', error);
        showError('Kunne ikke laste budsjettdata. Vennligst prøv igjen senere.');
    }
}

// Populate department filters
function populateDepartmentFilters() {
    if (!budgetData) return;
    
    // Get unique departments
    const departments = [...new Set(budgetData.map(item => item.gdep_navn))].filter(Boolean).sort();
    
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
    if (!budgetData) return;
    
    // Get unique categories
    const categories = [...new Set(budgetData.map(item => item.kat_navn))].filter(Boolean).sort();
    
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';
    
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
    if (!budgetData) return;
    
    const grid = document.getElementById('budgetGrid');
    if (!grid) return;
    
    // Filter data
    let filtered = budgetData.filter(item => {
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
    
    // Group by department and chapter
    const grouped = groupByDepartmentAndChapter(filtered);
    
    // Render cards
    Object.entries(grouped).forEach(([deptName, chapters]) => {
        Object.entries(chapters).forEach(([chapName, items]) => {
            const card = createBudgetCard(deptName, chapName, items);
            grid.appendChild(card);
        });
    });
    
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

// Create budget card
function createBudgetCard(deptName, chapName, items) {
    const card = document.createElement('div');
    card.className = 'budget-card';
    
    // Calculate total amount
    const total = items.reduce((sum, item) => {
        const amount = parseFloat(item['beløp'] || item['belop'] || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Get department color
    const color = DEPARTMENT_COLORS[deptName] || '#3b82f6';
    
    card.innerHTML = `
        <div class="budget-card-header">
            <h3>${chapName}</h3>
            <div class="budget-card-subtitle">${deptName}</div>
        </div>
        <div class="budget-amount" style="color: ${color}">
            ${formatAmount(total)}
        </div>
        <div class="budget-details">
            <div class="budget-detail-row">
                <span class="budget-detail-label">Antall poster:</span>
                <span class="budget-detail-value">${items.length}</span>
            </div>
            ${items.slice(0, 3).map(item => `
                <div class="budget-detail-row">
                    <span class="budget-detail-label">${item.post_navn || 'Ukjent post'}</span>
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
            </div>
        `;
    }
    hideLoadingScreen();
}

console.log('Budget Dashboard main.js loaded');

