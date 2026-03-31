# SUPABASE IMPORT DIAGNOSIS

## 1. Table Schema

**Table:** `public.businesses`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NOT NULL | - | **PRIMARY KEY** |
| `name` | text | NOT NULL | - | Required |
| `nameAr` | text | NULL | - | Arabic name |
| `nameKu` | text | NULL | - | Kurdish name |
| `imageUrl` | text | NULL | - | Logo image |
| `coverImage` | text | NULL | - | Cover photo |
| `isPremium` | boolean | NOT NULL | false | Paid tier flag |
| `isFeatured` | boolean | NOT NULL | false | Homepage spotlight |
| `category` | text | NOT NULL | - | Business type |
| `subcategory` | text | NULL | - | Specific type |
| `rating` | numeric(3,2) | NOT NULL | 0 | 0-5 scale |
| `distance` | numeric(8,2) | NULL | - | km from user |
| `status` | text | NULL | - | open/closed/pending |
| `isVerified` | boolean | NOT NULL | false | Badge flag |
| `reviewCount` | integer | NOT NULL | 0 | Number of reviews |
| `governorate` | text | NULL | - | Province/state |
| `city` | text | NULL | - | City name |
| `address` | text | NULL | - | Street address |
| `phone` | text | NULL | - | Phone number |
| `whatsapp` | text | NULL | - | WhatsApp number |
| `website` | text | NULL | - | URL/social |
| `description` | text | NULL | - | Main description |
| `descriptionAr` | text | NULL | - | Arabic desc |
| `descriptionKu` | text | NULL | - | Kurdish desc |
| `openHours` | text | NULL | - | Business hours |
| `priceRange` | smallint | NULL | - | 1-4 ($ to $$$$) |
| `tags` | text[] | NULL | '{}' | Array of labels |
| `lat` | double | NULL | - | Latitude |
| `lng` | double | NULL | - | Longitude |

**Key Constraints:**
- Primary key: `id` (must be unique)
- NOT NULL: `id`, `name`, `category`, `isPremium`, `isFeatured`, `rating`, `isVerified`, `reviewCount`
- All other columns are optional

---

## 2. Incoming Data Problems

Based on screenshot of your CSV:

### Critical Issues:
- ❌ **Malformatted IDs**: `00e1d3069-913:2026-03-18 16:17:57` contains timestamps
- ❌ **Extra column**: `created_at` does not exist in Supabase table
- ❌ **Wrong column name**: `social media` should be `website`
- ❌ **Missing column**: `governorate` is required for filtering
- ❌ **Missing required defaults**: `rating`, `isPremium`, `isVerified`, `reviewCount`

### Data Quality Issues:
- ⚠️ **Phone numbers**: May contain spaces/symbols, need cleaning
- ⚠️ **Status values**: "pending" is okay, but verify consistency
- ⚠️ **Category names**: Should match constants.tsx categories
- ⚠️ **City names**: Must map correctly to governorates

### Missing Columns (need defaults):
- `nameAr`, `nameKu` (Arabic/Kurdish names)
- `imageUrl`, `coverImage` (photos)
- `subcategory` (refined category)
- `distance`, `lat`, `lng` (location data)
- `whatsapp`, `description`, `openHours`
- `priceRange`, `tags`

---

## 3. Recommended Fix Path

### ✅ OPTION A: Modify the CSV Only (RECOMMENDED)

**Why:** Non-destructive, preserves table structure, reversible, works with Supabase's CSV import UI.

**Approach:**
1. Clean ID values (remove timestamps)
2. Rename `social media` → `website`
3. Delete `created_at` column
4. Add missing columns with safe defaults
5. Derive `governorate` from `city`
6. Export clean CSV for direct import

---

## 4. Column Mapping

