# Norwegian State Budget Explorer

An interactive website for exploring the Norwegian state budget data (Gul Bok).

## Project Structure

```
budget/
├── data/
│   ├── excel/          # Original Excel files
│   └── json/           # Converted JSON data files
├── scripts/            # Utility scripts
│   ├── excel_to_json.py    # Excel to JSON converter
│   └── verify_json.py      # JSON verification script
├── requirements.txt    # Python dependencies
└── README.md
```

## Data Files

The project includes Norwegian state budget data from "Gul Bok" (Yellow Book):
- `20241002_gulbok_data_til_publ.json` - Budget data for publication (1,588 records)
- `gul_bok_2024_datagrunnlag.json` - Budget data foundation 2024 (1,567 records)

Each JSON file contains two sheets:
- **Forklaring** (Explanation) - Column descriptions and metadata
- **Data** - Actual budget data with columns including:
  - gdep_nr, gdep_navn (Government department number/name)
  - avs_nr, avs_navn (Section number/name)
  - fdep_nr, fdep_navn (Finance department number/name)
  - omr_nr, omr_navn (Area number/name)
  - kat_nr, kat_navn (Category number/name)
  - kap_nr, kap_navn (Chapter number/name)
  - post_nr, post_navn (Item number/name)
  - stikkord (Keywords)
  - beløp (Amount)

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Convert Excel files to JSON (if needed):
```bash
python scripts/excel_to_json.py
```

## Next Steps

- [ ] Create web interface for budget exploration
- [ ] Add data visualization components
- [ ] Implement search and filter functionality
- [ ] Add interactive charts and graphs