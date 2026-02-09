import pandas as pd
import json
import shutil
from datetime import datetime
from pathlib import Path

# Paths
data_dir = Path(r"c:\Users\maitr\.gemini\antigravity\scratch\antigravity-word-hoard\src\data")
excel_file = data_dir / "Liste refaite v7.xlsx"
json_file = data_dir / "words.json"
backup_file = data_dir / f"words_backup_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"

print(f"📂 Reading Excel file: {excel_file}")

# Read Excel file
df = pd.read_excel(excel_file)

print(f"✅ Loaded {len(df)} rows and {len(df.columns)} columns")
print(f"\n📋 Columns found:")
for i, col in enumerate(df.columns, 1):
    print(f"  {i}. {col}")

# Create backup of current words.json
if json_file.exists():
    print(f"\n💾 Creating backup: {backup_file.name}")
    shutil.copy(json_file, backup_file)

# Convert DataFrame to list of dictionaries
# Replace NaN with empty strings for consistency
df = df.fillna("")

# Convert to JSON-serializable format
words_data = df.to_dict(orient='records')

# Write to JSON file with proper formatting
print(f"\n💾 Writing to {json_file}")
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(words_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ Conversion complete!")
print(f"   - Total words: {len(words_data)}")
print(f"   - Backup saved: {backup_file.name}")
print(f"   - New file: {json_file.name}")

# Show sample of first word
if words_data:
    print(f"\n📝 Sample (first word):")
    sample = words_data[0]
    for key, value in list(sample.items())[:10]:  # Show first 10 fields
        print(f"   {key}: {value}")
    if len(sample) > 10:
        print(f"   ... and {len(sample) - 10} more fields")
