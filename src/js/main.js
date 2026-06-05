// Copy chart data as TSV to clipboard
function copyChartData(dept) {
    const rows = [
        'date\tvalue\tindex',
        `2024-01-01\t${dept.total2024}\t1`,
        `2025-01-01\t${dept.total2025}\t2`,
        `2026-01-01\t${dept.total2026}\t3`
    ];
    const tsv = rows.join('\n');
    const doCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(tsv);
        }
        return new Promise(resolve => {
            const textarea = document.createElement('textarea');
            textarea.value = tsv;
            document.body.appendChild(textarea);
            textarea.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(textarea);
            resolve();
        });
    };
    return doCopy();
}

// Download CSV of the chart data
function downloadChartCSV(dept) {
    return new Promise((resolve) => {
        const rows = [
            ['date', 'value', 'index'],
            ['2024-01-01', String(dept.total2024), '1'],
            ['2025-01-01', String(dept.total2025), '2'],
            ['2026-01-01', String(dept.total2026), '3']
        ];
        const csv = rows.map(r => r.map(v => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dept.name.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
    });
}

// Utility: temporary icon feedback
function setButtonIcon(buttonEl, iconName) {
    const i = buttonEl.querySelector('i');
    if (!i) return;
    i.setAttribute('data-lucide', iconName);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function withIconFeedback(buttonEl, baselineIcon, actionPromise) {
    Promise.resolve(actionPromise).then(() => {
        // Swap to a success checkmark with a brief pop
        setButtonIcon(buttonEl, 'check');
        const icon = buttonEl.querySelector('i');
        if (icon) {
            icon.style.color = 'var(--accent-success)';
            icon.style.transform = 'scale(1.1)';
            icon.style.transition = 'all 0.2s ease';
        }
        setTimeout(() => {
            setButtonIcon(buttonEl, baselineIcon);
            if (icon) {
                icon.style.color = '';
                icon.style.transform = '';
            }
        }, 1000);
    }).catch(() => {
        // Brief error feedback, then revert to baseline
        const icon = buttonEl.querySelector('i');
        if (icon) {
            icon.style.color = 'var(--accent-danger)';
            icon.style.transform = 'scale(0.9)';
            icon.style.transition = 'all 0.2s ease';
        }
        setTimeout(() => {
            setButtonIcon(buttonEl, baselineIcon);
            if (icon) {
                icon.style.color = '';
                icon.style.transform = '';
            }
        }, 800);
    });
    // ensure baseline icon first
    setButtonIcon(buttonEl, baselineIcon);
}
// Statsbudsjettet - Simple Chart Layout

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
    if (value === null || value === undefined || isNaN(value)) return '0';
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1000000000) {
        return sign + (abs / 1000000000).toFixed(1) + 'B';
    } else if (abs >= 1000000) {
        return sign + (abs / 1000000).toFixed(1) + 'M';
    } else if (abs >= 1000) {
        return sign + (abs / 1000).toFixed(1) + 'K';
    }
    return sign + abs.toFixed(0);
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

// Derived caches (built once after data loads) to avoid repeated O(n) scans of
// `budgetData.combined`. Without these, every render/resize re-filtered the full
// ~30k-row dataset once per department, which is the dominant cost on this page.
let departmentIndex = new Map();   // department name -> array of its items
let departmentStatsCache = null;   // sorted stats array, memoised
let uniqueDepartmentsCache = null; // sorted unique department names

function buildDerivedCaches() {
    departmentIndex = new Map();
    budgetData.combined.forEach(item => {
        const name = item.fdep_navn ? item.fdep_navn.trim() : 'Unknown';
        let bucket = departmentIndex.get(name);
        if (!bucket) {
            bucket = [];
            departmentIndex.set(name, bucket);
        }
        bucket.push(item);
    });
    uniqueDepartmentsCache = Array.from(departmentIndex.keys()).sort();
    departmentStatsCache = null; // recomputed lazily on next getDepartmentStats()
}

// Navigation state
let navigationPath = ['Statsbudsjettet'];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const app = document.getElementById('app');
const departmentsGrid = document.getElementById('departments-grid');
const themeToggle = null; // removed
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navClose = document.getElementById('nav-close');
const navMenuItems = document.getElementById('nav-menu-items');
const totalBudget2026 = document.getElementById('total-budget-2026');
const departmentCount = document.getElementById('department-count');
const siteTitle = document.getElementById('site-title');
const drillUpButton = document.getElementById('drill-up-button');

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadBudgetData();
    // Force light theme
    document.documentElement.setAttribute('data-theme', 'light');
    initLucideIcons();
    initNavigation();
    initSiteTitle();
    initDrillUp();
    renderDepartmentCharts();
    // Ensure icons are rendered for initial buttons
    setTimeout(() => initLucideIcons(), 0);
    initDrillDown();
    initMobileFilter();
    initResponsiveHandlers();
    // Show a brief brand flash, then reveal the app (data + charts are already ready)
    setTimeout(() => {
        hideLoadingScreen();
    }, 350);
});

