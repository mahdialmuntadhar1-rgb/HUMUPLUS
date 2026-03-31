#!/usr/bin/env python3
"""
SUPABASE CSV CLEANER - Phase 5 Production Script
Reads your messy CSV, outputs import-ready data for HUMUS Supabase.
"""

import csv
import sys
import re
from pathlib import Path
from typing import List, Dict, Any

# Supabase businesses table schema (column order matters for INSERT)
SUPABASE_COLUMNS = [
    'id', 'name', 'nameAr', 'nameKu', 'imageUrl', 'coverImage',
    'isPremium', 'isFeatured', 'category', 'subcategory', 'rating',
    'distance', 'status', 'isVerified', 'reviewCount', 'governorate',
    'city', 'address', 'phone', 'whatsapp', 'website', 'description',
    'descriptionAr', 'descriptionKu', 'openHours', 'priceRange', 'tags', 'lat', 'lng'
]

# Columns that must have values
REQUIRED_COLUMNS = ['id', 'name', 'category']

# Default values for missing columns
DEFAULTS = {
    'isPremium': 'false',
    'isFeatured': 'false',
    'rating': '0',
    'isVerified': 'false',
    'reviewCount': '0',
    'tags': '{}',
    'distance': '',
    'subcategory': '',
    'nameAr': '',
    'nameKu': '',
    'imageUrl': '',
    'coverImage': '',
    'governorate': '',
    'whatsapp': '',
    'website': '',
    'description': '',
    'descriptionAr': '',
    'descriptionKu': '',
    'openHours': '',
    'priceRange': '',
    'lat': '',
    'lng': ''
}

# Map cities to governorates
CITY_TO_GOVERNORATE = {
    'Baghdad': 'Baghdad',
    'Basra': 'Basra', 
    'Erbil': 'Erbil',
    'Sulaymaniyah': 'Sulaymaniyah',
    'Dohuk': 'Dohuk',
    'Mosul': 'Nineveh',
    'Nineveh': 'Nineveh',
    'Anbar': 'Anbar',
    'Babil': 'Babil',
    'Karbala': 'Karbala',
    'Najaf': 'Najaf',
    'Qadisiyyah': 'Qadisiyyah',
    'Wasit': 'Wasit',
    'Maysan': 'Maysan',
    'Dhi Qar': 'Dhi Qar',
    'Muthanna': 'Muthanna',
    'Diyala': 'Diyala',
    'Kirkuk': 'Kirkuk',
    'Salah al-Din': 'Salah al-Din',
    'Halabja': 'Halabja'
}


def clean_id(raw_id: str) -> str:
    """Remove timestamps and garbage from ID."""
    if not raw_id:
        return ''
    # Remove timestamp pattern like :2026-03-18 16:17:57
    cleaned = re.sub(r':\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$', '', raw_id)
    # Remove any remaining colons and timestamps
    cleaned = cleaned.split(':')[0]
    return cleaned.strip()


def derive_governorate(city: str) -> str:
    """Map city to governorate."""
    if not city:
        return ''
    city = city.strip()
    return CITY_TO_GOVERNORATE.get(city, city)


def clean_phone(phone: str) -> str:
    """Clean phone number."""
    if not phone:
        return ''
    # Keep only digits and +
    cleaned = re.sub(r'[^\d+]', '', str(phone))
    return cleaned


def process_row(row: Dict[str, str], row_num: int) -> Dict[str, str]:
    """Transform one CSV row to match Supabase schema."""
    result = {}
    
    # 1. ID - CRITICAL: Clean malformed IDs
    raw_id = row.get('id', '')
    result['id'] = clean_id(raw_id)
    
    # 2. Basic fields - direct mapping
    result['name'] = row.get('name', '').strip()
    result['phone'] = clean_phone(row.get('phone', ''))
    result['category'] = row.get('category', '').strip()
    result['city'] = row.get('city', '').strip()
    result['address'] = row.get('address', '').strip()
    result['status'] = row.get('status', '').strip()
    
    # 3. Map 'social media' to 'website'
    social = row.get('social media', '') or row.get('social_media', '') or row.get('website', '')
    result['website'] = social.strip()
    
    # 4. Derive governorate from city
    result['governorate'] = derive_governorate(result['city'])
    
    # 5. Apply all defaults
    for col, default_val in DEFAULTS.items():
        result[col] = default_val
    
    return result


def validate_row(row: Dict[str, str], row_num: int) -> List[str]:
    """Check for problems in a row."""
    errors = []
    
    if not row['id']:
        errors.append(f"Row {row_num}: Missing ID")
    if not row['name']:
        errors.append(f"Row {row_num}: Missing name")
    if not row['category']:
        errors.append(f"Row {row_num}: Missing category")
    
    return errors


