# Development Guide

This guide provides detailed information for developers working on the Statsbudsjettet project.

## 📋 Table of Contents

- [Development Environment](#development-environment)
- [Project Architecture](#project-architecture)
- [Data Flow](#data-flow)
- [Chart System](#chart-system)
- [Styling Guidelines](#styling-guidelines)
- [Performance Considerations](#performance-considerations)
- [Testing Strategy](#testing-strategy)

## 🛠️ Development Environment

### Prerequisites
- **Node.js**: 16+ (for development tools)
- **Python**: 3.7+ (for data conversion scripts)
- **Git**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Local Setup
```bash
# Clone repository
git clone https://github.com/egil10/budget.git
cd budget

# Start development server
python -m http.server 8000

# Access application
open http://localhost:8000
```

### Development Tools
```bash
# Install development dependencies
npm install -g live-server
npm install -g uglify-js
npm install -g clean-css-cli

# Start live reload server
live-server --port=8000 --open=/index.html
```

## 🏗️ Project Architecture

### File Structure
```
budget/
├── data/
│   ├── excel/              # Source Excel files
│   └── json/               # Processed JSON data
├── docs/                   # Documentation
├── scripts/                # Utility scripts
│   └── excel_to_json.py    # Data conversion
├── src/
│   ├── assets/             # Static assets
│   │   └── favicon.ico     # Site favicon
│   ├── css/                # Stylesheets
│   │   ├── main.css        # Main styles
│   │   └── theme.css       # Theme styles
│   └── js/                 # JavaScript modules
│       ├── config.js       # Configuration
│       ├── main.js         # Core application
│       └── theme.js        # Theme management
├── index.html              # Main HTML file
└── README.md               # Project overview
```

### Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Layer    │    │  Presentation   │    │   Interaction   │
│                 │    │     Layer       │    │     Layer       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • JSON Files    │───▶│ • HTML/CSS      │───▶│ • Event Handlers│
│ • Data Loading  │    │ • SVG Charts    │    │ • Navigation    │
│ • Data Processing│    │ • Responsive    │    │ • User Actions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Data Flow

### Data Loading Process
```javascript
// 1. Load JSON files
const data2024 = await fetch('./data/json/gul_bok_2024_datagrunnlag.json');
const data2025 = await fetch('./data/json/20241002_gulbok_data_til_publ.json');
const data2026 = await fetch('./data/json/2026_gulbok_datagrunnlag.json');

// 2. Process and merge data
budgetData['2024'] = data2024.Data.map(item => ({ ...item, year: 2024 }));
budgetData['2025'] = data2025.Data.map(item => ({ ...item, year: 2025 }));
budgetData['2026'] = data2026.Data.map(item => ({ ...item, year: 2026 }));

// 3. Combine datasets
budgetData.combined = [...budgetData['2024'], ...budgetData['2025'], ...budgetData['2026']];
```

### Data Processing Pipeline
```
Excel Files → JSON Conversion → Data Loading → Processing → Rendering
     ↓              ↓              ↓           ↓           ↓
  Source Data → Structured Data → Memory → Filtered → UI Components
```

### Data Structures
```javascript
// Budget Item Structure
{
    gdep_nr: number,           // Main department number
    gdep_navn: string,         // Main department name
    fdep_navn: string,         // Function department name
    post_nr: number,           // Post number
    post_navn: string,         // Post name
    beløp: number,             // Amount (in thousands)
    year: number               // Year (2024, 2025, 2026)
}

// Department Group Structure
{
    name: string,              // Department name
    '2024': [...],            // 2024 budget items
    '2025': [...],            // 2025 budget items
    '2026': [...],            // 2026 budget items
}
```

## 📈 Chart System

### SVG Chart Architecture
```javascript
// Chart Creation Process
function createHTMLChart(container, amount2024, amount2025, amount2026, label) {
    // 1. Calculate dimensions and scaling
    const width = 300, height = 100;
    const minAmount = Math.min(amount2024, amount2025, amount2026);
    const maxAmount = Math.max(amount2024, amount2025, amount2026);
    
    // 2. Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 100');
    
    // 3. Generate chart elements
    // - Area path for filled area
    // - Line segments for trend line
    // - Grid lines for reference
    // - Axis labels for values
    
    // 4. Append to container
    container.appendChild(svg);
}
```

### Chart Components
```javascript
// Area Path (filled area under line)
const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
areaPath.setAttribute('d', `M ${x1} ${height} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x3} ${height} Z`);

// Line Segments (trend line)
const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
line1.setAttribute('x1', x1); line1.setAttribute('y1', y1);
line1.setAttribute('x2', x2); line1.setAttribute('y2', y2);

// Grid Lines (reference lines)
const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
gridLine.setAttribute('x1', x1); gridLine.setAttribute('y1', gridY);
gridLine.setAttribute('x2', x3); gridLine.setAttribute('y2', gridY);
```

### Responsive Design
```css
/* Chart container responsive sizing */
.chart-wrapper {
    height: 200px;
    position: relative;
    overflow: hidden;
}

@media (max-width: 768px) {
    .chart-wrapper {
        height: 240px !important;
    }
}

/* SVG scaling */
.html-chart svg {
    width: 100%;
    height: 100%;
    viewBox: 0 0 300 100;
    preserveAspectRatio: none;
}
```

## 🎨 Styling Guidelines

### CSS Architecture
```css
/* 1. Base styles */
* { box-sizing: border-box; }
body { font-family: 'Times New Roman', serif; }

/* 2. Layout components */
.budget-card { /* Card styling */ }
.department-grid { /* Grid layout */ }

/* 3. Utility classes */
.mobile-only { display: block; }
.desktop-only { display: none; }

/* 4. Responsive breakpoints */
@media (max-width: 768px) {
    .mobile-only { display: block; }
    .desktop-only { display: none; }
}
```

### Design System
```css
/* Color palette */
:root {
    --color-primary: #000000;
    --color-secondary: #666666;
    --color-success: #2E7D32;
    --color-danger: #C62828;
    --color-background: #ffffff;
    --color-surface: #f9f9f9;
}

/* Typography scale */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
```

### Component Styling
```css
/* Budget card component */
.budget-card {
    border: 1px solid #000000;
    padding: 20px;
    background: #ffffff;
    min-height: 220px;
    transition: background-color 0.2s ease;
}

.budget-card:hover {
    background: #f9f9f9;
}

/* Download button component */
.download-btn {
    background: transparent;
    border: 1px solid #000000;
    padding: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.download-btn:hover {
    background: #f0f0f0;
}
```

## ⚡ Performance Considerations

### Data Loading Optimization
```javascript
// Parallel data loading
const [data2024, data2025, data2026] = await Promise.all([
    fetch('./data/json/gul_bok_2024_datagrunnlag.json'),
    fetch('./data/json/20241002_gulbok_data_til_publ.json'),
    fetch('./data/json/2026_gulbok_datagrunnlag.json')
]);
```

### Chart Rendering Optimization
```javascript
// Efficient SVG generation
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 300 100');
svg.setAttribute('preserveAspectRatio', 'none');

// Batch DOM operations
const fragment = document.createDocumentFragment();
fragment.appendChild(areaPath);
fragment.appendChild(line1);
fragment.appendChild(line2);
svg.appendChild(fragment);
```

### Memory Management
```javascript
// Clean up event listeners
function removeEventListeners() {
    // Remove all event listeners before re-rendering
    document.querySelectorAll('.budget-card').forEach(card => {
        card.replaceWith(card.cloneNode(true));
    });
}

// Efficient data filtering
const filtered = budgetData.combined.filter(item => {
    return currentFilter === 'all' || item.fdep_navn === currentFilter;
});
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] **Data Loading**: All JSON files load correctly
- [ ] **Chart Rendering**: Charts display with correct data
- [ ] **Navigation**: Department filtering works properly
- [ ] **Responsiveness**: Layout adapts to screen size
- [ ] **Download**: HTML export functionality works
- [ ] **Performance**: Page loads quickly, smooth interactions

### Browser Testing
```bash
# Test in multiple browsers
# Chrome: Developer Tools → Device Mode
# Firefox: Responsive Design Mode
# Safari: Develop → Responsive Design Mode
# Edge: Developer Tools → Device Emulation
```

### Performance Testing
```javascript
// Performance monitoring
const startTime = performance.now();
await loadBudgetData();
const loadTime = performance.now() - startTime;
console.log(`Data loaded in ${loadTime}ms`);

// Memory usage monitoring
if (performance.memory) {
    console.log('Memory usage:', performance.memory);
}
```

### Data Validation
```javascript
// Validate data structure
function validateBudgetData(data) {
    const requiredFields = ['gdep_navn', 'post_navn', 'beløp', 'year'];
    return data.every(item => 
        requiredFields.every(field => item.hasOwnProperty(field))
    );
}

// Validate chart data
function validateChartData(amount2024, amount2025, amount2026) {
    return [amount2024, amount2025, amount2026].every(amount => 
        typeof amount === 'number' && !isNaN(amount)
    );
}
```

## 🔧 Development Workflow

### Feature Development
1. **Create feature branch**: `git checkout -b feature/chart-improvements`
2. **Implement changes**: Make incremental commits
3. **Test thoroughly**: Manual testing + browser testing
4. **Update documentation**: Bailiffs for new features
5. **Create pull request**: Include description and screenshots

### Bug Fixing
1. **Reproduce issue**: Create minimal test case
2. **Identify root cause**: Use browser dev tools
3. **Implement fix**: Make targeted changes
4. **Test fix**: Verify issue is resolved
5. **Add regression test**: Prevent future occurrences

### Code Review Process
1. **Self-review**: Check your own code first
2. **Peer review**: Have another developer review
3. **Testing**: Verify functionality works correctly
4. **Documentation**: Update relevant documentation
5. **Merge**: Merge to main branch

## 📱 Mobile Development

### Responsive Design Principles
```css
/* Mobile-first approach */
.budget-card {
    min-height: 220px; /* Desktop default */
}

@media (max-width: 768px) {
    .budget-card {
        min-height: 280px; /* Mobile override */
    }
}
```

### Touch-Friendly Interface
```css
/* Minimum touch target size */
.download-btn {
    min-width: 44px;
    min-height: 44px;
}

/* Touch feedback */
.budget-card:active {
    background: #f0f0f0;
}
```

### Mobile Navigation
```javascript
// Mobile dropdown navigation
const mobileSelect = document.getElementById('mobileDepartmentSelect');
mobileSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderBudgetData();
});
```

## 🚀 Deployment

### Production Build
```bash
# Minify JavaScript
uglifyjs src/js/main.js -o src/js/main.min.js

# Minify CSS
cleancss -o src/css/main.min.css src/css/main.css

# Update HTML references
# Replace script and link tags with minified versions
```

### Performance Monitoring
```javascript
// Monitor page load performance
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime}ms`);
    
    // Send to analytics (if implemented)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_load_time', {
            value: Math.round(loadTime)
        });
    }
});
```

---

*Last updated: October 2025*
