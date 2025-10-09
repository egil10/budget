"""
Script to convert Excel files from data/excel to JSON format in data/json
"""
import pandas as pd
import json
import os
from pathlib import Path

def convert_excel_to_json(excel_path, json_path):
    """
    Convert an Excel file to JSON format.
    Handles multiple sheets if present.
    """
    print(f"Processing: {excel_path}")
    
    # Read all sheets from the Excel file
    excel_file = pd.ExcelFile(excel_path)
    
    # Get the base filename without extension
    base_name = Path(excel_path).stem
    
    if len(excel_file.sheet_names) == 1:
        # Single sheet - save as single JSON file
        df = pd.read_excel(excel_path, sheet_name=0)
        output_file = os.path.join(json_path, f"{base_name}.json")
        
        # Convert to JSON with proper handling of NaN values
        data = df.to_dict(orient='records')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"  [OK] Created: {output_file}")
        print(f"       Rows: {len(df)}, Columns: {len(df.columns)}")
    else:
        # Multiple sheets - save each sheet separately
        all_sheets = {}
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_path, sheet_name=sheet_name)
            all_sheets[sheet_name] = df.to_dict(orient='records')
            print(f"  [OK] Processed sheet: {sheet_name} (Rows: {len(df)}, Columns: {len(df.columns)})")
        
        # Save combined file with all sheets
        output_file = os.path.join(json_path, f"{base_name}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_sheets, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"  [OK] Created: {output_file}")

def main():
    # Define paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    excel_dir = project_root / "data" / "excel"
    json_dir = project_root / "data" / "json"
    
    # Ensure json directory exists
    json_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all Excel files
    excel_files = list(excel_dir.glob("*.xlsx")) + list(excel_dir.glob("*.xls"))
    
    if not excel_files:
        print("No Excel files found in data/excel/")
        return
    
    print(f"Found {len(excel_files)} Excel file(s) to convert\n")
    
    # Convert each Excel file
    for excel_file in excel_files:
        convert_excel_to_json(excel_file, json_dir)
        print()
    
    print("[SUCCESS] Conversion complete!")

if __name__ == "__main__":
    main()

