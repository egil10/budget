// Modern Dashboard JavaScript - Statsbudsjettet

console.log('Budget Dashboard loading...');

// Configuration and utility functions
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

const DEPARTMENT_ABBREVIATIONS = {
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

// Utility functions
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
    return DEPARTMENT_ABBREVIATIONS[deptName] || deptName.substring(0, 3).toUpperCase();
}

// Global state
let budgetData = {
    '2024': null,
    '2025': null,
    '2026': null,
    combined: []
};

let currentView = 'overview';
let currentSort = 'budget';
let currentSortOrder = 'desc';

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
    try {
        await loadBudgetData();
        initializeDashboard();
        hideLoadingScreen();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showError('Kunne ikke laste budsjettdata. Vennligst last siden på nytt.');
    }
});

// Load budget data from JSON files
async function loadBudgetData() {
    console.log('Loading budget data...');
    
    try {
        // Load 2025 data
        const response2025 = await fetch('./data/json/20241002_gulbok_data_til_publ.json');
        if (!response2025.ok) throw new Error(`HTTP error! status: ${response2025.status}`);
        const data2025 = await response2025.json();
        budgetData['2025'] = data2025.Data;
        console.log(`Loaded ${data2025.Data.length} budget items for 2025`);

        // Load 2026 data
        const response2026 = await fetch('./data/json/2026_gulbok_datagrunnlag.json');
        if (!response2026.ok) throw new Error(`HTTP error! status: ${response2026.status}`);
        const data2026 = await response2026.json();
        budgetData['2026'] = data2026.Data;
        console.log(`Loaded ${data2026.Data.length} budget items for 2026`);

        // Load 2024 data
        const response2024 = await fetch('./data/json/gul_bok_2024_datagrunnlag.json');
        if (!response2024.ok) throw new Error(`HTTP error! status: ${response2024.status}`);
        const data2024 = await response2024.json();
        budgetData['2024'] = data2024.Data;
        console.log(`Loaded ${data2024.Data.length} budget items for 2024`);

        // Merge OLJE- OG ENERGIDEPARTEMENTET with Energidepartementet for 2026
        if (budgetData['2026']) {
            budgetData['2026'] = budgetData['2026'].map(item => {
                if (item.fdep_navn === 'OLJE- OG ENERGIDEPARTEMENTET') {
                    return { ...item, fdep_navn: 'Energidepartementet' };
                }
                return item;
            });
        }

        // Combine all data
        budgetData.combined = [
            ...(budgetData['2024'] || []).map(item => ({ ...item, year: '2024' })),
            ...(budgetData['2025'] || []).map(item => ({ ...item, year: '2025' })),
            ...(budgetData['2026'] || []).map(item => ({ ...item, year: '2026' }))
        ];

        console.log(`Total budget items: ${budgetData.combined.length}`);
        console.log('Budget data loaded successfully!');
        
    } catch (error) {
        console.error('Error loading budget data:', error);
        throw error;
    }
}

// Initialize dashboard components
function initializeDashboard() {
    updateOverviewStats();
    renderDepartmentLeaderboard();
    setupEventListeners();
}

// Update overview statistics
function updateOverviewStats() {
    const total2026 = calculateTotalBudget('2026');
    const total2024 = calculateTotalBudget('2024');
    const growth = ((total2026 - total2024) / total2024 * 100);
    const departments = getUniqueDepartments().length;
    const budgetItems = budgetData.combined.length;

    document.getElementById('total-budget-2026').textContent = formatAmount(total2026) + ' kr';
    document.getElementById('budget-growth').textContent = growth.toFixed(1) + '%';
    document.getElementById('active-departments').textContent = departments;
    document.getElementById('budget-items').textContent = formatNumber(budgetItems);
}

// Calculate total budget for a specific year
function calculateTotalBudget(year) {
    const yearData = budgetData[year];
    if (!yearData) return 0;
    
    return yearData.reduce((total, item) => {
        return total + (item.beløp || 0);
    }, 0);
}

// Get unique departments
function getUniqueDepartments() {
    const departments = new Set();
    budgetData.combined.forEach(item => {
        if (item.fdep_navn) {
            departments.add(item.fdep_navn);
        }
    });
    return Array.from(departments);
}