| Your CSV Column | Supabase Column | Action |
|-----------------|-----------------|--------|
| `id` | `id` | **CLEAN** - Remove timestamp suffix |
| `name` | `name` | ✅ Direct copy |
| `phone` | `phone` | Clean - Remove non-digits |
| `category` | `category` | ✅ Direct copy |
| `city` | `city` | ✅ Direct copy |
| `address` | `address` | ✅ Direct copy |
| `status` | `status` | ✅ Direct copy |
| `social media` | `website` | **RENAME** |
| `created_at` | — | **DELETE** - Column not in table |
| — | `governorate` | **ADD** - Derive from city |
| — | `rating` | **ADD** - Default: 0 |
| — | `isPremium` | **ADD** - Default: false |
| — | `isFeatured` | **ADD** - Default: false |
| — | `isVerified` | **ADD** - Default: false |
| — | `reviewCount` | **ADD** - Default: 0 |
| — | All others | **ADD** - Empty defaults |

---

## 5. SQL Fixes

### Only needed if CSV import fails. Keep as backup.

```sql
-- Check current table state
SELECT COUNT(*) FROM public.businesses;

-- Truncate if you need to re-import (DELETES ALL DATA)
-- TRUNCATE public.businesses;

-- Insert cleaned data (example row)
INSERT INTO public.businesses (
    id, name, category, city, governorate, 
    phone, address, status, website,
    rating, isPremium, isFeatured, isVerified, reviewCount
) VALUES (
    '00e1d3069-913', 'Basra Fuel Station', 'fuel', 'Basra', 'Basra',
    '07702206086', 'Street 9, Kmat', 'pending', '',
    0, false, false, false, 0
)
ON CONFLICT (id) DO NOTHING;
```

---

## 6. Python Cleaner Script

Save this as `clean_csv_final.py` in your project folder:

```python
#!/usr/bin/env python3
import csv
import re
from pathlib import Path

# Expected Supabase columns in order
COLUMNS = [
    'id', 'name', 'nameAr', 'nameKu', 'imageUrl', 'coverImage',
    'isPremium', 'isFeatured', 'category', 'subcategory', 'rating',
    'distance', 'status', 'isVerified', 'reviewCount', 'governorate',
    'city', 'address', 'phone', 'whatsapp', 'website', 'description',
    'descriptionAr', 'descriptionKu', 'openHours', 'priceRange', 'tags', 'lat', 'lng'
]

CITY_TO_GOVERNORATE = {
    'Baghdad': 'Baghdad', 'Basra': 'Basra', 'Erbil': 'Erbil',
    'Sulaymaniyah': 'Sulaymaniyah', 'Mosul': 'Nineveh', 'Kirkuk': 'Kirkuk',
    'Dohuk': 'Dohuk', 'Anbar': 'Anbar', 'Babil': 'Babil',
    'Karbala': 'Karbala', 'Najaf': 'Najaf', 'Qadisiyyah': 'Qadisiyyah',
    'Wasit': 'Wasit', 'Maysan': 'Maysan', 'Dhi Qar': 'Dhi Qar',
    'Muthanna': 'Muthanna', 'Diyala': 'Diyala', 'Halabja': 'Halabja'
}

def clean_id(raw_id):
    """Remove timestamp from ID"""
    if not raw_id:
        return ''
    return re.sub(r':\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$', '', raw_id)

def clean_phone(phone):
    """Remove non-digits from phone"""
    if not phone:
        return ''
    return re.sub(r'[^\d+]', '', str(phone))

def process_row(row):
    """Transform one row to Supabase format"""
    result = {}
    
    # Core fields with cleaning
    result['id'] = clean_id(row.get('id', ''))
    result['name'] = row.get('name', '').strip()
    result['phone'] = clean_phone(row.get('phone', ''))
    result['category'] = row.get('category', '').strip()
    result['city'] = row.get('city', '').strip()
    result['address'] = row.get('address', '').strip()
    result['status'] = row.get('status', '').strip()
    
    # Map social media to website
    result['website'] = row.get('social media', '').strip()
    
    # Derive governorate
    result['governorate'] = CITY_TO_GOVERNORATE.get(result['city'], result['city'])
    
    # Set defaults for missing columns
    result['nameAr'] = ''
    result['nameKu'] = ''
    result['imageUrl'] = ''
    result['coverImage'] = ''
    result['isPremium'] = 'false'
    result['isFeatured'] = 'false'
    result['rating'] = '0'
    result['distance'] = ''
    result['isVerified'] = 'false'
    result['reviewCount'] = '0'
    result['subcategory'] = ''
    result['whatsapp'] = ''
    result['description'] = ''
    result['descriptionAr'] = ''
    result['descriptionKu'] = ''
    result['openHours'] = ''
    result['priceRange'] = ''
    result['tags'] = '{}'
    result['lat'] = ''
    result['lng'] = ''
    
    return result

# Main execution
if __name__ == '__main__':
    import sys
    
    # Find CSV file
    csv_files = list(Path('.').glob('*.csv'))
    if not csv_files:
        print("❌ No CSV files found!")
        sys.exit(1)
    
    input_file = csv_files[0]  # Use first CSV found
    print(f"📖 Processing: {input_file}")
    
    # Read and clean
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = [process_row(row) for row in reader]
    
    # Remove duplicates
    seen_ids = set()
    unique_rows = []
    for row in rows:
        if row['id'] and row['id'] not in seen_ids:
            seen_ids.add(row['id'])
            unique_rows.append(row)
    
    print(f"✅ Cleaned {len(unique_rows)} rows ({len(rows) - len(unique_rows)} duplicates removed)")
    
    # Write output
    output_file = f"{input_file.stem}_CLEANED_FOR_SUPABASE.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(unique_rows)
    
    print(f"🎉 Output saved: {output_file}")
    print(f"\nNext: Go to Supabase → Table Editor → businesses → Import data from CSV")
```