// Data loading and processing
async function loadBudgetData() {
    const years = ['2024', '2025', '2026'];
    const filePaths = {
        '2024': './data/json/gul_bok_2024_datagrunnlag.json',
        '2025': './data/json/20241002_gulbok_data_til_publ.json',
        '2026': './data/json/2026_gulbok_datagrunnlag.json'
    };

    try {
        const fetchPromises = years.map(async (year) => {
            const response = await fetch(filePaths[year]);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${year}`);
            }
            const data = await response.json();

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
                console.error(`Invalid data format for ${year}`, data);
                throw new Error(`Invalid data format for ${year}`);
            }

            const yearNum = parseInt(year);
            budgetData[year] = items.map(item => ({ ...item, year: yearNum }));
        });

        await Promise.all(fetchPromises);

        // Normalize department naming across years (trim + map renames)
        years.forEach(year => {
            if (budgetData[year]) {
                budgetData[year] = budgetData[year].map(item => {
                    const originalName = item.fdep_navn || '';
                    const trimmedName = typeof originalName === 'string' ? originalName.trim() : originalName;
                    const lowerName = (trimmedName || '').toLowerCase();

                    let normalizedName = trimmedName;
                    // Harmonize 2024 "Olje- og energidepartementet" to "Energidepartementet"
                    if (lowerName === 'olje- og energidepartementet') {
                        normalizedName = 'Energidepartementet';
                    }
                    // Ensure consistent casing/spacing for Energidepartementet
                    if (lowerName === 'energidepartementet') {
                        normalizedName = 'Energidepartementet';
                    }

                    return { ...item, fdep_navn: normalizedName };
                });
            }
        });

        budgetData.combined = [];
        years.forEach(year => {
            if (budgetData[year]) {
                budgetData.combined.push(...budgetData[year]);
            }
        });

        // Build the department index + stats caches once, up front.
        buildDerivedCaches();
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

// Update header title with breadcrumbs
function updateHeaderTitle() {
    if (siteTitle && navigationPath.length > 0) {
        let breadcrumbHTML = '';
        navigationPath.forEach((item, index) => {
            if (index === 0) {
                breadcrumbHTML += `<span class="breadcrumb-item" data-index="${index}">${item}</span>`;
            } else {
                breadcrumbHTML += `<span class="breadcrumb-separator">→</span><span class="breadcrumb-item" data-index="${index}">${item}</span>`;
            }
        });
        siteTitle.innerHTML = breadcrumbHTML;

        // Show drill-up button when not at main view
        if (drillUpButton) {
            drillUpButton.style.display = navigationPath.length > 1 ? 'flex' : 'none';
        }

        // Keep mobile filter in sync with current path
        syncMobileFilterWithPath();
    }
}

// Initialize site title click handler
function initSiteTitle() {
    if (!siteTitle) return;
    siteTitle.addEventListener('click', (e) => {
        const crumb = e.target.closest('.breadcrumb-item');
        if (!crumb) return;
        const index = parseInt(crumb.getAttribute('data-index') || '-1', 10);
        if (isNaN(index) || index < 0) return;
        handleBreadcrumbClick(index);
    });
}

function getChapterByName(departmentName, chapterName) {
    const deptItems = getDepartmentItems(departmentName);
    const groupedPosts = {};
    deptItems.forEach(item => {
        const chapterKey = item.kap_navn;
        if (!groupedPosts[chapterKey]) {
            groupedPosts[chapterKey] = {
                kap_navn: item.kap_navn,
                items: [],
                posts: {}
            };
        }
        groupedPosts[chapterKey].items.push(item);

        const postKey = `${item.kap_nr}.${item.post_nr} - ${item.post_navn}`;
        if (!groupedPosts[chapterKey].posts[postKey]) {
            groupedPosts[chapterKey].posts[postKey] = {
                kap_nr: item.kap_nr,
                post_nr: item.post_nr,
                post_navn: item.post_navn,
                items: []
            };
        }
        groupedPosts[chapterKey].posts[postKey].items.push(item);
    });
    return groupedPosts[chapterName] || null;
}

function handleBreadcrumbClick(index) {
    if (index === 0) {
        // Hard refresh to load the main page
        window.location.reload();
        return;
    }
    if (index === 1) {
        const departmentName = navigationPath[1];
        if (departmentName) showDrillDown(departmentName);
        return;
    }
    if (index === 2) {
        const departmentName = navigationPath[1];
        const chapterName = navigationPath[2];
        if (!departmentName || !chapterName) return;
        const chapter = getChapterByName(departmentName, chapterName);
        if (chapter) showBudgetChapterDetails(chapter);
        return;
    }
    if (index === 3) {
        const departmentName = navigationPath[1];
        const chapterName = navigationPath[2];
        const postName = navigationPath[3];
        if (!departmentName || !chapterName || !postName) return;
        const chapter = getChapterByName(departmentName, chapterName);
        if (!chapter) return;
        const post = Object.values(chapter.posts).find(p => p.post_navn === postName);
        if (post) showBudgetPostDetails(post);
        return;
    }
}

// Initialize drill-up functionality
function initDrillUp() {
    if (drillUpButton) {
        drillUpButton.addEventListener('click', () => {
            drillUpOneLevel();
        });
    }
}

// Initialize responsive handlers
function initResponsiveHandlers() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-render charts when window is resized
            if (budgetData.combined.length > 0) {
                renderDepartmentCharts();
            }
            updateMobileFilterVisibility();
            syncMobileFilterWithPath();
        }, 250);
    });
}

// --- Mobile native filter ---
let mobileFilterSelect = null;

function initMobileFilter() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer) return;
    // Avoid duplicates
    mobileFilterSelect = document.getElementById('mobile-dept-select');
    if (!mobileFilterSelect) {
        mobileFilterSelect = document.createElement('select');
        mobileFilterSelect.id = 'mobile-dept-select';
        mobileFilterSelect.className = 'mobile-filter';
        headerContainer.appendChild(mobileFilterSelect);
    }
    populateMobileFilter();
    updateMobileFilterVisibility();
    syncMobileFilterWithPath();
    mobileFilterSelect.addEventListener('change', () => {
        const value = mobileFilterSelect.value;
        if (value) {
            showDrillDown(value);
            // Close nav if open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

function populateMobileFilter() {
    if (!mobileFilterSelect) return;
    const departments = getUniqueDepartments();
    const currentValue = mobileFilterSelect.value;
    const frag = document.createDocumentFragment();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Velg departement…';
    frag.appendChild(placeholder);

    departments.forEach((dept) => {
        const opt = document.createElement('option');
        opt.value = dept;
        opt.textContent = dept;
        frag.appendChild(opt);
    });

    mobileFilterSelect.innerHTML = '';
    mobileFilterSelect.appendChild(frag);
    if (currentValue) mobileFilterSelect.value = currentValue;
}

function updateMobileFilterVisibility() {
    if (!mobileFilterSelect) return;
    const isMobile = window.innerWidth <= 768;
    mobileFilterSelect.style.display = isMobile ? 'block' : 'none';
}

function syncMobileFilterWithPath() {
    if (!mobileFilterSelect) return;
    const departmentName = navigationPath[1];
    if (departmentName) {
        if (mobileFilterSelect.value !== departmentName) {
            mobileFilterSelect.value = departmentName;
        }
    } else {
        if (mobileFilterSelect.value !== '') {
            mobileFilterSelect.value = '';
        }
    }
}

// Drill up one level
function drillUpOneLevel() {
    if (navigationPath.length <= 1) {
        return; // Already at top level
    }
    
    // Store current path length to determine where we're going back to
    const currentPathLength = navigationPath.length;
    
    // Remove the last item from navigation path
    navigationPath.pop();
    updateHeaderTitle();
    
    // Navigate back to the appropriate view based on the new path length
    if (navigationPath.length === 1) {
        // Back to main view
        showOverview();
    } else if (navigationPath.length === 2) {
        // Back to department view
        const departmentName = navigationPath[1];
        showDrillDown(departmentName);
    } else if (navigationPath.length === 3) {
        // Back to chapter view - need to find the chapter and show its details
        const departmentName = navigationPath[1];
        const chapterName = navigationPath[2];
        
        // Find the chapter data and show its details
        const deptItems = getDepartmentItems(departmentName);

        const groupedPosts = {};
        deptItems.forEach(item => {
            const chapterKey = item.kap_navn;
            if (!groupedPosts[chapterKey]) {
                groupedPosts[chapterKey] = {
                    kap_navn: item.kap_navn,
                    items: [],
                    posts: {}
                };
            }
            groupedPosts[chapterKey].items.push(item);
            
            const postKey = `${item.kap_nr}.${item.post_nr} - ${item.post_navn}`;
            if (!groupedPosts[chapterKey].posts[postKey]) {
                groupedPosts[chapterKey].posts[postKey] = {
                    kap_nr: item.kap_nr,
                    post_nr: item.post_nr,
                    post_navn: item.post_navn,
                    items: []
                };
            }
            groupedPosts[chapterKey].posts[postKey].items.push(item);
        });
        
        const chapter = groupedPosts[chapterName];
        if (chapter) {
            showBudgetChapterDetails(chapter);
        } else {
            // Fallback to department view if chapter not found
            showDrillDown(departmentName);
        }
    }
}

// Initialize navigation
function initNavigation() {
    // Toggle navigation menu
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('active');
        document.body.classList.add('nav-open');
    });
    
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.classList.remove('nav-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
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
// Theme toggle removed; always light theme

// Get unique departments (cached, sorted)
function getUniqueDepartments() {
    if (uniqueDepartmentsCache) return uniqueDepartmentsCache;
    return Array.from(new Set(budgetData.combined.map(item =>
        item.fdep_navn ? item.fdep_navn.trim() : 'Unknown'
    ))).sort();
}

// Items for a single department, via the prebuilt index (falls back to a scan).
function getDepartmentItems(deptName) {
    if (departmentIndex.has(deptName)) return departmentIndex.get(deptName);
    return budgetData.combined.filter(item =>
        item.fdep_navn && item.fdep_navn.trim() === deptName
    );
}

// Get department statistics (memoised; sorted by 2026 total descending)
function getDepartmentStats() {
    if (departmentStatsCache) return departmentStatsCache;

    const departments = getUniqueDepartments();
    const departmentStats = [];

    departments.forEach(deptName => {
        const deptItems = getDepartmentItems(deptName);

        // Single pass over the department's items to total all three years.
        const totals = { '2024': 0, '2025': 0, '2026': 0 };
        deptItems.forEach(item => {
            totals[item.year] += (item.beløp || 0);
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

    departmentStatsCache = departmentStats.sort((a, b) => b.total2026 - a.total2026); // Sort by 2026 total descending
    return departmentStatsCache;
}

// Aggregate stats for entire budget
function getAggregateStats() {
    const totals = { '2024': 0, '2025': 0, '2026': 0 };
    ['2024', '2025', '2026'].forEach(year => {
        const yearItems = budgetData.combined.filter(item => item.year === parseInt(year));
        totals[year] = yearItems.reduce((sum, item) => sum + (item.beløp || 0), 0);
    });
    return {
        name: 'Totalt statsbudsjett',
        total2024: totals['2024'] || 0,
        total2025: totals['2025'] || 0,
        total2026: totals['2026'] || 0
    };
}

// Render department charts
function renderDepartmentCharts() {
    const departments = getDepartmentStats();
    departmentsGrid.innerHTML = '';

    // Render aggregate chart first
    const aggregate = getAggregateStats();
    const aggregateBlock = createDepartmentChartBlock(aggregate);
    aggregateBlock.querySelector('.department-subtitle').textContent = 'Totalt';
    departmentsGrid.appendChild(aggregateBlock);

    departments.forEach(dept => {
        const chartBlock = createDepartmentChartBlock(dept);
        departmentsGrid.appendChild(chartBlock);
    });

    // Ensure lucide icons render for newly inserted buttons
    initLucideIcons();
}

// Create department chart block
function createDepartmentChartBlock(dept) {
    const block = document.createElement('div');
    block.className = 'department-chart-block';
    block.setAttribute('data-department', dept.name);

    // Get department metadata
    const deptItems = getDepartmentItems(dept.name);
    const uniqueChapters = new Set(deptItems.map(item => item.kap_navn)).size;
    const chapterCount = uniqueChapters;
    
    // Calculate change from 2024 to 2026
    const change24to26 = dept.total2026 - dept.total2024;
    const changePercent = dept.total2024 !== 0 ? ((change24to26 / dept.total2024) * 100).toFixed(1) : '0.0';
    const changeText = change24to26 >= 0 ? `+${formatAmount(change24to26)} (+${changePercent}%)` : `${formatAmount(change24to26)} (${changePercent}%)`;

    block.innerHTML = `
        <div class="department-header">
            <div class="department-header-top">
                <h2 class="department-title">${dept.name}</h2>
                <div class="department-actions">
                    <button class="chart-copy" title="Kopier data" aria-label="Kopier data">
                        <i data-lucide="clipboard"></i>
                    </button>
                    <button class="chart-download" title="Last ned" aria-label="Last ned">
                        <i data-lucide="download"></i>
                    </button>
        </div>
        </div>
            <div class="department-subtitle">
                <span class="dept-change">Endring 2024-2026: <span style="color: ${change24to26 >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}">${changeText}</span></span>
                <span class="dept-years">2024: ${formatAmount(dept.total2024)} · 2025: ${formatAmount(dept.total2025)} · 2026: ${formatAmount(dept.total2026)}</span>
                <span class="dept-posts">Antall kapitler: ${chapterCount}</span>
            </div>
        </div>
        <div class="department-chart">
            <div class="chart-container" id="chart-${dept.name.replace(/\s+/g, '-')}"></div>
        </div>
    `;
    
    // Add click event to title for drill-down (disabled for Totalt statsbudsjett)
    const titleElement = block.querySelector('.department-title');
    if (dept.name !== 'Totalt statsbudsjett') {
        titleElement.addEventListener('click', () => {
            showDrillDown(dept.name);
        });
    }
    
    // Create the chart
    const chartContainer = block.querySelector('.chart-container');
    createChart(chartContainer, dept);

    // Hook actions
    const copyBtn = block.querySelector('.chart-copy');
    const downloadBtn = block.querySelector('.chart-download');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            withIconFeedback(copyBtn, 'clipboard', copyChartData(dept));
        });
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            withIconFeedback(downloadBtn, 'download', downloadChartCSV(dept));
        });
    }

    return block;
}

// Create chart
function createChart(container, dept) {
    // Responsive sizing based on screen width
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let width, height;
    if (isSmallMobile) {
        width = 280;
        height = 200;
    } else if (isMobile) {
        width = 400;
        height = 250;
            } else {
        width = 900;
        height = 350;
    }
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

    // Robust y-domain selection
    const paddingFactor = 0.1;
    const baseRange = maxAmount - minAmount;
    const hasNegative = minAmount < 0;
    let paddedMin;
    let paddedMax;
    if (baseRange === 0) {
        // All values equal: small band around the value
        paddedMin = Math.min(Math.max(0, maxAmount * 0.9), maxAmount);
        paddedMax = maxAmount * 1.1;
    } else {
        if (hasNegative) {
            // Clamp lower bound to at least -100M to avoid -billions
            paddedMin = Math.max(-100000000, minAmount - baseRange * 0.1);
        } else {
            // No negatives: allow a little headroom but never below 0
            paddedMin = Math.max(0, minAmount - baseRange * 0.2);
        }
        paddedMax = maxAmount + baseRange * 0.1;
        if (paddedMax <= paddedMin) paddedMax = paddedMin + Math.max(1, baseRange * 0.2);
    }

    const xScale = (index) => margin.left + (innerWidth / (years.length - 1)) * index;
    const yScale = (amount) => {
        const safeAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
        const domainMin = paddedMin;
        const domainMax = paddedMax;
        const range = Math.max(1e-9, domainMax - domainMin);
        const clamped = Math.max(domainMin, Math.min(domainMax, safeAmount));
        return margin.top + innerHeight - ((clamped - domainMin) / range) * innerHeight;
    };

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('chart-svg');

    // Create gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    const gradientId = `chartGradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    // Determine chart color based on navigation level
    let chartColor = '#0083ff'; // Default color
    
    if (navigationPath.length === 1) {
        // Level 0: Use consistent color for all department charts
        chartColor = '#0083ff';
    } else if (navigationPath.length >= 2) {
        // Level 1,2,3: Use the department color from navigation path
        const departmentName = navigationPath[1];
        chartColor = DEPARTMENT_COLORS[departmentName] || '#0083ff';
    }

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0.4');
    stop1.setAttribute('stop-color', chartColor);
    stop1.setAttribute('stop-opacity', '1');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '0.8');
    stop2.setAttribute('stop-color', chartColor);
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
    areaPath.style.fill = `url(#${gradientId})`;
    areaPath.style.fillOpacity = '0.3';
    svg.appendChild(areaPath);

    // Create line path
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let lineD = `M ${xScale(0)} ${yScale(amounts[0])}`;
    for (let i = 1; i < years.length; i++) {
        lineD += ` L ${xScale(i)} ${yScale(amounts[i])}`;
    }
    linePath.setAttribute('d', lineD);
    linePath.classList.add('chart-line');
    linePath.style.stroke = chartColor;
    linePath.style.strokeWidth = '2';
    svg.appendChild(linePath);

    // Create data points
    years.forEach((year, index) => {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', xScale(index));
        point.setAttribute('cy', yScale(amounts[index]));
        point.classList.add('chart-point');
        point.style.fill = chartColor;
        point.style.stroke = 'var(--bg-primary)';
        point.style.strokeWidth = '2';
        point.setAttribute('r', '4');
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
    // attach svg reference for download
    container._svg = svg;
}

// Drill-down functionality
function initDrillDown() {
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    
    // Inline back button removed; header back handles navigation
}

function showDrillDown(departmentName) {
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    const drillDownTitle = document.getElementById('drill-down-title');
    const budgetPostsGrid = document.getElementById('budget-posts-grid');
    
    // Update navigation path
    navigationPath = ['Statsbudsjettet', departmentName];
    updateHeaderTitle();
    
    // Hide overview, show drill-down
    overviewView.style.display = 'none';
    drillDownView.classList.add('active');
    
    // Update title
    drillDownTitle.textContent = departmentName;
    
    // Scroll to top when drilling down (instant, no animation)
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Get department data
    const deptItems = getDepartmentItems(departmentName);

    // Group by budget chapter (kap_navn) instead of individual posts
    const groupedPosts = {};
    deptItems.forEach(item => {
        const chapterKey = item.kap_navn;
        if (!groupedPosts[chapterKey]) {
            groupedPosts[chapterKey] = {
                kap_navn: item.kap_navn,
                items: [],
                posts: {} // Track individual posts within this chapter
            };
        }
        groupedPosts[chapterKey].items.push(item);
        
        // Track individual posts
        const postKey = `${item.kap_nr}.${item.post_nr} - ${item.post_navn}`;
        if (!groupedPosts[chapterKey].posts[postKey]) {
            groupedPosts[chapterKey].posts[postKey] = {
                kap_nr: item.kap_nr,
                post_nr: item.post_nr,
                post_navn: item.post_navn,
                items: []
            };
        }
        groupedPosts[chapterKey].posts[postKey].items.push(item);
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
    
    // Reset navigation path
    navigationPath = ['Statsbudsjettet'];
    updateHeaderTitle();
    
    drillDownView.classList.remove('active');
    overviewView.style.display = 'block';
    
    // Scroll to top when returning to overview (instant, no animation)
    window.scrollTo({ top: 0, behavior: 'auto' });
}

function showBudgetChapterDetails(chapter) {
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    const drillDownTitle = document.getElementById('drill-down-title');
    const budgetPostsGrid = document.getElementById('budget-posts-grid');
    
    // Update navigation path to include the budget chapter
    navigationPath = ['Statsbudsjettet', navigationPath[1] || 'Departement', chapter.kap_navn];
    updateHeaderTitle();
    
    // Hide overview, show drill-down
    overviewView.style.display = 'none';
    drillDownView.classList.add('active');
    
    // Update title
    drillDownTitle.textContent = `${chapter.kap_navn} - Poster`;
    
    // Scroll to top when drilling down to chapter details (instant, no animation)
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Show individual posts within this chapter
    budgetPostsGrid.innerHTML = '';
    
    // Create individual post elements
    Object.values(chapter.posts).forEach(post => {
        const postElement = createIndividualBudgetPostElement(post);
        budgetPostsGrid.appendChild(postElement);
    });
    
    // Re-init icons for newly inserted content
    initLucideIcons();
    // Back navigation is handled by the header drill-up button (see drillUpOneLevel).
}

function createIndividualBudgetPostElement(post) {
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
        <div class="department-header">
            <div class="department-header-top">
                <h2 class="department-title">${post.post_navn}</h2>
                <div class="department-actions">
                    <button class="post-copy" title="Kopier data" aria-label="Kopier data">
                        <i data-lucide="clipboard"></i>
                    </button>
                    <button class="post-download" title="Last ned" aria-label="Last ned">
                        <i data-lucide="download"></i>
                    </button>
                </div>
            </div>
            <div class="department-subtitle">
                <span class="dept-change">Endring 2024-2026: <span class="change-badge" style="color:${change24to26 >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}">${change24to26 >= 0 ? '+' : ''}${formatAmount(change24to26)} (${changePercent}%)</span></span>
                <span class="dept-years">2024: ${formatAmount(total2024)} · 2025: ${formatAmount(total2025)} · 2026: ${formatAmount(total2026)}</span>
            </div>
        </div>
        <div class="department-chart">
            <div class="chart-container" id="post-chart-${post.kap_nr}-${post.post_nr}"></div>
        </div>
    `;

    
    // Hook actions
    const copyBtn = postElement.querySelector('.post-copy');
    const downloadBtn = postElement.querySelector('.post-download');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const deptLike = { name: `${post.kap_nr}.${post.post_nr} ${post.post_navn}`, total2024, total2025, total2026 };
            withIconFeedback(copyBtn, 'clipboard', copyChartData(deptLike));
        });
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const deptLike = { name: `${post.kap_nr}.${post.post_nr} ${post.post_navn}`, total2024, total2025, total2026 };
            withIconFeedback(downloadBtn, 'download', downloadChartCSV(deptLike));
        });
    }

    // Enable drill-down to single-card detail view on any post
    const titleEl = postElement.querySelector('.department-title');
    if (titleEl) {
        titleEl.classList.add('clickable-title');
        titleEl.addEventListener('click', () => {
            showBudgetPostDetails(post);
        });
    }

    // Create full-size chart for this post (reuse main chart renderer)
    const chartContainer = postElement.querySelector(`#post-chart-${post.kap_nr}-${post.post_nr}`);
    const deptLike = { name: `${post.kap_nr}.${post.post_nr} ${post.post_navn}`, total2024, total2025, total2026 };
    createChart(chartContainer, deptLike);
    
    return postElement;
}

function showBudgetPostDetails(post) {
    const overviewView = document.getElementById('overview-view');
    const drillDownView = document.getElementById('drill-down-view');
    const drillDownTitle = document.getElementById('drill-down-title');
    const budgetPostsGrid = document.getElementById('budget-posts-grid');
    
    // Update navigation path to include the budget post
    navigationPath = ['Statsbudsjettet', navigationPath[1] || 'Departement', navigationPath[2] || 'Kapittel', post.post_navn];
    updateHeaderTitle();

    // Hide overview, show drill-down
    overviewView.style.display = 'none';
    drillDownView.classList.add('active');

    // Update title
    drillDownTitle.textContent = `${post.post_navn}`;
    
    // Scroll to top when drilling down to post details (instant, no animation)
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Show a single card for this post using the same main-style layout
    budgetPostsGrid.innerHTML = '';

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

    const card = document.createElement('div');
    card.className = 'budget-post-item';
    card.innerHTML = `
        <div class="department-header">
            <div class="department-header-top">
                <h2 class="department-title">${post.post_navn}</h2>
                <div class="department-actions">
                    <button class="post-copy" title="Kopier data" aria-label="Kopier data">
                        <i data-lucide="clipboard"></i>
                    </button>
                    <button class="post-download" title="Last ned" aria-label="Last ned">
                        <i data-lucide="download"></i>
                    </button>
                </div>
            </div>
            <div class="department-subtitle">
                <span class="dept-change">Endring 2024-2026: <span class="change-badge" style="color:${change24to26 >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}">${change24to26 >= 0 ? '+' : ''}${formatAmount(change24to26)} (${changePercent}%)</span></span>
                <span class="dept-years">2024: ${formatAmount(total2024)} · 2025: ${formatAmount(total2025)} · 2026: ${formatAmount(total2026)}</span>
            </div>
        </div>
        <div class="department-chart">
            <div class="chart-container" id="post-detail-chart-${post.kap_nr}-${post.post_nr}"></div>
        </div>
    `;

    budgetPostsGrid.appendChild(card);

    // Hook actions
    const copyBtn = card.querySelector('.post-copy');
    const downloadBtn = card.querySelector('.post-download');
    const deptLike = { name: `${post.kap_nr}.${post.post_nr} ${post.post_navn}`, total2024, total2025, total2026 };
    if (copyBtn) {
        copyBtn.addEventListener('click', () => withIconFeedback(copyBtn, 'clipboard', copyChartData(deptLike)));
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => withIconFeedback(downloadBtn, 'download', downloadChartCSV(deptLike)));
    }

    // Render full-size chart
    const chartContainer = card.querySelector(`#post-detail-chart-${post.kap_nr}-${post.post_nr}`);
    createChart(chartContainer, { name: post.post_navn, total2024, total2025, total2026 });
    
    // Initialize Lucide icons for the new content
    initLucideIcons();
    // Back navigation is handled by the header drill-up button (see drillUpOneLevel).
}

function createBudgetPostElement(chapter) {
    const postElement = document.createElement('div');
    postElement.className = 'budget-post-item';
    
    // Calculate totals for each year across all posts in this chapter
    const totals = {};
    ['2024', '2025', '2026'].forEach(year => {
        totals[year] = chapter.items
            .filter(item => item.year === parseInt(year))
            .reduce((sum, item) => sum + (item.beløp || 0), 0);
    });
    
    const total2024 = totals['2024'] || 0;
    const total2025 = totals['2025'] || 0;
    const total2026 = totals['2026'] || 0;
    
    const change24to26 = total2026 - total2024;
    const changePercent = total2024 !== 0 ? ((change24to26 / total2024) * 100).toFixed(1) : '0.0';
    
    // Count number of posts in this chapter
    const postCount = Object.keys(chapter.posts).length;
    
    postElement.innerHTML = `
        <div class="department-header">
            <div class="department-header-top">
                <h2 class="department-title clickable-title">${chapter.kap_navn}</h2>
                <div class="department-actions">
                    <button class="chapter-copy" title="Kopier data" aria-label="Kopier data">
                        <i data-lucide="clipboard"></i>
                    </button>
                    <button class="chapter-download" title="Last ned" aria-label="Last ned">
                        <i data-lucide="download"></i>
                    </button>
        </div>
        </div>
            <div class="department-subtitle">
                <span class="dept-change">Endring 2024-2026: <span style="color: ${change24to26 >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}">${change24to26 >= 0 ? '+' : ''}${formatAmount(change24to26)} (${changePercent}%)</span></span>
                <span class="dept-years">2024: ${formatAmount(total2024)} · 2025: ${formatAmount(total2025)} · 2026: ${formatAmount(total2026)}</span>
                <span class="dept-posts">Antall poster: ${postCount}</span>
            </div>
            </div>
        <div class="department-chart">
            <div class="chart-container" id="post-chart-${chapter.kap_navn.replace(/[^a-zA-Z0-9]/g, '-')}"></div>
        </div>
    `;
    
    // Add click event to title for deeper drill-down
    const titleElement = postElement.querySelector('.department-title');
    titleElement.addEventListener('click', () => {
        showBudgetChapterDetails(chapter);
    });

    // Create full-size chart for this chapter
    const chartContainer = postElement.querySelector(`#post-chart-${chapter.kap_navn.replace(/[^a-zA-Z0-9]/g, '-')}`);
    const deptLike = { name: chapter.kap_navn, total2024, total2025, total2026 };
    createChart(chartContainer, deptLike);

    // Hook actions
    const copyBtn = postElement.querySelector('.chapter-copy');
    const downloadBtn = postElement.querySelector('.chapter-download');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            withIconFeedback(copyBtn, 'clipboard', copyChartData(deptLike));
        });
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            withIconFeedback(downloadBtn, 'download', downloadChartCSV(deptLike));
        });
    }
    
    return postElement;
}
