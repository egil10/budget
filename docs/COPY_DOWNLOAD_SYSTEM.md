# Copy & Download System

This document covers the copy and download functionality implemented throughout the Statsbudsjettet application.

## 📋 Overview

The application includes comprehensive copy and download functionality at all navigation levels (Levels 1-3), allowing users to export budget data in various formats.

## 🎯 Copy & Download Features

### Available at All Levels
- **Level 1**: Department view - Copy/download department data
- **Level 2**: Chapter view - Copy/download chapter data  
- **Level 3**: Budget post details - Copy/download post data

### Button Implementation
```html
<!-- Copy and Download buttons -->
<div class="chart-actions">
    <button class="copy-btn" aria-label="Copy data to clipboard">
        <svg data-lucide="copy"></svg>
    </button>
    <button class="download-btn" aria-label="Download as CSV">
        <svg data-lucide="download"></svg>
    </button>
</div>
```

## 📊 Copy Functionality

### Copy Chart Data
```javascript
async function copyChartData(data) {
    return new Promise(resolve => {
        // Format data for clipboard
        const csvContent = formatDataAsCSV(data);
        
        // Use Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(csvContent).then(() => {
                console.log('Data copied to clipboard');
                resolve();
            }).catch(err => {
                console.error('Failed to copy: ', err);
                resolve();
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = csvContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            resolve();
        }
    });
}
```

### Data Formatting
```javascript
function formatDataAsCSV(data) {
    // Create CSV header
    let csvContent = 'date,value,index\n';
    
    // Add data rows
    if (data['2024'] !== null) {
        csvContent += `2024-01-01,${data['2024']},1\n`;
    }
    if (data['2025'] !== null) {
        csvContent += `2025-01-01,${data['2025']},2\n`;
    }
    if (data['2026'] !== null) {
        csvContent += `2026-01-01,${data['2026']},3\n`;
    }
    
    return csvContent;
}
```

## 💾 Download Functionality

### Download CSV
```javascript
async function downloadChartCSV(data) {
    return new Promise((resolve) => {
        // Format data as CSV
        const csvContent = formatDataAsCSV(data);
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'budget_data.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        resolve();
    });
}
```

### Download HTML (Legacy)
```javascript
function downloadChartHTML(chartElement, title) {
    // Create standalone HTML with embedded CSS
    const htmlContent = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Embedded CSS for standalone HTML */
        body { font-family: 'Times New Roman', serif; margin: 20px; }
        .budget-card { border: 1px solid #000; padding: 20px; }
        /* ... additional styles ... */
    </style>
</head>
<body>
    ${chartElement.outerHTML}
</body>
</html>`;
    
    // Create download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_')}.html`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}
```

## 🎨 Visual Feedback System

### Icon Animation
```javascript
function withIconFeedback(buttonEl, baselineIcon, actionPromise) {
    console.log('withIconFeedback called');
    
    // Find the icon element
    const icon = buttonEl.querySelector('svg');
    if (!icon) {
        console.log('No icon found in button');
        return;
    }
    
    // Store original icon
    const originalIcon = icon.getAttribute('data-lucide');
    
    // Run the action
    console.log('Running action...');
    Promise.resolve(actionPromise)
        .then(() => {
            console.log('Action succeeded');
            
            // Show success icon
            setButtonIcon(buttonEl, 'check');
            
            // Visual feedback
            icon.style.color = '#22c55e';
            icon.style.transform = 'scale(1.2)';
            
            // Revert after delay
            setTimeout(() => {
                setButtonIcon(buttonEl, originalIcon);
                icon.style.color = '';
                icon.style.transform = '';
            }, 2000);
        })
        .catch((error) => {
            console.log('Action failed:', error);
            
            // Show error icon
            setButtonIcon(buttonEl, 'x');
            
            // Visual feedback
            icon.style.color = '#ef4444';
            icon.style.transform = 'scale(0.8)';
            
            // Revert after delay
            setTimeout(() => {
                setButtonIcon(buttonEl, originalIcon);
                icon.style.color = '';
                icon.style.transform = '';
            }, 2000);
        });
}
```

### Icon Management
```javascript
function setButtonIcon(buttonEl, iconName) {
    const icon = buttonEl.querySelector('svg');
    if (!icon) {
        console.log('No icon found in button');
        return;
    }
    
    console.log('Setting icon to:', iconName);
    
    // Update Lucide icon
    if (typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', iconName);
        lucide.createIcons();
        console.log('Lucide icons re-rendered');
    } else {
        console.log('Lucide not available');
    }
    
    // Force re-render for visual feedback
    icon.style.display = 'none';
    icon.offsetHeight; // Trigger reflow
    icon.style.display = '';
}
```

## 🔧 Button Integration

### Event Listener Setup
```javascript
// Copy button event listener
copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Copy button clicked');
    
    // Get data for current view
    const data = getCurrentViewData();
    
    // Apply icon feedback
    withIconFeedback(copyBtn, 'copy', copyChartData(data));
});

