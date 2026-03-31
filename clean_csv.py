#!/usr/bin/env python3
"""
CSV Cleaner for HUMUS Supabase Import
This script automatically fixes your CSV to match the Supabase businesses table.
"""

import csv
import sys
from pathlib import Path

def clean_csv(input_file):
    """Clean the CSV and prepare it for Supabase import."""
    
    # Check if file exists
    input_path = Path(input_file)
    if not input_path.exists():
        print(f"❌ Error: File '{input_file}' not found!")
        print("Make sure your CSV file is in the same folder as this script.")
        sys.exit(1)
    
    # Read the CSV
    print(f"📖 Reading: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        original_headers = reader.fieldnames or []
    
    print(f"✅ Found {len(rows)} rows")
    print(f"📋 Original columns: {', '.join(original_headers)}")
    
    # Clean and transform data
    cleaned_rows = []
    for i, row in enumerate(rows, 1):
        cleaned_row = {}
        
        # 1. Clean ID (remove timestamp after colon)
        raw_id = row.get('id', '')
        if ':' in raw_id:
            cleaned_id = raw_id.split(':')[0]
        else:
            cleaned_id = raw_id
        cleaned_row['id'] = cleaned_id
        
        # 2. Copy basic fields
        cleaned_row['name'] = row.get('name', '')
        cleaned_row['phone'] = row.get('phone', '')
        cleaned_row['category'] = row.get('category', '')
        cleaned_row['city'] = row.get('city', '')
        cleaned_row['address'] = row.get('address', '')
        cleaned_row['status'] = row.get('status', '')
        
        # 3. Map 'social media' to 'website'
        cleaned_row['website'] = row.get('social media', '') or row.get('social_media', '') or row.get('website', '')
        
        # 4. Add required columns with defaults
        # Map governorate from city (or use city if no mapping exists)
        city = cleaned_row['city']
        governorate_map = {
            'Baghdad': 'Baghdad',
            'Basra': 'Basra',
            'Erbil': 'Erbil',
            'Sulaymaniyah': 'Sulaymaniyah',
            'Dohuk': 'Dohuk',
            'Nineveh': 'Nineveh',
            'Mosul': 'Nineveh',
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
        }
        cleaned_row['governorate'] = governorate_map.get(city, city)
        
        # Add default values for required fields
        cleaned_row['rating'] = '0'
        cleaned_row['isPremium'] = 'false'
        cleaned_row['isFeatured'] = 'false'
        cleaned_row['isVerified'] = 'false'
        cleaned_row['reviewCount'] = '0'
        
        # Optional columns (empty if not present)
        cleaned_row['nameAr'] = row.get('nameAr', '') or row.get('name_ar', '')
        cleaned_row['nameKu'] = row.get('nameKu', '') or row.get('name_ku', '')
        cleaned_row['description'] = row.get('description', '')
        cleaned_row['descriptionAr'] = row.get('descriptionAr', '') or row.get('description_ar', '')
        cleaned_row['descriptionKu'] = row.get('descriptionKu', '') or row.get('description_ku', '')
        cleaned_row['imageUrl'] = row.get('imageUrl', '') or row.get('image', '') or row.get('logo', '')
        cleaned_row['coverImage'] = row.get('coverImage', '') or row.get('cover', '')
        cleaned_row['whatsapp'] = row.get('whatsapp', '')
        cleaned_row['subcategory'] = row.get('subcategory', '')
        cleaned_row['openHours'] = row.get('openHours', '') or row.get('open_hours', '')
        cleaned_row['priceRange'] = row.get('priceRange', '') or row.get('price_range', '')
        cleaned_row['lat'] = row.get('lat', '') or row.get('latitude', '')
        cleaned_row['lng'] = row.get('lng', '') or row.get('longitude', '')
        cleaned_row['tags'] = row.get('tags', '')
        cleaned_row['distance'] = row.get('distance', '')
        
        cleaned_rows.append(cleaned_row)
        
        if i <= 3:  # Show first 3 rows as preview
            print(f"  Row {i}: ID={cleaned_id}, Name={cleaned_row['name'][:30]}, City={city}")
    
    # Define final column order (must match Supabase table)
    final_columns = [
        'id', 'name', 'nameAr', 'nameKu', 'imageUrl', 'coverImage',
        'isPremium', 'isFeatured', 'category', 'subcategory', 'rating',
        'distance', 'status', 'isVerified', 'reviewCount', 'governorate',
        'city', 'address', 'phone', 'whatsapp', 'website', 'description',
        'descriptionAr', 'descriptionKu', 'openHours', 'priceRange', 'tags', 'lat', 'lng'
    ]
    
    # Write cleaned CSV
    output_file = input_path.stem + '_CLEANED_FOR_SUPABASE' + input_path.suffix
    print(f"\n✍️  Writing cleaned file: {output_file}")
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=final_columns)
        writer.writeheader()
        writer.writerows(cleaned_rows)
    
    print(f"\n🎉 SUCCESS! Your cleaned CSV is ready: {output_file}")
    print(f"\n📊 Summary:")
    print(f"   - Total rows: {len(cleaned_rows)}")
    print(f"   - Columns: {len(final_columns)}")
    print(f"   - IDs cleaned: {len(cleaned_rows)} timestamps removed")
    print(f"\n🚀 Next steps:")
    print(f"   1. Go to Supabase Dashboard → Table Editor → businesses")
    print(f"   2. Click 'Import data from CSV'")
    print(f"   3. Select this file: {output_file}")
    print(f"   4. Map columns (they should match automatically)")
    print(f"   5. Click Import!")
    
    return output_file

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Clean CSV for HUMUS Supabase import')
    parser.add_argument('input_file', nargs='?', help='Your CSV file (e.g., businesses.csv)')
    args = parser.parse_args()
    
    if not args.input_file:
        # Try to find CSV files in current directory
        csv_files = list(Path('.').glob('*.csv'))
        if len(csv_files) == 1:
            print(f"📁 Found CSV file: {csv_files[0]}")
            clean_csv(str(csv_files[0]))
        elif len(csv_files) > 1:
            print("📁 Found multiple CSV files:")
            for i, f in enumerate(csv_files, 1):
                print(f"   {i}. {f}")
            choice = input("\nEnter number of file to clean (or type filename): ").strip()
            try:
                idx = int(choice) - 1
                clean_csv(str(csv_files[idx]))
            except (ValueError, IndexError):
                clean_csv(choice)
        else:
            print("❌ No CSV files found in this folder.")
            print("Usage: python clean_csv.py your_file.csv")
            sys.exit(1)
    else:
        clean_csv(args.input_file)
