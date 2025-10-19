// Statsbudsjettet - Simple Chart Layout

console.log('Statsbudsjettet loading...');

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

// Utility functions
function formatAmount(value) {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
}

function formatNumber(value) {
    if (value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('no-NO').format(value);
}

// Global state
let budgetData = {
    '2024': null,
    '2025': null,
    '2026': null,
    combined: []
};

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const app = document.getElementById('app');
const departmentsGrid = document.getElementById('departments-grid');
const themeToggle = document.getElementById('theme-toggle');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navClose = document.getElementById('nav-close');
const navMenuItems = document.getElementById('nav-menu-items');
const totalBudget2026 = document.getElementById('total-budget-2026');
const departmentCount = document.getElementById('department-count');

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    await loadBudgetData();
    initThemeToggle();
    initLucideIcons();
    initNavigation();
    renderDepartmentCharts();
    initDrillDown();
    hideLoadingScreen();
});

// Data loading and processing
async function loadBudgetData() {
    console.log('Loading budget data...');
    const years = ['2024', '2025', '2026'];
    const filePaths = {
        '2024': './data/json/gul_bok_2024_datagrunnlag.json',
        '2025': './data/json/20241002_gulbok_data_til_publ.json',
        '2026': './data/json/2026_gulbok_datagrunnlag.json'
    };

    try {
        const fetchPromises = years.map(async (year) => {
            console.log(`Fetching ${year} data from: ${filePaths[year]}`);
            const response = await fetch(filePaths[year]);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${year}`);
            }
            const data = await response.json();
            console.log(`${year} response status: ${response.status} OK`);
            console.log(`${year} data structure:`, data);

            // Handle different data structures
            let items;
            if (data && data.Data && Array.isArray(data.Data)) {
                items = data.Data; // Data is in Data property (capital D)
            } else if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
                items = data[1]; // Data is in second element
            } else if (Array.isArray(data)) {
                items = data; // Data is directly in array
            } else if (data && data.data && Array.isArray(data.data)) {
                items = data.data; // Data is in data property (lowercase d)
                } else {
                console.error(`${year} data is not in expected format:`, data);
                console.error(`${year} data type:`, typeof data);
                if (data && typeof data === 'object') {
                    console.error(`${year} data keys:`, Object.keys(data));
                }
                throw new Error(`Invalid data format for ${year}`);
            }
            
            console.log(`${year} Data array length: ${items.length}`);
            budgetData[year] = items.map(item => ({ ...item, year: parseInt(year) }));
            console.log(`Loaded ${budgetData[year].length} budget items for ${year}`);
        });

        await Promise.all(fetchPromises);

        // Merge OLJE- OG ENERGIDEPARTEMENTET with Energidepartementet for all years
        years.forEach(year => {
            if (budgetData[year]) {
                budgetData[year] = budgetData[year].map(item => {
                    if (item.fdep_navn === 'OLJE- OG ENERGIDEPARTEMENTET') {
                        return { ...item, fdep_navn: 'Energidepartementet' };
                    }
                    return item;
                });
            }
        });

        budgetData.combined = [];
        years.forEach(year => {
            if (budgetData[year]) {
                budgetData.combined.push(...budgetData[year]);
            }
        });

        console.log('Total budget items:', budgetData.combined.length);
        console.log('Budget data loaded successfully!');
    } catch (error) {
        console.error('Failed to load budget data:', error);
        showErrorMessage('Failed to load budget data. Please try again later.');
    }
}

function showErrorMessage(message) {
    departmentsGrid.innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
            <button onclick="window.location.reload()">Reload Page</button>
        </div>
    `;
    hideLoadingScreen();
}

function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
    app.style.display = 'block';
}

// Initialize Lucide icons
function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Initialize navigation
function initNavigation() {
    // Toggle navigation menu
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('active');
    });
    
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
        }
    });
    
    // Render navigation menu items
    renderNavigationMenu();
    
    // Update quick stats
    updateQuickStats();
}

function renderNavigationMenu() {
    const departments = getUniqueDepartments();
    const departmentStats = getDepartmentStats();
    
    navMenuItems.innerHTML = '';
    
    departments.forEach(deptName => {
        const deptStat = departmentStats.find(d => d.name === deptName);
        const total2026 = deptStat ? deptStat.total2026 : 0;
        
        const menuItem = document.createElement('a');
        menuItem.className = 'nav-menu-item';
        menuItem.href = '#';
        menuItem.dataset.department = deptName;
        
        menuItem.innerHTML = `
            <div class="nav-menu-item-icon">
                <i data-lucide="building"></i>
            </div>
            <div class="nav-menu-item-content">
                <div class="nav-menu-item-title">${deptName}</div>
                <div class="nav-menu-item-subtitle">${formatAmount(total2026)}</div>
            </div>
        `;
        
        menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            showDrillDown(deptName);
            navMenu.classList.remove('active');
        });
        
        navMenuItems.appendChild(menuItem);
    });
    
    // Re-initialize Lucide icons for new content
    initLucideIcons();
}