// Download button event listener
downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Download button clicked');
    
    // Get data for current view
    const data = getCurrentViewData();
    
    // Apply icon feedback
    withIconFeedback(downloadBtn, 'download', downloadChartCSV(data));
});
```

### Data Context
```javascript
function getCurrentViewData() {
    // Get data based on current navigation level
    if (navigationPath.length === 2) {
        // Level 1: Department data
        return getDepartmentData(navigationPath[1]);
    } else if (navigationPath.length === 3) {
        // Level 2: Chapter data
        return getChapterData(navigationPath[1], navigationPath[2]);
    } else if (navigationPath.length === 4) {
        // Level 3: Post data
        return getPostData(navigationPath[1], navigationPath[2], navigationPath[3]);
    }
    
    return null;
}
```

## 📱 Mobile Optimization

### Touch-Friendly Buttons
```css
.copy-btn, .download-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
    border: 1px solid #000;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.copy-btn:hover, .download-btn:hover {
    background: #f0f0f0;
}

/* Mobile touch feedback */
.copy-btn:active, .download-btn:active {
    background: #e0e0e0;
    transform: scale(0.95);
}
```

### Mobile Button Layout
```css
.chart-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .chart-actions {
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .copy-btn, .download-btn {
        min-width: 48px;
        min-height: 48px;
    }
}
```

## 🎯 User Experience

### Success Feedback
1. **Visual**: Icon changes to checkmark (✓)
2. **Color**: Green color (#22c55e)
3. **Animation**: Scale up (1.2x)
4. **Duration**: 2 seconds
5. **Revert**: Returns to original icon

### Error Feedback
1. **Visual**: Icon changes to X
2. **Color**: Red color (#ef4444)
3. **Animation**: Scale down (0.8x)
4. **Duration**: 2 seconds
5. **Revert**: Returns to original icon

### Accessibility
```html
<!-- Accessible button labels -->
<button class="copy-btn" aria-label="Copy data to clipboard">
    <svg data-lucide="copy" aria-hidden="true"></svg>
</button>

<button class="download-btn" aria-label="Download as CSV">
    <svg data-lucide="download" aria-hidden="true"></svg>
</button>
```

## 🧪 Testing Copy & Download

### Manual Testing Checklist
- [ ] **Copy functionality**: Data copies to clipboard correctly
- [ ] **Download functionality**: CSV files download properly
- [ ] **Icon feedback**: Icons change to check/X appropriately
- [ ] **Visual feedback**: Colors and animations work
- [ ] **Error handling**: Graceful fallback for unsupported browsers
- [ ] **Mobile compatibility**: Touch-friendly on mobile devices
- [ ] **Accessibility**: Screen reader compatible

### Browser Compatibility
```javascript
// Feature detection
function supportsClipboardAPI() {
    return navigator.clipboard && window.isSecureContext;
}

function supportsDownload() {
    return typeof URL.createObjectURL === 'function';
}

// Fallback implementation
if (!supportsClipboardAPI()) {
    // Use document.execCommand fallback
    console.log('Using fallback copy method');
}
```

## 🚀 Performance Considerations

### Efficient Data Processing
```javascript
// Optimize CSV generation
function formatDataAsCSV(data) {
    // Use efficient string concatenation
    const rows = [];
    rows.push('date,value,index');
    
    if (data['2024'] !== null) rows.push(`2024-01-01,${data['2024']},1`);
    if (data['2025'] !== null) rows.push(`2025-01-01,${data['2025']},2`);
    if (data['2026'] !== null) rows.push(`2026-01-01,${data['2026']},3`);
    
    return rows.join('\n');
}
```

### Memory Management
```javascript
// Clean up URLs after download
function downloadChartCSV(data) {
    // ... download logic ...
    
    // Clean up
    URL.revokeObjectURL(url);
}
```

---

*The copy and download system provides comprehensive data export functionality with excellent user feedback and accessibility support across all navigation levels.*
