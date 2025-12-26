import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Paper, Typography, Box, CircularProgress, Slider, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Importiamo i file tramite Vite
import geoJsonPath from '../data/world.geojson?url';
import migrationsCsvPath from '../data/migrations.csv?url';

const FlowMapD3 = () => {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgRef = useRef(null); // Riferimento per mantenere l'SVG tra i render

  const [geoData, setGeoData] = useState(null);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Stato per l'anno selezionato (Slider)
  const [selectedYear, setSelectedYear] = useState(2012);
  const [yearsRange, setYearsRange] = useState([2012, 2024]);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. CARICAMENTO DATI (Eseguito una sola volta)
  useEffect(() => {
    Promise.all([
      d3.json(geoJsonPath),
      d3.csv(migrationsCsvPath)
    ]).then(([geo, csv]) => {
      
      // PULIZIA E ELABORAZIONE DATI GREZZI
      const cleanData = csv.map(d => {
        // Somma le varie categorie per ottenere il totale delle persone spostate
        const total = (
          (+d['Refugees'] || 0) + 
          (+d['Asylum-seekers'] || 0) + 
          (+d['Other people in need of international protection'] || 0)
        );

        return {
          year: +d.Year,
          origin_iso: d['Country of Origin ISO'],
          asylum_iso: d['Country of Asylum ISO'], // Codice ISO destinazione
          asylum_name: d['Country of Asylum'],
          value: total
        };
      }).filter(d => 
        d.value > 0 && // Togli righe con 0 persone
        d.origin_iso === 'YEM' && // Solo origine Yemen
        d.asylum_iso !== 'YEM' // Escludi spostamenti interni (IDP)
      );

      // Calcola min e max anno per lo slider
      // Limita ai soli anni dal 2012 in poi
      const filtered = cleanData.filter(d => d.year >= 2012);
      const years = filtered.map(d => d.year);
      setYearsRange([d3.min(years), d3.max(years)]);
      
      setGeoData(geo);
      setAllData(filtered);
      setLoading(false);
    });
  }, []);

  // 2. FILTRO DATI PER ANNO (Eseguito ogni volta che cambi anno)
  const currentYearData = useMemo(() => {
    if (!allData) return [];
    
    // Filtra per anno
    let yearData = allData.filter(d => d.year === selectedYear);

    // Mostra solo flussi significativi (> 1000 persone)
    yearData = yearData.filter(d => d.value > 500);
    
    // Ordina per valore decrescente e prendi solo i TOP 30 (per non intasare la mappa)
    yearData.sort((a, b) => b.value - a.value);
    return yearData.slice(0, 30); 
  }, [allData, selectedYear]);

  // 3. DISEGNO MAPPA (Eseguito quando cambiano i dati o la mappa)
  useEffect(() => {
    if (!geoData || !currentYearData || !containerRef.current) return;

    const width = 620;
    const height = 320;

    // Se l'SVG non esiste, crealo (sfondo e paesi)
    if (!svgRef.current) {
      const container = d3.select(containerRef.current);
      container.selectAll("*").remove();

      const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto")
        .style("background", "transparent");

      svgRef.current = svg;

      // PROIEZIONE
      const projection = d3.geoMercator()
        .center([30, 30]) 
        .scale(350)
        .translate([width / 2, height / 2]);

      const pathGenerator = d3.geoPath().projection(projection);

      // DISEGNA PAESI (Statici)
      const mapGroup = svg.append("g").attr("class", "map-layer");
      mapGroup.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", pathGenerator)
        .attr("fill", "#f5f5f5")
        .attr("stroke", "#bfbfbf")
        .attr("stroke-width", 0.5)
        .attr("id", d => d.id); // Importante per trovare le coordinate dopo

      // Marker Freccia
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#d32f2f");
        
      // Gruppo per le frecce (così possiamo pulirlo e ridisegnarlo)
      svg.append("g").attr("class", "arrows-layer");
    }

    // --- AGGIORNAMENTO FRECCE ---
    const svg = svgRef.current;
    const arrowsLayer = svg.select(".arrows-layer");
    
    // Pulisci vecchie frecce
    arrowsLayer.selectAll("*").remove();

    const projection = d3.geoMercator()
        .center([30, 30]) 
        .scale(350)
        .translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);

    // Funzione helper per trovare centroide
    const getCenterByIso = (iso) => {
      const feature = geoData.features.find(f => f.id === iso);
      if (!feature) return null;
      return pathGenerator.centroid(feature);
    };

    // Posiziona il tooltip accanto al cursore
    const positionTooltip = (event) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      const offsetX = 12;
      const offsetY = -12;
      const x = event.clientX + offsetX;
      const y = event.clientY + offsetY;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    };

    // Scala spessore (fissa basata su un massimo globale ragionevole, es. 15.000)
    const strokeScale = d3.scaleSqrt().domain([0, 15000]).range([0.5, 6]);

    // Disegna nuove frecce
    currentYearData.forEach(row => {
      const source = getCenterByIso("YEM"); // Origine fissa
      const target = getCenterByIso(row.asylum_iso);

      if (source && target) {
        const dx = target[0] - source[0];
        const dy = target[1] - source[1];
        const dr = Math.sqrt(dx * dx + dy * dy);
        
        const path = d3.path();
        path.moveTo(source[0], source[1]);
        path.quadraticCurveTo(
          (source[0] + target[0]) / 2, 
          (source[1] + target[1]) / 2 - dr * 0.2, 
          target[0], target[1]
        );

        arrowsLayer.append("path")
          .attr("d", path.toString())
          .attr("fill", "none")
          .attr("stroke", "#d32f2f")
          .attr("stroke-width", strokeScale(row.value))
          .attr("stroke-opacity", 0.6)
          .attr("stroke-linecap", "round")
          .attr("marker-end", "url(#arrowhead)")
          .style("cursor", "pointer")
          .on("mouseover", (event) => {
            d3.select(event.currentTarget)
              .transition().duration(200)
              .attr("stroke-opacity", 1)
              .attr("stroke", "#b71c1c")
              .attr("stroke-width", strokeScale(row.value) + 2);

            const tooltip = tooltipRef.current;
            if (!tooltip) return;
            tooltip.style.opacity = 1;
            tooltip.style.display = "block";
            tooltip.innerHTML = `
              <div style="font-weight:bold">${row.asylum_name} (${selectedYear})</div>
              <div>Migranti: <span style="color:#ffccbc">${row.value.toLocaleString()}</span></div>
            `;
            positionTooltip(event);
          })
          .on("mousemove", (event) => {
            positionTooltip(event);
          })
          .on("mouseout", (event) => {
            d3.select(event.currentTarget)
              .transition().duration(200)
              .attr("stroke-opacity", 0.6)
              .attr("stroke", "#d32f2f")
              .attr("stroke-width", strokeScale(row.value));
            const tooltip = tooltipRef.current;
            if (tooltip) {
              tooltip.style.opacity = 0;
              tooltip.style.display = "none";
            }
          });
      }
    });

    // Ridisegna il punto Yemen sopra le frecce
    const yemenCenter = getCenterByIso("YEM");
    if(yemenCenter) {
      arrowsLayer.append("circle")
         .attr("cx", yemenCenter[0])
         .attr("cy", yemenCenter[1])
         .attr("r", 5)
         .attr("fill", "#b71c1c")
         .attr("stroke", "white")
         .attr("stroke-width", 2);
    }

  }, [geoData, currentYearData, selectedYear]); 

  // Auto-play dell'anno selezionato
  useEffect(() => {
    if (!isPlaying) return;
    const [minYear, maxYear] = yearsRange;
    const id = setInterval(() => {
      setSelectedYear(prev => (prev >= maxYear ? minYear : prev + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, yearsRange]);

  // Calcolo totale annuale senza filtro (>500) per visualizzarlo
  const totalMigrationYear = allData
    ? allData
        .filter(d => d.year === selectedYear)
        .reduce((acc, curr) => acc + curr.value, 0)
    : 0;

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary">
          Evoluzione della Migrazione Yemenita
        </Typography>
      </Box>

      {/* SLIDER SPOSTATO SOTTO, INSIEME AL PLAY */}

      {/* AREA MAPPA */}
      <Box ref={containerRef} sx={{ width: '100%', minHeight: '280px', position: 'relative' }}>
        {loading && (
           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'absolute', width: '100%' }}>
             <CircularProgress />
           </Box>
        )}
      </Box>

      {/* Controllo Play/Pausa + Anno + Totale sotto al grafico */}
      <Box sx={{ display:'flex', alignItems:'center', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color={isPlaying ? 'secondary' : 'primary'}
          onClick={() => setIsPlaying(p => !p)}
          sx={{ borderRadius: 999, px: 2 }}
        >
          {isPlaying ? <PauseIcon sx={{ mr: 1 }} /> : <PlayArrowIcon sx={{ mr: 1 }} />}
          {isPlaying ? 'Pausa' : 'Play'}
        </Button>
        <Box sx={{ display:'flex', alignItems:'baseline', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
            {selectedYear}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Totale: {totalMigrationYear.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Slider
            value={selectedYear}
            min={yearsRange[0]}
            max={yearsRange[1]}
            step={1}
            onChange={(e, newValue) => setSelectedYear(newValue)}
            valueLabelDisplay="auto"
            marks
            sx={{
              color: '#d32f2f',
              '& .MuiSlider-mark': { backgroundColor: '#bfbfbf' },
              '& .MuiSlider-markActive': { backgroundColor: 'currentColor' },
            }}
          />
        </Box>
      </Box>

      {/* TOOLTIP */}
      <div 
        ref={tooltipRef}
        style={{
          position: 'fixed',
          opacity: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          pointerEvents: 'none',
          fontSize: '13px',
          zIndex: 9999,
          transition: 'opacity 0.1s'
        }}
      />
      
      <Typography variant="caption" sx={{display:'block', textAlign:'right', mt:1, color:'#777'}}>
        Fonte: UNHCR Data (Elaborazione real-time)
      </Typography>
    </Paper>
  );
};

export default FlowMapD3;