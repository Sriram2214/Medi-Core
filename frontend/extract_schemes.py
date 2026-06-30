import pandas as pd
import json
import os

file_path = r"C:\Hoscoo det\frontend\TN_and_Central_Govt_Health_Schemes (2).xlsx"

try:
    xl = pd.ExcelFile(file_path)
    all_records = []
    
    print("Sheets found:", xl.sheet_names)
    
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        df = df.fillna("")
        records = df.to_dict('records')
        print(f"Read {len(records)} from sheet '{sheet}'")
        
        # Optionally, add a field to indicate which sheet it came from
        for r in records:
            r['Category'] = sheet
            
        all_records.extend(records)
    
    out_path = r"C:\Hoscoo det\frontend\src\data\schemes.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)
        
    print("Total records extracted:", len(all_records))
except Exception as e:
    print("Error:", e)
