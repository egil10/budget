# Statsbudsjettet Documentation

Welcome to the Norwegian State Budget visualization platform. This documentation provides comprehensive information about the project structure, features, and usage.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Data Sources](#data-sources)
- [Installation & Setup](#installation--setup)
- [Development Guide](#development-guide)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## 🎯 Overview

Statsbudsjettet is a web-based visualization platform for the Norwegian State Budget data. It provides interactive charts, department comparisons, and detailed budget analysis across multiple years (2024, 2025, 2026).

### Key Features
- **Multi-year comparison**: View budget data across 2024, 2025, and 2026
- **Department aggregation**: High-level overview of budget allocations by department
- **Interactive charts**: SVG-based line charts with detailed trend analysis
- **Download functionality**: Export budget cards as standalone HTML files
- **Responsive design**: Optimized for desktop and mobile devices
- **Real-time filtering**: Navigate between departments and budget posts

## 🏗️ Project Structure

```
budget/
├── data/
│   ├── excel/           # Original Excel data files
│   └── json/            # Converted JSON data files
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── src/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   └── assets/          # Static assets
├── index.html           # Main application entry point
├── favicon.ico          # Site favicon
└── README.md            # Project overview
```

## 🚀 Features

### 1. Department Overview (Hjem)
- Alphabetical listing of all government departments
- Total budget amounts for 2024, 2025, and 2026
- Net change calculations and percentages
- Click-to-drill-down functionality

### 2. Budget Post Analysis
- Detailed breakdown by individual budget posts
- Year-over-year comparisons
- Interactive SVG charts showing trends
- Department grouping for easy navigation

### 3. Chart Visualization
- Pure SVG-based line charts (no external dependencies)
- Consistent color coding (green for increases, red for decreases)
- Responsive design that scales with container
- Download functionality for individual charts

### 4. Mobile Responsiveness
- Adaptive navigation (dropdown on mobile, buttons on desktop)
- Optimized chart sizing for different screen sizes
- Touch-friendly interface elements

## 📊 Data Sources

### Official Sources
- **2024**: [Statsbudsjettet 2024 - Tallgrunnlag](https://www.regjeringen.no/no/statsbudsjett/2024/statsbudsjettet-2024-tallgrunnlag/id2998136/)
- **2025**: [Statsbudsjett 2025 - Tallgrunnlag Gul Bok](https://www.regjeringen.no/no/statsbudsjett/2025/tallgrunnlag-gul-bok/id3055673/)
- **2026**: [Statsbudsjett 2026 - Tallgrunnlag Gul Bok](https://www.regjeringen.no/no/statsbudsjett/2026/tallgrunnlag-gul-bok/)

### Data Format
- **Excel files**: Original data in `.xlsx` format
- **JSON files**: Converted data with standardized structure
- **Fields**: Department codes, budget amounts, post descriptions, etc.

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7+ (for data conversion scripts)
- Modern web browser with ES6+ support
- Local web server (for development)

### Quick Start
1. Clone the repository
2. Run the data conversion script:
   ```bash
   python scripts/excel_to_json.py
   ```
3. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```
4. Open `http://localhost:8000` in your browser

### Data Conversion
The project includes automated data conversion from Excel to JSON format:

```bash
# Convert all Excel files to JSON
python scripts/excel_to_json.py

# The script will:
# - Read all .xlsx files from data/excel/
# - Convert to JSON format in data/json/
# - Handle multiple sheets and data cleaning
```

## 🔧 Development Guide

### File Organization
- **`src/js/main.js`**: Core application logic and data handling
- **`src/css/main.css`**: Main stylesheet with responsive design
- **`src/css/theme.css`**: Theme-specific styling
- **`scripts/excel_to_json.py`**: Data conversion utility

### Key Functions
- **`loadBudgetData()`**: Loads and processes budget data from JSON files
- **`renderDepartmentAggregates()`**: Creates department overview cards
- **`renderComparisonView()`**: Renders detailed budget post analysis
- **`createHTMLChart()`**: Generates SVG charts for budget trends

### Adding New Data Years
1. Add Excel file to `data/excel/`
2. Run conversion script: `python scripts/excel_to_json.py`
3. Update `loadBudgetData()` function in `main.js`
4. Modify chart functions to handle additional data points

### Styling Guidelines
- Use CSS Grid for layouts
- Maintain consistent spacing with CSS custom properties
- Ensure mobile-first responsive design
- Follow Norwegian design standards for government websites

## 📱 Browser Support

- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Ensure mobile compatibility

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Live Demo**: [GitHub Pages](https://egil10.github.io/budget/)
- **Repository**: [GitHub](https://github.com/egil10/budget)
- **Issues**: [GitHub Issues](https://github.com/egil10/budget/issues)

---

*Last updated: October 2025*
