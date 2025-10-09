"""Quick script to verify JSON conversion"""
import json

with open('data/json/20241002_gulbok_data_til_publ.json', encoding='utf-8') as f:
    data = json.load(f)
    print(f"Sheets: {list(data.keys())}")
    print(f"\nData sheet - First record keys:")
    for key in list(data['Data'][0].keys()):
        print(f"  - {key}")
    print(f"\nTotal records in Data sheet: {len(data['Data'])}")
    print(f"Total records in Forklaring sheet: {len(data['Forklaring'])}")