function updateQuickStats() {
    const departmentStats = getDepartmentStats();
    const total2026 = departmentStats.reduce((sum, dept) => sum + dept.total2026, 0);
    
    if (totalBudget2026) {
        totalBudget2026.textContent = formatAmount(total2026);
    }
    
    if (departmentCount) {
        departmentCount.textContent = departmentStats.length;
    }
}

// Theme toggle functionality
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        // Re-initialize Lucide icons after theme change
        setTimeout(() => initLucideIcons(), 100);
        });
    }
}

// Get unique departments
function getUniqueDepartments() {
    const departments = new Set(budgetData.combined.map(item => 
        item.fdep_navn ? item.fdep_navn.trim() : 'Unknown'
    ));
    return Array.from(departments).sort();
}

// Get department statistics
function getDepartmentStats() {
    const departments = getUniqueDepartments();
    const departmentStats = [];

    departments.forEach(deptName => {
        const deptItems = budgetData.combined.filter(item => 
            item.fdep_navn && item.fdep_navn.trim() === deptName
        );
        
        const totals = {};
        ['2024', '2025', '2026'].forEach(year => {
            const yearItems = deptItems.filter(item => item.year === parseInt(year));
            totals[year] = yearItems.reduce((sum, item) => sum + (item.beløp || 0), 0);
            
            // Debug logging for first few departments
            if (deptName === departments[0] && yearItems.length > 0) {
                console.log(`${deptName} ${year}: ${yearItems.length} items, total: ${totals[year]}`);
                console.log('Sample item:', yearItems[0]);
                console.log('Sample beløp:', yearItems[0].beløp);
                console.log('First 3 items beløp:', yearItems.slice(0, 3).map(item => item.beløp));
            }
        });

        const total2024 = totals['2024'] || 0;
        const total2025 = totals['2025'] || 0;
        const total2026 = totals['2026'] || 0;

        const change24to25 = total2025 - total2024;
        const change25to26 = total2026 - total2025;
        const change24to26 = total2026 - total2024;

        const changePercent24to25 = total2024 !== 0 ? ((change24to25 / total2024) * 100).toFixed(2) + '%' : 'N/A';
        const changePercent25to26 = total2025 !== 0 ? ((change25to26 / total2025) * 100).toFixed(2) + '%' : 'N/A';
        const changePercent24to26 = total2024 !== 0 ? ((change24to26 / total2024) * 100).toFixed(2) + '%' : 'N/A';

        departmentStats.push({
            name: deptName,
            total2024: total2024,
            total2025: total2025,
            total2026: total2026,
            change24to25: change24to25,
            change25to26: change25to26,
            change24to26: change24to26,
            changePercent24to25: changePercent24to25,
            changePercent25to26: changePercent25to26,
            changePercent24to26: changePercent24to26,
            items: deptItems
        });
    });
    
    return departmentStats.sort((a, b) => b.total2026 - a.total2026); // Sort by 2026 total descending
}

// Render department charts
function renderDepartmentCharts() {
    const departments = getDepartmentStats();
    departmentsGrid.innerHTML = '';

    departments.forEach(dept => {
        const chartBlock = createDepartmentChartBlock(dept);
        departmentsGrid.appendChild(chartBlock);
    });
}

// Create department chart block
function createDepartmentChartBlock(dept) {
    const block = document.createElement('div');
    block.className = 'department-chart-block';
    block.setAttribute('data-department', dept.name);
    
    // Add click event to show drill-down
    block.addEventListener('click', () => {
        showDrillDown(dept.name);
    });

    block.innerHTML = `
        <div class="department-header">
            <h2 class="department-title">${dept.name}</h2>
            <p class="department-subtitle">Budsjett</p>
        </div>
        <div class="department-chart">
            <div class="chart-container" id="chart-${dept.name.replace(/\s+/g, '-')}"></div>
        </div>
    `;
    
    // Create the chart
    const chartContainer = block.querySelector('.chart-container');
    createChart(chartContainer, dept);

    return block;
}

