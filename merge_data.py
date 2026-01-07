import json
import pandas as pd
from difflib import get_close_matches
import re

# NOMI FILE (Assicurati che siano nella stessa cartella)
GEOJSON_FILE = 'src/data/IPC_YE_A_82302905_2025-12-30.geojson'
CSV_FILE = 'src/data/Yemen_Data_Project_Unified.csv'
OUTPUT_FILE = 'src/data/yemen_districts_clean.json'

print("1. Caricamento file...")
try:
    with open(GEOJSON_FILE, 'r', encoding='utf-8') as f:
        geojson = json.load(f)
    df = pd.read_csv(CSV_FILE)
except FileNotFoundError as e:
    print(f"ERRORE: File mancante -> {e.filename}")
    exit()

# Funzione per normalizzare i nomi (rimuove Al-, Ad-, spazi, minuscolo)
def normalize(name):
    if not isinstance(name, str): return ""
    name = name.lower().strip()
    name = name.replace('-', ' ').replace('_', ' ')
    # Rimuovi prefissi comuni arabi per migliorare il matching
    prefixes = ['al ', 'ad ', 'as ', 'ash ', 'at ', 'az ', 'ar ', 'an ']
    for p in prefixes:
        if name.startswith(p):
            name = name[len(p):]
    return name

# 2. Crea Mappatura Distretti del GeoJSON
# Chiave: Nome Normalizzato -> Valore: Indice nella lista features
geo_map = {}
geo_names_clean = []

print("2. Analisi mappa...")
for idx, feature in enumerate(geojson['features']):
    # Cerca il nome del distretto nelle proprietà
    props = feature['properties']
    dist_name = props.get('area_name') or props.get('name') or "Unknown"
    
    # PULIZIA: Rimuovi TUTTI i dati del cibo
    feature['properties'] = {
        'name': dist_name,   # Teniamo solo il nome pulito
        'raids': {}          # Prepariamo il contenitore per i raid
    }
    
    # Salviamo per il matching
    norm_name = normalize(dist_name)
    geo_map[norm_name] = idx
    geo_names_clean.append(norm_name)

# 3. Aggrega i Raid dal CSV
print("3. Unione dati raid...")
df['Year'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce').dt.year
df['District'] = df['District'].astype(str)

matched_count = 0
unmatched_list = set()

# Raggruppa per Distretto CSV
for district_raw, group in df.groupby('District'):
    csv_name_norm = normalize(district_raw)
    
    # Tenta match esatto
    target_idx = None
    if csv_name_norm in geo_map:
        target_idx = geo_map[csv_name_norm]
    else:
        # Tenta match approssimativo (Fuzzy)
        matches = get_close_matches(csv_name_norm, geo_names_clean, n=1, cutoff=0.7)
        if matches:
            target_idx = geo_map[matches[0]]
    
    if target_idx is not None:
        # Abbiamo trovato il distretto nella mappa!
        matched_count += 1
        
        # Calcola raid per anno (usa la colonna 'Min Projectiles' dal CSV unificato)
        if 'Min Air Raids' in group.columns:
            col_name = 'Min Air Raids'
        elif 'Min Projectiles' in group.columns:
            col_name = 'Min Projectiles'
        else:
            # fallback: usa la prima colonna numerica disponibile
            numeric_cols = group.select_dtypes(include='number').columns.tolist()
            col_name = numeric_cols[0] if numeric_cols else None

        if col_name is None:
            print(f"Warning: no numeric projectile column found for district '{district_raw}', skipping")
            continue

        yearly_raids = group.groupby('Year')[col_name].sum()
        
        # Inserisci nel GeoJSON
        raids_dict = {str(int(y)): int(c) for y, c in yearly_raids.items()}
        
        # Se c'erano già dati (caso di distretti omonimi/simili), somnali
        existing = geojson['features'][target_idx]['properties']['raids']
        for y, count in raids_dict.items():
            existing[y] = existing.get(y, 0) + count
            
    else:
        unmatched_list.add(district_raw)

# 4. Salva il file pulito
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(geojson, f)

print("-" * 30)
print(f"SUCCESSO! File creato: {OUTPUT_FILE}")
print(f"Distretti trovati e popolati: {matched_count}")
print(f"Distretti CSV non trovati sulla mappa: {len(unmatched_list)}")
if len(unmatched_list) > 0:
    print(f"Esempio non trovati: {list(unmatched_list)[:5]}")
print("-" * 30)