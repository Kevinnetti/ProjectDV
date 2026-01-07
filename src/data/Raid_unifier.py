import pandas as pd
import os

files = [
    "raids.csv",
    "Yemen Data Project Published - US UK - Operation Poseidon Archer_12 January 2024 to 28 February 2025.csv",
    "Yemen Data Project- Published Data-Operation Rough Rider_15 March - 6 May 2025.csv",
    "Dec2025_Yemen Data Project Published - Israel database from 20 July 2024 to 30 September 2025.csv"
]

# defaults aligned with files by index
defaults = [
    ("Saudi-led Coalition", 'Air Raid'),
    ("US/UK", 'Airstrike'),
    ("Unknown", 'Unknown'),
    ("Israel", 'Airstrike')
]

loaded = []  # will store tuples (filename, df, default_actor, weapon_default)
for idx, f in enumerate(files):
    if not os.path.exists(f):
        print(f"Skipping missing file: {f}")
        continue
    df = None
    # try common encodings
    for enc in ('utf-8', 'cp1252', 'latin-1'):
        try:
            df = pd.read_csv(f, encoding=enc)
            break
        except Exception:
            df = None
    if df is None:
        print(f"Error loading {f}: could not decode with utf-8/cp1252/latin-1")
        continue
    loaded.append((f, df, defaults[idx][0], defaults[idx][1]))

def clean_and_standardize(df, default_actor, weapon_type_default):
    df = df.copy()
    df = df.dropna(how='all')
    df.columns = [c.strip() for c in df.columns]
    
    if 'Date' in df.columns:
        df = df.dropna(subset=['Date'])
    
    rename_map = {}
    for col in df.columns:
        c_lower = col.lower()
        if c_lower == 'min air raids': rename_map[col] = 'Min Projectiles'
        elif c_lower == 'max air raids': rename_map[col] = 'Max Projectiles'
        elif c_lower == 'min projectiles': rename_map[col] = 'Min Projectiles'
        elif c_lower == 'max projectiles': rename_map[col] = 'Max Projectiles'
        elif c_lower == 'actor 1 / country': rename_map[col] = 'Actor'
            
    df = df.rename(columns=rename_map)
    
    if 'Actor' not in df.columns:
        df['Actor'] = default_actor
    if 'Type of Weapons' not in df.columns:
        df['Type of Weapons'] = weapon_type_default
        
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    return df

# Clean and standardize only the files we successfully loaded
cleaned_list = []
for (fname, dfraw, default_actor, weapon_default) in loaded:
    try:
        cleaned_list.append(clean_and_standardize(dfraw, default_actor, weapon_default))
    except Exception as e:
        print(f"Error cleaning {fname}: {e}")

if not cleaned_list:
    raise SystemExit('No input files were loaded successfully; aborting.')

final_df = pd.concat(cleaned_list, ignore_index=True)
final_df['Date_Parsed'] = pd.to_datetime(final_df['Date'], format='%d/%m/%Y', errors='coerce')
final_df = final_df.sort_values(by='Date_Parsed')
final_df = final_df.reset_index(drop=True)
final_df['Incident ID'] = final_df.index + 1
final_df = final_df.drop(columns=['Date_Parsed'])

desired_order = [
    'Incident ID', 'Date', 'Time of Day', 'Confirmed Time', 
    'Governorate', 'District', 'Area', 
    'Actor', 'Type of Weapons', 
    'Target', 'Main category', 'Sub-category', 
    'Min Projectiles', 'Max Projectiles', 
    'Civilian Casualties', 'Fatalities', 'Woman fatalities', 'Child fatalities', 
    'Injured', 'Woman injured', 'Child injured'
]
existing_cols = final_df.columns.tolist()
final_col_order = [c for c in desired_order if c in existing_cols] + [c for c in existing_cols if c not in desired_order]
final_df = final_df[final_col_order]

output_filename = "Yemen_Data_Project_Unified.csv"
final_df.to_csv(output_filename, index=False)
print(f"File created: {output_filename}")