# Norwegian State Budget Explorer 🏛️

An interactive website for exploring the Norwegian state budget data (Gul Bok). Browse, search, and visualize how Norway spends its money.

## 🚀 Quick Start

### 1. View the Website

```bash
# Start local server
python -m http.server 8000

# Open in browser
open http://localhost:8000/
```

The website is now running at `http://localhost:8000`!

### 2. Explore the Data

- **Year Comparison**: Select "Begge år" to see year-over-year changes (2024 vs 2025)
- **Search**: Use the search bar to find specific budget items
- **Filter**: Click the filter icon to filter by department
- **Browse**: Click the sidebar icon to browse by category and see total budget summary
- **Theme**: Toggle between light and dark mode

## 📁 Project Structure

```
budget/
├── index.html          # Main application entry point
├── src/
│   ├── css/           # Stylesheets
│   │   ├── theme.css     # Theme variables and base styles
│   │   └── main.css      # Main application styles
│   └── js/            # JavaScript modules
│       ├── main.js       # Main application logic
│       ├── config.js     # Configuration and utilities
│       └── theme.js      # Theme toggle functionality
├── data/
│   ├── excel/         # Original Excel files (source data)
│   │   ├── 20241002_gulbok_data_til_publ.xlsx
│   │   └── gul_bok_2024_datagrunnlag.xlsx
│   └── json/          # Converted JSON data files
│       ├── 20241002_gulbok_data_til_publ.json
│       └── gul_bok_2024_datagrunnlag.json
├── scripts/           # Utility scripts
│   └── excel_to_json.py  # Excel to JSON converter
├── requirements.txt   # Python dependencies
└── README.md
```

## 📊 Data Overview

The project includes Norwegian state budget data from "Gul Bok" (Yellow Book):
- **20241002_gulbok_data_til_publ.json** - 2025 Budget data (1,588 records)
- **gul_bok_2024_datagrunnlag.json** - 2024 Budget data (1,567 records)

### Year-over-Year Comparison

The website automatically loads both 2024 and 2025 budget data, allowing you to:
- Compare budget changes between years
- See percentage increases/decreases
- Visualize trends with interactive charts
- Track how specific departments and chapters evolve

### Data Structure

Each JSON file contains two sheets:

#### Forklaring (Explanation)
- Column descriptions and metadata

#### Data (Budget Items)
- **gdep_nr, gdep_navn** - Government department number/name
- **avs_nr, avs_navn** - Section number/name
- **fdep_nr, fdep_navn** - Finance department number/name
- **omr_nr, omr_navn** - Area number/name
- **kat_nr, kat_navn** - Category number/name
- **kap_nr, kap_navn** - Chapter number/name
- **post_nr, post_navn** - Item number/name
- **stikkord** - Keywords
- **beløp** - Amount (in thousands of NOK)

## 🛠️ Development

### Converting Excel to JSON

If you need to convert new Excel files:

```bash
# Install dependencies
pip install -r requirements.txt

# Run converter
python scripts/excel_to_json.py
```

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: CSS with CSS custom properties for theming
- **Data**: JSON files from Excel source
- **Server**: Python HTTP server (for local development)

### Features

✅ **Year-over-Year Comparison** - Compare 2024 vs 2025 budgets  
✅ **Interactive Charts** - Visualize budget trends with Chart.js  
✅ **Search & Filter** - Find specific budget items instantly  
✅ **Department Filtering** - Focus on specific government departments  
✅ **Category Browsing** - Navigate by budget categories  
✅ **Budget Summary** - See total budget and year-over-year changes  
✅ **Light/Dark Theme** - Toggle between themes  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Norwegian Formatting** - Proper currency and number formatting  

## 🎨 Design

The website is inspired by modern Norwegian data dashboards, featuring:
- Clean, minimalist interface
- Department-specific color coding
- Accessible typography
- Smooth transitions
- Mobile-optimized layout

## 📝 Data Sources

- **Source**: [Statsbudsjettet (Gul Bok)](https://www.statsbudsjettet.no/)
- **Format**: Excel → JSON
- **Update Frequency**: Annually (with the state budget)

## 🚢 Deployment

### GitHub Pages

1. Push to main branch
2. Enable GitHub Pages in repository settings
3. Set source to `main` branch, root directory
4. Your site will be available at `https://yourusername.github.io/budget/`

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/budget.git
cd budget

# Start server
python -m http.server 8000
```

## 📄 License

This project visualizes public data from the Norwegian state budget. The data is publicly available and provided by the Norwegian Ministry of Finance.

## 🙏 Acknowledgments

- **Norwegian Ministry of Finance** for providing the budget data (Gul Bok)
- **Chart.js** for the charting library
- **Inspired by**: Modern Norwegian data dashboards