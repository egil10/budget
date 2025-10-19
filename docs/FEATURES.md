# Budget Website Features 🎯

## Year-over-Year Comparison

The website now supports comprehensive year-over-year budget analysis!

### 📊 Key Features

#### 1. Year Filter Dropdown
Located in the header, you can select:
- **Begge år (Both Years)** - Shows comparison cards with 2024 vs 2025
- **2025** - Shows only 2025 budget data
- **2024** - Shows only 2024 budget data

#### 2. Comparison Cards (When "Begge år" is selected)
Each card shows:
- **Side-by-side comparison** of 2024 and 2025 amounts
- **Percentage change** indicator (↑ for increase, ↓ for decrease)
- **Absolute change** in NOK
- **Number of budget items** for each year
- **Interactive trend chart** showing the change visually

#### 3. Budget Summary in Sidebar
When you open the sidebar (click home icon), you'll see:
- Total budget for 2024
- Total budget for 2025
- Total change in NOK and percentage
- Color-coded change (green for increase, red for decrease)

#### 4. Interactive Charts
Each comparison card includes a small Chart.js line chart showing:
- Visual representation of the change from 2024 to 2025
- Color-coded: green for increases, red for decreases
- Filled area chart for easy visualization

### 🎨 Visual Indicators

**Increases (Green):**
- ↑ symbol
- Green text (#22c55e)
- Upward trend in chart

**Decreases (Red):**
- ↓ symbol
- Red text (#ef4444)
- Downward trend in chart

### 📱 Responsive Design

The year comparison works perfectly on:
- Desktop (full side-by-side comparison)
- Tablet (optimized layout)
- Mobile (stacked view with clear indicators)

### 🔍 Use Cases

1. **Track Department Changes**
   - Filter by a specific department
   - See how their budget evolved year-over-year

2. **Find Large Changes**
   - Sort alphabetically or by default
   - Quickly spot chapters with significant changes

3. **Search Specific Items**
   - Search for keywords like "forskning" (research)
   - See year-over-year changes for matching items

4. **Export-Ready Data**
   - All amounts in Norwegian currency format
   - Clear percentage changes
   - Professional presentation

### 💡 Tips

- **Default View**: The page loads with "Begge år" selected, showing all comparisons
- **Performance**: The website loads both datasets efficiently (~3,000+ items)
- **Theme Support**: Year comparison works in both light and dark modes
- **Real-time Filtering**: Search and filters update comparison cards instantly

### 🚀 Technical Implementation

- **Dual Data Loading**: Both 2024 and 2025 budgets loaded on startup
- **Smart Matching**: Items matched by department and chapter names
- **Chart.js Integration**: Lightweight charts for trend visualization
- **Color-Coded Changes**: Automatic color coding based on positive/negative changes
- **Norwegian Formatting**: All amounts formatted with NOK symbol and proper separators

### 📈 Example Insights

With the year comparison, you can answer questions like:
- "Which departments got the largest budget increases?"
- "How much did the defense budget change?"
- "What percentage of the total budget is allocated to health in 2025 vs 2024?"
- "Which specific chapters saw budget cuts?"

---

## Future Enhancements (Ideas)

- [ ] Multi-year comparison (add more historical data)
- [ ] Export comparison data to CSV
- [ ] Department-level summary charts
- [ ] Filtering by change magnitude (show only >10% changes)
- [ ] Detailed drill-down views for specific chapters