// Render department leaderboard
function renderDepartmentLeaderboard() {
    const departments = getDepartmentStats();
    const leaderboardGrid = document.getElementById('leaderboard-grid');
    
    leaderboardGrid.innerHTML = '';
    
    departments.forEach((dept, index) => {
        const card = createDepartmentCard(dept, index + 1);
        leaderboardGrid.appendChild(card);
    });
}

// Get department statistics
function getDepartmentStats() {
    const departments = getUniqueDepartments();
    const departmentStats = departments.map(deptName => {
        const dept2024 = budgetData['2024']?.filter(item => item.fdep_navn === deptName) || [];
        const dept2025 = budgetData['2025']?.filter(item => item.fdep_navn === deptName) || [];
        const dept2026 = budgetData['2026']?.filter(item => item.fdep_navn === deptName) || [];

        const total2024 = dept2024.reduce((sum, item) => sum + (item.beløp || 0), 0);
        const total2025 = dept2025.reduce((sum, item) => sum + (item.beløp || 0), 0);
        const total2026 = dept2026.reduce((sum, item) => sum + (item.beløp || 0), 0);

        const growth = total2024 > 0 ? ((total2026 - total2024) / total2024 * 100) : 0;

        return {
            name: deptName,
            abbreviation: getDepartmentAbbreviation(deptName),
            total2024,
            total2025,
            total2026,
            growth,
            color: DEPARTMENT_COLORS[deptName] || '#64748b'
        };
    });

    // Sort based on current sort setting
    if (currentSort === 'budget') {
        departmentStats.sort((a, b) => currentSortOrder === 'desc' ? b.total2026 - a.total2026 : a.total2026 - b.total2026);
    } else if (currentSort === 'growth') {
        departmentStats.sort((a, b) => currentSortOrder === 'desc' ? b.growth - a.growth : a.growth - b.growth);
    }

    return departmentStats;
}

// Create department card
function createDepartmentCard(dept, rank) {
    const card = document.createElement('div');
    card.className = 'department-card';
    card.style.borderLeftColor = dept.color;
    card.style.borderLeftWidth = '4px';
    
    const isTop3 = rank <= 3;
    const trendClass = dept.growth > 0 ? 'trend-positive' : dept.growth < 0 ? 'trend-negative' : 'trend-neutral';
    const trendIcon = dept.growth > 0 ? '↗' : dept.growth < 0 ? '↘' : '→';
    
    card.innerHTML = `
        <div class="department-card-header">
            <div>
                <h3 class="department-name">${dept.name}</h3>
                <p class="department-abbrev">${dept.abbreviation}</p>
            </div>
            <div class="department-rank ${isTop3 ? 'top-3' : ''}">${rank}</div>
        </div>
        
        <div class="department-stats">
            <div class="stat-item">
                <div class="stat-item-label">Budsjett 2026</div>
                <div class="stat-item-value">${formatAmount(dept.total2026)} kr</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Vekst</div>
                <div class="stat-item-value">${dept.growth.toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="department-trend ${trendClass}">
            <span class="trend-icon">${trendIcon}</span>
            <span>${Math.abs(dept.growth).toFixed(1)}% ${dept.growth >= 0 ? 'økning' : 'reduksjon'}</span>
        </div>
    `;
    
    // Add click handler for drill-down
    card.addEventListener('click', () => {
        showDepartmentDetails(dept);
    });
    
    return card;
}

// Show department details
function showDepartmentDetails(dept) {
    const content = document.getElementById('content');
    
    // Hide leaderboard
    document.getElementById('department-leaderboard').style.display = 'none';
    
    // Create department detail view
    content.innerHTML = `
        <div class="department-detail">
            <div class="detail-header">
                <button class="back-btn" onclick="showOverview()">← Tilbake til oversikt</button>
                <h2>${dept.name}</h2>
                <p>Detaljert budsjettanalyse</p>
            </div>
            
            <div class="detail-stats">
                <div class="detail-stat-card">
                    <h3>Budsjett 2026</h3>
                    <div class="detail-stat-value">${formatAmount(dept.total2026)} kr</div>
                </div>
                <div class="detail-stat-card">
                    <h3>Vekst 2024-2026</h3>
                    <div class="detail-stat-value ${dept.growth >= 0 ? 'positive' : 'negative'}">${dept.growth.toFixed(1)}%</div>
                </div>
                <div class="detail-stat-card">
                    <h3>Endring</h3>
                    <div class="detail-stat-value">${formatAmount(dept.total2026 - dept.total2024)} kr</div>
                </div>
            </div>
            
            <div class="detail-charts">
                <div class="chart-container">
                    <h3>Budsjettutvikling</h3>
                    <div class="html-chart" id="dept-chart"></div>
                </div>
            </div>
        </div>
    `;
    
    // Create chart for department
    createDepartmentChart(dept);
}

