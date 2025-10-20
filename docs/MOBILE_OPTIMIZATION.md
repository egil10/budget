# Mobile Optimization & Responsive Design

This document covers the comprehensive mobile optimization implemented in the Statsbudsjettet application.

## 📱 Mobile-First Approach

### Responsive Breakpoints
```css
/* Mobile-first breakpoints */
@media (max-width: 768px) {
    /* Mobile styles */
}

@media (min-width: 769px) {
    /* Desktop styles */
}
```

### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 🧭 Mobile Navigation System

### Native Dropdown Filter
On mobile devices, the hamburger menu is replaced with a native iOS/Android-style dropdown:

```javascript
function initMobileFilter() {
    const mobileFilterSelect = document.createElement('select');
    mobileFilterSelect.id = 'mobile-filter-select';
    mobileFilterSelect.className = 'mobile-filter-select';
    
    // Add department options
    const departments = getUniqueDepartments();
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        mobileFilterSelect.appendChild(option);
    });
    
    // Handle selection
    mobileFilterSelect.addEventListener('change', (e) => {
        const selectedDept = e.target.value;
        if (selectedDept === 'all') {
            showOverview();
        } else {
            showDrillDown(selectedDept);
        }
    });
}
```

### Mobile Navigation CSS
```css
.mobile-filter-select {
    display: none;
    width: 100%;
    padding: 12px;
    border: 1px solid #000;
    background: white;
    font-size: 16px;
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .mobile-filter-select {
        display: block;
    }
    
    .nav-toggle {
        display: none !important;
    }
}
```

## 📐 Responsive Layout System

### Grid Layout Adaptations
```css
/* Desktop: Multi-column grid */
.departments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

/* Mobile: Single column */
@media (max-width: 768px) {
    .departments-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
```

### Card Sizing
```css
/* Desktop cards */
.budget-card {
    min-height: 220px;
    padding: 20px;
}

/* Mobile cards - taller for better touch interaction */
@media (max-width: 768px) {
    .budget-card {
        min-height: 280px;
        padding: 16px;
    }
}
```

## 📊 Chart Responsiveness

### SVG Chart Scaling
```css
.html-chart {
    height: 200px;
    position: relative;
    overflow: hidden;
}

.html-chart svg {
    width: 100%;
    height: 100%;
    viewBox: 0 0 300 100;
    preserveAspectRatio: none;
}

/* Mobile: Taller charts for better visibility */
@media (max-width: 768px) {
    .html-chart {
        height: 240px !important;
    }
}
```

### Chart Container Responsiveness
```javascript
// Dynamic chart sizing based on container
function createHTMLChart(container, amount2024, amount2025, amount2026, label) {
    const width = 300;
    const height = 100;
    
    // Mobile adjustments
    if (window.innerWidth <= 768) {
        // Adjust chart dimensions for mobile
        const mobileHeight = 120;
        // ... mobile-specific chart logic
    }
}
```

## 🍞 Mobile Breadcrumb System

### Multi-line Breadcrumbs
On mobile, long breadcrumb paths wrap to multiple lines:

```css
@media (max-width: 768px) {
    .site-title {
        white-space: normal;
        line-height: 1.3;
        max-height: 80px;
        overflow-y: auto;
        overflow-x: hidden;
    }
}
```

### Breadcrumb Format
```
Statsbudsjettet
→ Helse- og omsorgsdepartementet
→ Beredskap
→ Kompensasjon til legemiddelgrossister
```

## 🎯 Touch-Friendly Interface

### Button Sizing
```css
/* Minimum touch target size (44px) */
.download-btn, .copy-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
}

/* Touch feedback */
.budget-card:active {
    background: #f0f0f0;
    transform: scale(0.98);
}
```

### Interactive Elements
```css
/* Touch-friendly hover states */
@media (hover: hover) {
    .budget-card:hover {
        background: #f9f9f9;
    }
}

/* Touch devices get active states instead */
@media (hover: none) {
    .budget-card:active {
        background: #f0f0f0;
    }
}
```

## 📱 Mobile-Specific Features

### Header Overflow Handling
```css
/* Prevent horizontal overflow */
.main-header {
    overflow-x: hidden;
    padding: 0 1rem;
}

/* Breadcrumb wrapping */
.site-title {
    word-wrap: break-word;
    hyphens: auto;
}
```

