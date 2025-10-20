# Navigation Levels & Drill-Down System

This document explains the 4-level navigation system implemented in the Statsbudsjettet application.

## 📋 Navigation Structure

The application supports **4 levels of drill-down navigation**:

### Level 0: Main Overview (Statsbudsjettet)
- **Path**: `['Statsbudsjettet']`
- **Content**: Department overview with total budget amounts
- **Features**: 
  - Department cards with 2024/2025/2026 totals
  - Click to drill down to department details
  - Mobile dropdown filter for department selection

### Level 1: Department View
- **Path**: `['Statsbudsjettet', 'Department Name']`
- **Example**: `['Statsbudsjettet', 'Helse- og omsorgsdepartementet']`
- **Content**: Budget chapters within the department
- **Features**:
  - Chapter cards with budget amounts
  - Click to drill down to chapter details
  - Breadcrumb navigation with clickable segments

### Level 2: Chapter View
- **Path**: `['Statsbudsjettet', 'Department', 'Chapter']`
- **Example**: `['Statsbudsjettet', 'Helse- og omsorgsdepartementet', 'Beredskap']`
- **Content**: Budget posts within the chapter
- **Features**:
  - Individual budget post cards
  - Year-over-year comparisons
  - Interactive charts
  - Copy and download functionality

### Level 3: Budget Post Details
- **Path**: `['Statsbudsjettet', 'Department', 'Chapter', 'Post']`
- **Example**: `['Statsbudsjettet', 'Helse- og omsorgsdepartementet', 'Beredskap', 'Kompensasjon til legemiddelgrossister']`
- **Content**: Detailed breakdown of specific budget post
- **Features**:
  - Detailed financial information
  - Copy and download buttons
  - Year comparison data
  - Drill-up navigation

## 🧭 Navigation Implementation

### Breadcrumb System
```javascript
// Navigation path tracking
let navigationPath = ['Statsbudsjettet'];

// Breadcrumb click handling
function handleBreadcrumbClick(index) {
    if (index === 0) {
        // Level 0: Return to main overview
        window.location.reload();
    } else if (index === 1) {
        // Level 1: Go to department view
        const departmentName = navigationPath[1];
        showDrillDown(departmentName);
    } else if (index === 2) {
        // Level 2: Go to chapter view
        const departmentName = navigationPath[1];
        const chapterName = navigationPath[2];
        const chapter = getChapterByName(departmentName, chapterName);
        if (chapter) showBudgetChapterDetails(chapter);
    } else if (index === 3) {
        // Level 3: Go to post details
        const departmentName = navigationPath[1];
        const chapterName = navigationPath[2];
        const postName = navigationPath[3];
        const chapter = getChapterByName(departmentName, chapterName);
        if (chapter) {
            const post = Object.values(chapter.posts).find(p => p.post_navn === postName);
            if (post) showBudgetPostDetails(post);
        }
    }
}
```

### Drill-Up Functionality
```javascript
function drillUpOneLevel() {
    if (navigationPath.length <= 1) {
        return; // Already at top level
    }
    
    // Remove the last item from navigation path
    navigationPath.pop();
    updateHeaderTitle();
    
    // Navigate back to the appropriate view
    if (navigationPath.length === 1) {
        showOverview(); // Back to main view
    } else if (navigationPath.length === 2) {
        const departmentName = navigationPath[1];
        showDrillDown(departmentName); // Back to department view
    } else if (navigationPath.length === 3) {
        // Back to chapter view
        const departmentName = navigationPath[1];
        const chapterName = navigationPath[2];
        const chapter = getChapterByName(departmentName, chapterName);
        if (chapter) showBudgetChapterDetails(chapter);
    }
}
```

## 📱 Mobile Navigation

### Mobile Dropdown Filter
On mobile devices (≤768px), the hamburger menu is replaced with a native dropdown:

```javascript
function initMobileFilter() {
    const mobileFilterSelect = document.createElement('select');
    mobileFilterSelect.id = 'mobile-filter-select';
    mobileFilterSelect.className = 'mobile-filter-select';
    
    // Add options for all departments
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

## 🎨 Visual Indicators

### Header Actions
- **Drill-up button**: Appears when not at Level 0
- **Navigation toggle**: Hamburger menu (desktop) / hidden (mobile)
- **Breadcrumb navigation**: Clickable segments with arrows

### Breadcrumb Styling
```css
/* Desktop breadcrumbs */
@media (min-width: 769px) {
    .site-title {
        white-space: normal;
        line-height: 1.3;
        text-indent: -1.5rem;
        padding-left: 1.5rem;
    }
}

/* Mobile breadcrumbs */
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

## 🔄 State Management

### Navigation State
```javascript
// Current navigation path
let navigationPath = ['Statsbudsjettet'];

// Update header with breadcrumbs
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
    }
}
```

## 🚀 Performance Considerations

### Efficient Navigation
- **Lazy loading**: Data loaded only when needed
- **State preservation**: Navigation state maintained in memory
- **DOM optimization**: Minimal DOM manipulation during navigation
- **Event delegation**: Efficient event handling for breadcrumb clicks

### Memory Management
- **Cleanup**: Event listeners properly removed
- **Data caching**: Department and chapter data cached
- **Efficient filtering**: Smart data filtering for each level

## 📊 Data Flow by Level

### Level 0 → Level 1
```javascript
// Department aggregation
const departmentData = budgetData.combined.filter(item => 
    item.fdep_navn === departmentName
);
```

### Level 1 → Level 2
```javascript
// Chapter grouping
const chapters = groupByChapter(departmentData);
```

### Level 2 → Level 3
```javascript
// Post details
const post = Object.values(chapter.posts).find(p => 
    p.post_navn === postName
);
```

## 🎯 User Experience

### Navigation Flow
1. **Start**: User sees department overview (Level 0)
2. **Drill down**: Click department → see chapters (Level 1)
3. **Continue**: Click chapter → see posts (Level 2)
4. **Details**: Click post → see details (Level 3)
5. **Navigate back**: Use breadcrumbs or drill-up button

### Visual Feedback
- **Hover effects**: Cards highlight on hover
- **Loading states**: Smooth transitions between levels
- **Breadcrumb highlighting**: Current level clearly indicated
- **Button states**: Copy/download buttons with success feedback

---

*This navigation system provides intuitive drill-down access to all levels of Norwegian budget data while maintaining excellent performance and user experience.*