// Create department chart
function createDepartmentChart(dept) {
    const chartContainer = document.getElementById('dept-chart');
    if (!chartContainer) return;
    
    const amounts = [dept.total2024, dept.total2025, dept.total2026];
    const years = ['2024', '2025', '2026'];
    
    createHTMLChart(chartContainer, amounts[0], amounts[1], amounts[2], dept.name);
}

// Create HTML/SVG chart
function createHTMLChart(container, amount2024, amount2025, amount2026, label) {
    const width = 400;
    const height = 200;
    const padding = 40;
    
    const amounts = [amount2024, amount2025, amount2026];
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);
    const range = maxAmount - minAmount;
    
    const x1 = padding;
    const x2 = width / 2;
    const x3 = width - padding;
    
    const y1 = height - padding - ((amounts[0] - minAmount) / range * (height - 2 * padding));
    const y2 = height - padding - ((amounts[1] - minAmount) / range * (height - 2 * padding));
    const y3 = height - padding - ((amounts[2] - minAmount) / range * (height - 2 * padding));
    
    const isIncrease = amount2026 >= amount2024;
    const color = isIncrease ? '#10b981' : '#ef4444';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    // Area path
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', `M ${x1} ${height - padding} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x3} ${height - padding} Z`);
    areaPath.setAttribute('fill', color);
    areaPath.setAttribute('fill-opacity', '0.15');
    areaPath.setAttribute('stroke', 'none');
    svg.appendChild(areaPath);
    
    // Main line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('fill', 'none');
    svg.appendChild(line);
    
    // Grid line
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', x1);
    gridLine.setAttribute('y1', height / 2);
    gridLine.setAttribute('x2', x3);
    gridLine.setAttribute('y2', height / 2);
    gridLine.setAttribute('stroke', '#e5e5e5');
    gridLine.setAttribute('stroke-width', '0.5');
    svg.appendChild(gridLine);
    
    // Year labels
    const years = ['2024', '2025', '2026'];
    const xPositions = [x1, x2, x3];
    
    years.forEach((year, index) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xPositions[index]);
        text.setAttribute('y', height - 8);
        text.setAttribute('text-anchor', index === 0 ? 'start' : index === years.length - 1 ? 'end' : 'middle');
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', '#64748b');
        text.textContent = year;
        svg.appendChild(text);
    });
    
    // Y-axis labels
    const yLabels = [
        { value: minAmount, position: height - padding },
        { value: (minAmount + maxAmount) / 2, position: height / 2 },
        { value: maxAmount, position: padding }
    ];
    
    yLabels.forEach(label => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x1 - 5);
        text.setAttribute('y', label.position + 4);
        text.setAttribute('text-anchor', 'start');
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#64748b');
        text.textContent = formatAmount(label.value);
        svg.appendChild(text);
    });
    
    container.innerHTML = '';
    container.appendChild(svg);
}

// Show overview
function showOverview() {
    document.getElementById('department-leaderboard').style.display = 'block';
    document.getElementById('content').innerHTML = '';
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = e.target.dataset.filter;
            setActiveNavLink(e.target);
            
            if (filter === 'all') {
                showOverview();
            }
        });
    });
    
    // View controls
    document.querySelectorAll('.view-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.view-toggle').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            if (e.target.dataset.view === 'budget') {
                currentSort = 'budget';
            } else if (e.target.dataset.view === 'growth') {
                currentSort = 'growth';
            }
            
            renderDepartmentLeaderboard();
        });
    });
    
    // Sort toggle
    document.querySelectorAll('.sort-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
            e.target.textContent = currentSortOrder === 'desc' ? 'Størst' : 'Minst';
            renderDepartmentLeaderboard();
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('theme', newTheme);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Set active navigation link
function setActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    if (loadingScreen && app) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            app.style.display = 'block';
        }, 500);
    }
}

// Show error message
function showError(message) {
    const content = document.getElementById('content');
    if (content) {
        content.innerHTML = `
            <div class="error-message">
                <h2>Feil ved lasting av data</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()">Last siden på nytt</button>
            </div>
        `;
    }
}

console.log('Budget Dashboard main.js loaded');