def clean_csv(input_path: str) -> tuple:
    """
    Main cleaning function.
    Returns: (output_path, stats, errors)
    """
    input_file = Path(input_path)
    if not input_file.exists():
        raise FileNotFoundError(f"File not found: {input_path}")
    
    print(f"📖 Reading: {input_file}")
    
    # Read CSV
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        raw_rows = list(reader)
        original_headers = reader.fieldnames or []
    
    print(f"   Found {len(raw_rows)} rows, {len(original_headers)} columns")
    print(f"   Original columns: {', '.join(original_headers)}")
    
    # Process all rows
    cleaned_rows = []
    all_errors = []
    seen_ids = set()
    duplicates = 0
    
    for i, row in enumerate(raw_rows, 1):
        cleaned = process_row(row, i)
        
        # Check for duplicates
        if cleaned['id'] in seen_ids:
            duplicates += 1
            print(f"   ⚠️  Duplicate ID skipped: {cleaned['id']}")
            continue
        
        if cleaned['id']:
            seen_ids.add(cleaned['id'])
        
        # Validate
        errors = validate_row(cleaned, i)
        all_errors.extend(errors)
        
        cleaned_rows.append(cleaned)
    
    # Write cleaned CSV
    output_file = input_file.parent / f"{input_file.stem}_CLEANED_FOR_SUPABASE.csv"
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=SUPABASE_COLUMNS)
        writer.writeheader()
        writer.writerows(cleaned_rows)
    
    # Stats
    stats = {
        'input_rows': len(raw_rows),
        'output_rows': len(cleaned_rows),
        'duplicates_removed': duplicates,
        'errors': len(all_errors)
    }
    
    return str(output_file), stats, all_errors


def generate_sql_inserts(csv_path: str, output_sql_path: str):
    """Generate SQL INSERT statements as backup option."""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    sql_lines = [
        "-- SQL INSERT script for Supabase businesses table",
        "-- Generated by HUMUS CSV cleaner",
        "",
        "BEGIN;",
        ""
    ]
    
    for row in rows[:100]:  # Limit to first 100 for demo
        columns = []
        values = []
        
        for col in SUPABASE_COLUMNS:
            val = row.get(col, '')
            if val and val != '{}':
                columns.append(f'"{col}"')
                # Escape single quotes
                val_escaped = val.replace("'", "''")
                values.append(f"'{val_escaped}'")
        
        if columns:
            sql = f"INSERT INTO public.businesses ({', '.join(columns)})"
            sql += f"\n  VALUES ({', '.join(values)})"
            sql += "\n  ON CONFLICT (id) DO NOTHING;"
            sql_lines.append(sql)
            sql_lines.append("")
    
    sql_lines.append("COMMIT;")
    
    with open(output_sql_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    return output_sql_path


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Clean CSV for HUMUS Supabase import',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python clean_csv_final.py mydata.csv
  python clean_csv_final.py mydata.csv --sql
        """
    )
    parser.add_argument('input_file', help='Your CSV file')
    parser.add_argument('--sql', action='store_true', help='Also generate SQL insert script')
    args = parser.parse_args()
    
    try:
        # Clean the CSV
        output_path, stats, errors = clean_csv(args.input_file)
        
        print("\n" + "="*60)
        print("✅ CLEANING COMPLETE")
        print("="*60)
        print(f"\n📁 Output file: {output_path}")
        print(f"\n📊 Statistics:")
        print(f"   Input rows:  {stats['input_rows']}")
        print(f"   Output rows: {stats['output_rows']}")
        print(f"   Duplicates removed: {stats['duplicates_removed']}")
        print(f"   Errors found: {stats['errors']}")
        
        if errors:
            print(f"\n⚠️  Errors (first 10):")
            for err in errors[:10]:
                print(f"   - {err}")
        
        # Generate SQL if requested
        if args.sql:
            sql_path = Path(output_path).parent / f"{Path(output_path).stem}_INSERTS.sql"
            generate_sql_inserts(output_path, str(sql_path))
            print(f"\n📄 SQL script: {sql_path}")
        
        print("\n" + "="*60)
        print("NEXT STEPS:")
        print("="*60)
        print("1. Go to Supabase Dashboard → Table Editor → businesses")
        print("2. Click 'Import data from CSV'")
        print(f"3. Select: {Path(output_path).name}")
        print("4. Verify column mapping, then click Import")
        print("\n🎉 Your data will be live!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