**Even easier:** Use the batch file `RUN_CLEANER.bat` (already created) - just double-click it.

---

## 7. Import Instructions

### Step 1: Clean Your CSV (30 seconds)

**Option A - Double-click (easiest):**
1. Put your CSV file in the same folder as `RUN_CLEANER.bat`
2. Double-click `RUN_CLEANER.bat`
3. Wait for "Output saved" message

**Option B - Command line:**
1. Open Terminal in project folder
2. Type: `python clean_csv_final.py`
3. Press Enter

### Step 2: Import to Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Your project
2. Click **Table Editor** (left sidebar)
3. Click **businesses** table
4. Click green **Insert** button → **Import data from CSV**
5. Drag your `*_CLEANED_FOR_SUPABASE.csv` file OR click to browse
6. Verify the column mapping (should auto-match)
7. Click **Import**
8. Wait for success message

### Step 3: Verify Import

1. In Supabase, click **Table Editor** → **businesses**
2. You should see your rows loaded
3. Check that `id`, `name`, `category` columns have values
4. Run your HUMUS app: `npm run dev`
5. Open browser → Businesses should appear!

### If Import Fails:

| Error | Fix |
|-------|-----|
| "Column not found" | Make sure you're importing the CLEANED file, not original |
| "Duplicate key" | IDs are not unique - check CSV for duplicate IDs |
| "Invalid boolean" | Ensure `isPremium`/`isVerified` are `false` not `FALSE` or `0` |
| "NULL value in required column" | Ensure `id`, `name`, `category` have no empty cells |

---

## 8. Final Check

After successful import, you should see:

✅ **In Supabase Dashboard:**
- Table Editor → businesses shows your rows
- No red error indicators
- Row count matches your CSV (minus duplicates)

✅ **In HUMUS App:**
- Run `npm run dev`
- Open http://localhost:5173
- Business cards appear on homepage
- Search/filter works
- No console errors

✅ **Data integrity:**
- All businesses have names
- Categories match dropdown options
- Cities display correctly
- Phone numbers are clickable

---

## Quick Reference

**File locations:**
- Your CSV: Put in `SPACETEETH148/` folder
- Cleaner script: `clean_csv_final.py`
- Batch runner: `RUN_CLEANER.bat`
- Cleaned output: `*_CLEANED_FOR_SUPABASE.csv`

**Required columns in final CSV:**
`id`, `name`, `category`, `city`, `governorate`, `phone`, `address`, `status`, `website`, `rating`, `isPremium`, `isFeatured`, `isVerified`, `reviewCount`

**Supabase URL:** https://supabase.com/dashboard/project/hsadukhmclvwiuntqwu

---

**Need help?** Run the cleaner and tell me any error messages you see.