// Create chart
function createChart(container, dept) {
    const width = 900;
    const height = 350;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const years = ['2024', '2025', '2026'];
    const amounts = [dept.total2024, dept.total2025, dept.total2026].map(amount => 
        isNaN(amount) || amount === null || amount === undefined ? 0 : amount
    );

    // Filter out any remaining invalid values
    const validAmounts = amounts.filter(amount => !isNaN(amount) && isFinite(amount));
    
    if (validAmounts.length === 0) {
        console.warn(`No valid amounts for department: ${dept.name}`);
        return;
    }

    const minAmount = Math.min(...validAmounts);
    const maxAmount = Math.max(...validAmounts);

    // Add padding to min/max for better visual
    const paddingFactor = 0.1;
    const range = maxAmount - minAmount;
    const paddedMin = range > 0 ? minAmount - range * paddingFactor : minAmount * 0.9;
    const paddedMax = range > 0 ? maxAmount + range * paddingFactor : maxAmount * 1.1;

    const xScale = (index) => margin.left + (innerWidth / (years.length - 1)) * index;
    const yScale = (amount) => {
        const safeAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
        const range = paddedMax - paddedMin;
        if (range === 0) return margin.top + innerHeight / 2; // Center if no range
        return margin.top + innerHeight - ((safeAmount - paddedMin) / range) * innerHeight;
    };

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('chart-svg');

    // Create gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'chartGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0.4');
    stop1.setAttribute('stop-color', DEPARTMENT_COLORS[dept.name] || '#0083ff');
    stop1.setAttribute('stop-opacity', '1');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '0.8');
    stop2.setAttribute('stop-color', DEPARTMENT_COLORS[dept.name] || '#0083ff');
    stop2.setAttribute('stop-opacity', '0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Create grid lines
    for (let i = 0; i <= 5; i++) {
        const y = margin.top + (innerHeight / 5) * i;
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', margin.left);
        gridLine.setAttribute('y1', y);
        gridLine.setAttribute('x2', width - margin.right);
        gridLine.setAttribute('y2', y);
        gridLine.classList.add('chart-grid-line');
        svg.appendChild(gridLine);
    }

    // Create axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', height - margin.bottom);
    xAxis.setAttribute('x2', width - margin.right);
    xAxis.setAttribute('y2', height - margin.bottom);
    xAxis.classList.add('chart-axis-line');
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', height - margin.bottom);
    yAxis.classList.add('chart-axis-line');
    svg.appendChild(yAxis);

    // Create area path
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let areaD = `M ${xScale(0)} ${height - margin.bottom}`;
    years.forEach((year, index) => {
        areaD += ` L ${xScale(index)} ${yScale(amounts[index])}`;
    });
    areaD += ` L ${xScale(years.length - 1)} ${height - margin.bottom} Z`;
    areaPath.setAttribute('d', areaD);
    areaPath.classList.add('chart-area');
    svg.appendChild(areaPath);

    // Create line path
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let lineD = `M ${xScale(0)} ${yScale(amounts[0])}`;
    for (let i = 1; i < years.length; i++) {
        lineD += ` L ${xScale(i)} ${yScale(amounts[i])}`;
    }
    linePath.setAttribute('d', lineD);
    linePath.classList.add('chart-line');
    svg.appendChild(linePath);

    // Create data points
    years.forEach((year, index) => {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', xScale(index));
        point.setAttribute('cy', yScale(amounts[index]));
        point.classList.add('chart-point');
        svg.appendChild(point);
    });

    // Create x-axis labels
    years.forEach((year, index) => {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', xScale(index));
        label.setAttribute('y', height - 10);
        label.classList.add('chart-label');
        label.textContent = year;
        svg.appendChild(label);

        // Create tick marks
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', xScale(index));
        tick.setAttribute('y1', height - margin.bottom);
        tick.setAttribute('x2', xScale(index));
        tick.setAttribute('y2', height - margin.bottom + 5);
        tick.classList.add('chart-tick');
        svg.appendChild(tick);
    });

    // Create y-axis labels
    for (let i = 0; i <= 5; i++) {
        const value = paddedMin + ((paddedMax - paddedMin) / 5) * (5 - i);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', margin.left - 10);
        label.setAttribute('y', margin.top + (innerHeight / 5) * i + 4);
        label.classList.add('chart-label-y');
        label.textContent = formatAmount(value);
        svg.appendChild(label);
    }

    container.innerHTML = '';
    container.appendChild(svg);
}

// Drill-down functionality
function initDrillDown() {
    const backButton = document.getElementById('back-button');
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    
    backButton.addEventListener('click', () => {
        showOverview();
    });
}

