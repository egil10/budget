# API Reference

This document provides detailed information about the JavaScript API and data structures used in the Statsbudsjettet application.

## 📋 Table of Contents

- [Data Structures](#data-structures)
- [Core Functions](#core-functions)
- [Chart Functions](#chart-functions)
- [Utility Functions](#utility-functions)
- [Event Handlers](#event-handlers)

## 📊 Data Structures

### Budget Data Object
```javascript
budgetData = {
    '2024': [/* Array of budget items */],
    '2025': [/* Array of budget items */],
    '2026': [/* Array of budget items */],
    combined: [/* All years combined */]
}
```

### Budget Item Structure
```javascript
{
    gdep_nr: number,           // Main department number
    avs_nr: number,            // Sub-department number
    gdep_navn: string,         // Main department name
    avs_navn: string,          // Sub-department name
    fdep_nr: number,           // Function department number
    fdep_navn: string,         // Function department name
    omr_nr: number,            // Area number
    kat_nr: number,            // Category number
    omr_navn: string,          // Area name
    kat_navn: string,          // Category name
    kap_nr: number,            // Chapter number
    post_nr: number,           // Post number
    kap_navn: string,          // Chapter name
    post_navn: string,         // Post name
    stikkord: string,          // Keywords
    beløp: number,             // Amount (in thousands)
    year: number               // Year (2024, 2025, 2026)
}
```

### Department Data Structure
```javascript
{
    name: string,              // Department name
    '2024': [/* Budget items */],
    '2025': [/* Budget items */],
    '2026': [/* Budget items */]
}
```

## 🔧 Core Functions

### `loadBudgetData()`
Loads budget data from JSON files and initializes the application.

```javascript
async function loadBudgetData()
```

**Returns**: `Promise<void>`

**Process**:
1. Fetches 2025, 2026, and 2024 data from JSON files
2. Merges department names (Olje- og energidepartementet → Energidepartementet)
3. Combines all years into a single dataset
4. Sets up navigation and renders initial view

**Error Handling**: Throws descriptive errors for network, JSON parsing, or data structure issues.

### `renderBudgetData()`
Main rendering function that determines which view to display.

```javascript
function renderBudgetData()
```

**Logic**:
- If `currentFilter === 'all'`: Shows department aggregates
- Otherwise: Shows detailed comparison view for selected department

### `renderDepartmentAggregates(filtered)`
Renders the home page with department overview cards.

```javascript
function renderDepartmentAggregates(filtered)
```

**Parameters**:
- `filtered`: Array of budget items

**Process**:
1. Groups data by department (`fdep_navn`)
2. Sorts departments alphabetically
3. Creates department aggregate cards
4. Adds click handlers for drill-down navigation

### `renderComparisonView(filtered)`
Renders detailed budget post analysis for a specific department.

```javascript
function renderComparisonView(filtered)
```

**Parameters**:
- `filtered`: Array of budget items for selected department

**Process**:
1. Groups data by budget post (`post_nr + post_navn`)
2. Groups posts by department for section headers
3. Creates comparison cards for each post
4. Adds download functionality

## 📈 Chart Functions

### `createHTMLChart(container, amount2024, amount2025, amount2026, label)`
Creates an SVG-based line chart for budget trend visualization.

```javascript
function createHTMLChart(container, amount2024, amount2025, amount2026, label)
```

**Parameters**:
- `container`: DOM element to render chart into
- `amount2024`: Budget amount for 2024
- `amount2025`: Budget amount for 2025
- `amount2026`: Budget amount for 2026
- `label`: Chart title/label

**Returns**: SVG element

**Features**:
- Pure SVG implementation (no external dependencies)
- Responsive design with viewBox
- Color coding: green for increases, red for decreases
- Grid lines and axis labels
- Smart text alignment for year labels

**Chart Structure**:
```javascript
// SVG dimensions
const width = 300;
const height = 100;
const padding = 10;
const bottomPadding = 15;

// Data points
const x1 = 25;  // 2024 position
const x2 = 155; // 2025 position  
const x3 = 285; // 2026 position
```

## 🛠️ Utility Functions

### `formatAmount(value)`
Formats large numbers with appropriate suffixes.

```javascript
function formatAmount(value)
```

**Parameters**:
- `value`: Number to format

**Returns**: Formatted string

**Examples**:
- `1000000000` → `"1.0B"`
- `50000000` → `"50M"`
- `25000` → `"25K"`

### `formatNumber(value)`
Formats numbers with Norwegian locale formatting.

```javascript
function formatNumber(value)
```

**Parameters**:
- `value`: Number to format

**Returns**: Locale-formatted string

### `getDepartmentAbbreviation(deptName)`
Generates abbreviations for department names.

```javascript
function getDepartmentAbbreviation(deptName)
```

**Parameters**:
- `deptName`: Full department name

**Returns**: Abbreviated department name

**Examples**:
- `"Arbeids- og inkluderingsdepartementet"` → `"AID"`
- `"Finansdepartementet"` → `"FIN"`

## 🎯 Event Handlers

### Navigation Events
```javascript
// Department filter change
document.getElementById('mobileDepartmentSelect').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderBudgetData();
});

// Department card click (drill-down)
card.addEventListener('click', () => {
    currentFilter = deptData.name;
    renderBudgetData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
```

### Download Events
```javascript
// Download button click
downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent card click
    // Generate and download HTML file
});
```

## 📱 Responsive Behavior

### Mobile Navigation
- Desktop: Button-based navigation
- Mobile: Dropdown select element
- Automatic switching based on screen width

### Chart Responsiveness
- SVG charts scale with container
- Grid layout adapts to screen size
- Mobile: Single column layout
- Desktop: Multi-column layout

## 🔍 Debugging

### Console Logging
The application includes extensive console logging for debugging:

```javascript
// Data loading
console.log('Loading budget data...');
console.log('2026 data structure:', Object.keys(data2026));

// Department grouping
console.log(`Grouped posts count: ${Object.keys(groupedByPost).length}`);

// Filtering
console.log('Filtered data count:', filtered.length);
```

### Error Handling
- Network errors: Descriptive error messages
- JSON parsing errors: Detailed error information
- Data validation: Checks for expected data structure

## 🚀 Performance Considerations

### Data Loading
- Parallel loading of JSON files
- Efficient data grouping algorithms
- Minimal DOM manipulation

### Chart Rendering
- SVG-based charts for scalability
- Efficient path generation
- Minimal re-rendering

### Memory Management
- Proper cleanup of event listeners
- Efficient data structures
- Garbage collection friendly code

---

*Last updated: October 2025*