### Mobile Filter Integration
```javascript
// Sync mobile filter with navigation path
function syncMobileFilterWithPath() {
    if (!mobileFilterSelect) return;
    const departmentName = navigationPath[1];
    if (departmentName) {
        if (mobileFilterSelect.value !== departmentName) {
            mobileFilterSelect.value = departmentName;
        }
    } else {
        mobileFilterSelect.value = 'all';
    }
}
```

## 🎨 Mobile Visual Design

### Typography Scaling
```css
/* Mobile typography */
@media (max-width: 768px) {
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.1rem; }
    
    .budget-card h3 {
        font-size: 1rem;
        line-height: 1.3;
    }
}
```

### Spacing Adjustments
```css
/* Mobile spacing */
@media (max-width: 768px) {
    .main-header {
        padding: 0.75rem 1rem;
    }
    
    .budget-card {
        margin-bottom: 1rem;
    }
    
    .departments-grid {
        padding: 0 1rem;
    }
}
```

## 🔄 Mobile State Management

### Navigation State
```javascript
// Mobile-specific navigation handling
function handleMobileNavigation() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Hide hamburger menu
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.style.display = 'none';
        }
        
        // Show mobile filter
        const mobileFilter = document.getElementById('mobile-filter-select');
        if (mobileFilter) {
            mobileFilter.style.display = 'block';
        }
    } else {
        // Show hamburger menu
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.style.display = 'flex';
        }
        
        // Hide mobile filter
        const mobileFilter = document.getElementById('mobile-filter-select');
        if (mobileFilter) {
            mobileFilter.style.display = 'none';
        }
    }
}
```

### Responsive Event Handlers
```javascript
// Initialize responsive handlers
function initResponsiveHandlers() {
    // Handle window resize
    window.addEventListener('resize', handleMobileNavigation);
    
    // Initialize mobile filter
    initMobileFilter();
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(handleMobileNavigation, 100);
    });
}
```

## 📊 Mobile Performance

### Optimized Loading
```javascript
// Mobile-specific optimizations
function optimizeForMobile() {
    if (window.innerWidth <= 768) {
        // Reduce chart complexity on mobile
        const charts = document.querySelectorAll('.html-chart');
        charts.forEach(chart => {
            // Simplify chart rendering for mobile
            chart.style.height = '200px';
        });
        
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (isInViewport(img)) {
                img.src = img.dataset.src;
            }
        });
    }
}
```

### Touch Performance
```css
/* Optimize for touch scrolling */
body {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
}

/* Prevent zoom on input focus */
input, select, textarea {
    font-size: 16px;
}
```

## 🧪 Mobile Testing

### Testing Checklist
- [ ] **Touch interactions**: All buttons respond to touch
- [ ] **Scrolling**: Smooth scrolling on all devices
- [ ] **Orientation**: Layout works in portrait and landscape
- [ ] **Navigation**: Mobile dropdown works correctly
- [ ] **Charts**: Charts scale properly on small screens
- [ ] **Breadcrumbs**: Long paths wrap correctly
- [ ] **Performance**: Fast loading on mobile networks

### Device Testing
```javascript
// Device detection for testing
function getDeviceInfo() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        userAgent: navigator.userAgent,
        touchSupport: 'ontouchstart' in window,
        orientation: screen.orientation ? screen.orientation.type : 'unknown'
    };
}
```

## 🚀 Mobile Optimization Features

### Key Mobile Features
1. **Native Dropdown**: iOS/Android-style department selection
2. **Touch-Friendly**: 44px minimum touch targets
3. **Responsive Charts**: SVG charts that scale with screen size
4. **Breadcrumb Wrapping**: Multi-line breadcrumbs for long paths
5. **Optimized Layout**: Single-column grid on mobile
6. **Performance**: Fast loading and smooth interactions

### Mobile-Specific CSS
```css
/* Mobile-only styles */
@media (max-width: 768px) {
    .mobile-only { display: block; }
    .desktop-only { display: none; }
    
    /* Mobile navigation */
    .nav-toggle { display: none !important; }
    .mobile-filter-select { display: block; }
    
    /* Mobile layout */
    .departments-grid { grid-template-columns: 1fr; }
    .budget-card { min-height: 280px; }
    
    /* Mobile charts */
    .html-chart { height: 240px !important; }
}
```

---

*The mobile optimization ensures the Statsbudsjettet application provides an excellent user experience across all device types, from smartphones to tablets to desktop computers.*