function showDrillDown(departmentName) {
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    const drillDownTitle = document.getElementById('drill-down-title');
    const budgetPostsGrid = document.getElementById('budget-posts-grid');
    
    // Hide overview, show drill-down
    overviewView.style.display = 'none';
    drillDownView.classList.add('active');
    
    // Update title
    drillDownTitle.textContent = departmentName;
    
    // Get department data
    const deptItems = budgetData.combined.filter(item => 
        item.fdep_navn && item.fdep_navn.trim() === departmentName
    );
    
    // Group by budget post (kap_nr + post_nr)
    const groupedPosts = {};
    deptItems.forEach(item => {
        const postKey = `${item.kap_nr}.${item.post_nr} - ${item.post_navn}`;
        if (!groupedPosts[postKey]) {
            groupedPosts[postKey] = {
                kap_nr: item.kap_nr,
                post_nr: item.post_nr,
                post_navn: item.post_navn,
                kap_navn: item.kap_navn,
                items: []
            };
        }
        groupedPosts[postKey].items.push(item);
    });
    
    // Render budget posts
    budgetPostsGrid.innerHTML = '';
    
    Object.values(groupedPosts).forEach(post => {
        const postElement = createBudgetPostElement(post);
        budgetPostsGrid.appendChild(postElement);
    });
    
    // Re-initialize Lucide icons for new content
    initLucideIcons();
}

function showOverview() {
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    
    drillDownView.classList.remove('active');
    overviewView.style.display = 'block';
}

function createBudgetPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'budget-post-item';
    
    // Calculate totals for each year
    const totals = {};
    ['2024', '2025', '2026'].forEach(year => {
        totals[year] = post.items
            .filter(item => item.year === parseInt(year))
            .reduce((sum, item) => sum + (item.beløp || 0), 0);
    });
    
    const total2024 = totals['2024'] || 0;
    const total2025 = totals['2025'] || 0;
    const total2026 = totals['2026'] || 0;
    
    const change24to26 = total2026 - total2024;
    const changePercent = total2024 !== 0 ? ((change24to26 / total2024) * 100).toFixed(1) : '0.0';
    
    postElement.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${post.kap_navn}</h3>
            <span class="post-amount">${formatAmount(total2026)}</span>
        </div>
        <div class="post-details">
            <p><strong>Post ${post.kap_nr}.${post.post_nr}:</strong> ${post.post_navn}</p>
            <p><strong>Endring 2024-2026:</strong> 
                <span style="color: ${change24to26 >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}">
                    ${change24to26 >= 0 ? '+' : ''}${formatAmount(change24to26)} (${changePercent}%)
                </span>
            </p>
        </div>
        <div class="post-chart" id="post-chart-${post.kap_nr}-${post.post_nr}"></div>
    `;
    
    // Create mini chart for this post
    const chartContainer = postElement.querySelector(`#post-chart-${post.kap_nr}-${post.post_nr}`);
    createMiniChart(chartContainer, total2024, total2025, total2026, post.post_navn);
    
    return postElement;
}

function createMiniChart(container, amount2024, amount2025, amount2026, label) {
    const width = 300;
    const height = 150;
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const years = ['2024', '2025', '2026'];
    const amounts = [amount2024, amount2025, amount2026].map(amount => 
        isNaN(amount) || amount === null || amount === undefined ? 0 : amount
    );

    const validAmounts = amounts.filter(amount => !isNaN(amount) && isFinite(amount));
    if (validAmounts.length === 0) return;

    const minAmount = Math.min(...validAmounts);
    const maxAmount = Math.max(...validAmounts);
    const range = maxAmount - minAmount;
    const paddedMin = range > 0 ? minAmount - range * 0.1 : minAmount * 0.9;
    const paddedMax = range > 0 ? maxAmount + range * 0.1 : maxAmount * 1.1;

    const xScale = (index) => margin.left + (innerWidth / (years.length - 1)) * index;
    const yScale = (amount) => {
        const safeAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
        const range = paddedMax - paddedMin;
        if (range === 0) return margin.top + innerHeight / 2;
        return margin.top + innerHeight - ((safeAmount - paddedMin) / range) * innerHeight;
    };

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('chart-svg');

    // Create line path
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let lineD = `M ${xScale(0)} ${yScale(amounts[0])}`;
    for (let i = 1; i < years.length; i++) {
        lineD += ` L ${xScale(i)} ${yScale(amounts[i])}`;
    }
    linePath.setAttribute('d', lineD);
    linePath.classList.add('chart-line');
    linePath.style.stroke = '#0083ff';
    svg.appendChild(linePath);

    // Create data points
    years.forEach((year, index) => {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', xScale(index));
        point.setAttribute('cy', yScale(amounts[index]));
        point.classList.add('chart-point');
        point.style.fill = '#0083ff';
        point.style.stroke = 'var(--bg-primary)';
        point.style.strokeWidth = '2';
        point.setAttribute('r', '3');
        svg.appendChild(point);
    });

    // Create x-axis labels
    years.forEach((year, index) => {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', xScale(index));
        label.setAttribute('y', height - 5);
        label.classList.add('chart-label');
        label.textContent = year;
        svg.appendChild(label);
    });

    container.appendChild(svg);
}

console.log('Statsbudsjettet main.js loaded');