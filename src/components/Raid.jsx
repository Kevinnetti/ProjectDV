import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Typography, Box, Slider, Button, IconButton } from '@mui/material';
import { HtmlTooltip } from './ChartTooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Importa il TUO file pulito
import districtData from '../data/yemen_districts_clean.json'; 

const Raid = () => {
  const containerRef = useRef(null);
  const [year, setYear] = useState(2015);
  const [hovered, setHovered] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const yearsRange = useMemo(() => [2015, 2025], []);
  const [showAggregated, setShowAggregated] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Calcola max raid per la scala colori
  const maxVal = useMemo(() => {
    let max = 0;
    districtData.features.forEach(f => {
      const val = f.properties.raids[year] || 0;
      if (val > max) max = val;
    });
    return max || 10;
  }, [year]);

  // Totali per anno (usati nella legenda sotto le categorie)
  const yearCounts = useMemo(() => {
    const [minY, maxY] = yearsRange;
    const fmt = d3.format(',');
    const out = [];
    for (let y = minY; y <= maxY; y++) {
      let s = 0;
      districtData.features.forEach(f => {
        const v = f.properties.raids && f.properties.raids[y] ? Number(f.properties.raids[y]) : 0;
        s += v;
      });
      out.push({ year: y, total: s, totalFmt: fmt(s) });
    }
    return out;
  }, [yearsRange]);

  // Totali calcolati dal CSV unificato (preferiti) - dedup su Incident ID
  const [csvYearCounts, setCsvYearCounts] = useState(null);
  useEffect(() => {
    const csvUrl = new URL('../data/Yemen_Data_Project_Unified.csv', import.meta.url);
    d3.csv(csvUrl).then(rows => {
      if (!rows || rows.length === 0) return;
      const idKey = rows[0]['Incident ID'] !== undefined ? 'Incident ID' : null;
      const counts = {};
      const seen = new Set();
      rows.forEach(r => {
        let id = idKey ? (r[idKey] || '').toString().trim() : null;
        // fallback composite key
        if (!id) id = `${r.Date || ''}|${r.Target || r['Target'] || ''}|${r['Main category'] || r['Main category'] || ''}`;
        if (seen.has(id)) return; // dedup
        seen.add(id);
        // parse year from Date column (format dd/mm/yyyy or yyyy-mm-dd)
        const dateStr = r.Date || r.date || '';
        let y = null;
        if (dateStr) {
          const m = dateStr.match(/(\d{4})$/);
          if (m) y = Number(m[1]);
          else {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const yy = Number(parts[2]);
              if (!Number.isNaN(yy)) y = yy;
            }
          }
        }
        if (!y) return;
        counts[y] = (counts[y] || 0) + 1;
      });
      const [minY, maxY] = yearsRange;
      const fmt = d3.format(',');
      const out = [];
      for (let y = minY; y <= maxY; y++) {
        const total = counts[y] || 0;
        out.push({ year: y, total, totalFmt: fmt(total) });
      }
      setCsvYearCounts(out);
    }).catch(err => {
      console.warn('Failed to load unified CSV for year totals', err);
    });
  }, [yearsRange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = 750;
    const height = 300;
    
    const container = d3.select(containerRef.current);
    // Rimuovi solo l'SVG creato da D3 per non cancellare elementi React (es. tooltip)
    container.selectAll('svg').remove();

    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', 'transparent');

    // Proiezione centrata
    const projection = d3.geoMercator()
      .fitSize([width, height], districtData); // Adatta automaticamente

    const path = d3.geoPath().projection(projection);

    // Scala Colore: categorie dinamiche (adatte anche per la vista aggregata)
    // Costruiamo le categorie qui in modo che possano cambiare quando showAggregated è true
    let categories;
    if (showAggregated) {
      const [minY, maxY] = yearsRange;
      // trova il massimo aggregato tra i distretti
      let aggMax = 0;
      districtData.features.forEach(f => {
        let s = 0;
        for (let y = minY; y <= maxY; y++) s += f.properties.raids[y] || 0;
        if (s > aggMax) aggMax = s;
      });
      // Se il massimo aggregato è nell'intorno di ~1700, usiamo soglie fisse sensate
      if (aggMax <= 2000) {
        categories = [
          { label: '0', color: '#aaa6a6ff', min: 0, max: 0 },
          { label: '1 - 10', color: '#4caf50', min: 1, max: 10 },
          { label: '11 - 50', color: '#fdd835', min: 11, max: 50 },
          { label: '51 - 150', color: '#ff9800', min: 51, max: 150 },
          { label: '151 - 400', color: '#d32f2f', min: 151, max: 400 },
          { label: '401 - 1000', color: '#9c27b0', min: 401, max: 1000 },
          { label: '1001+', color: '#000000', min: 1001, max: Infinity }
        ];
      } else {
        // fallback dinamico per dataset molto più grandi
        const unit = Math.max(1, Math.ceil(aggMax / 200));
        categories = [
          { label: '0', color: '#aaa6a6ff', min: 0, max: 0 },
          { label: `1 - ${unit * 5}`, color: '#4caf50', min: 1, max: unit * 5 },
          { label: `${unit * 5 + 1} - ${unit * 25}`, color: '#fdd835', min: unit * 5 + 1, max: unit * 25 },
          { label: `${unit * 25 + 1} - ${unit * 75}`, color: '#ff9800', min: unit * 25 + 1, max: unit * 75 },
          { label: `${unit * 75 + 1} - ${unit * 200}`, color: '#d32f2f', min: unit * 75 + 1, max: unit * 200 },
          { label: `${unit * 200 + 1} - ${unit * 500}`, color: '#9c27b0', min: unit * 200 + 1, max: unit * 500 },
          { label: `${unit * 500 + 1}+`, color: '#000000', min: unit * 500 + 1, max: Infinity }
        ];
      }
    } else {
      categories = [
        { label: '0', color: '#aaa6a6ff', min: 0, max: 0 },
        { label: '1 - 10', color: '#4caf50', min: 1, max: 10 },
        { label: '11 - 35', color: '#fdd835', min: 11, max: 35 },
        { label: '36 - 70', color: '#ff9800', min: 36, max: 70 },
        { label: '71 - 130', color: '#d32f2f', min: 71, max: 130 },
        { label: '131 - 200', color: '#9c27b0', min: 131, max: 200 },
        { label: '200+', color: '#000000', min: 201, max: Infinity }
      ];
    }

    const getColor = (v) => {
      if (v === null || v === undefined) return '#aaa6a6ff';
      for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        if (v >= c.min && v <= c.max) return c.color;
      }
      return '#000000';
    };

    // helper per ottenere valore (anno o aggregato)
    const getValueForFeature = (d) => {
      if (showAggregated) {
        const [minY, maxY] = yearsRange;
        let s = 0;
        for (let y = minY; y <= maxY; y++) s += d.properties.raids[y] || 0;
        return s;
      }
      return d.properties.raids[year] || 0;
    };

    const paths = svg.append('g')
      .selectAll('path')
      .data(districtData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', d => {
        const val = getValueForFeature(d);
        return getColor(val);
      })
      .attr('stroke', '#555')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (e, d) => {
        d3.select(e.target).attr('stroke', '#fff').attr('stroke-width', 1.5);
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // clamp tooltip inside container
        const tx = Math.min(Math.max(8, x), rect.width - 150);
        const ty = Math.min(Math.max(8, y), rect.height - 80);
        const id = d.id || d.properties.id || d.properties.code || d.properties.NAME || d.properties.name;
        setHovered({
          id,
          name: d.properties.name,
          count: getValueForFeature(d),
          x: tx,
          y: ty
        });
      })
      .on('mousemove', (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tx = Math.min(Math.max(8, x), rect.width - 150);
        const ty = Math.min(Math.max(8, y), rect.height - 80);
        setHovered(h => h ? { ...h, x: tx, y: ty } : h);
      })
      .on('mouseleave', (e) => {
        d3.select(e.target).attr('stroke', '#555').attr('stroke-width', 0.5);
        setHovered(null);
      });

    // end paths

    // Legenda colori
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${width - 90}, 16)`);

    // Titolo della legenda (più piccolo)
    legendGroup.append('text')
      .attr('x', 0)
      .attr('y', -6)
      .attr('fill', '#222')
      .style('font-size', '11px')
      .style('font-weight', 600)
      .text('Number of raids' );

    // categories è già definita sopra (dinamica in base a showAggregated)

    const itemH = 12;
    legendGroup.append('g')
      .selectAll('g')
      .data(categories)
      .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * (itemH + 6)})`)
      .each(function(d, i) {
        const g = d3.select(this);
        g.append('rect')
          .attr('width', 20)
          .attr('height', itemH)
          .attr('fill', d.color)
          .attr('stroke', '#333');
        g.append('text')
          .attr('x', 26)
          .attr('y', itemH / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#222')
          .style('font-size', '10px')
          .text(d.label);
      });

    // Aggiungi i totali per anno sotto la legenda
    try {
      const yOffset = categories.length * (itemH + 6) + 6;
      const yearGroup = legendGroup.append('g').attr('transform', `translate(0, ${yOffset})`);
      const displayYears = (csvYearCounts && csvYearCounts.length) ? csvYearCounts : yearCounts;
      // Show a single line: current year total, or aggregated total when showAggregated
      const fmt = d3.format(',');
      if (showAggregated) {
        const totalAgg = displayYears.reduce((acc, d) => acc + (d.total || 0), 0);
        yearGroup.append('text')
          .attr('x', 0)
          .attr('y', 2)
          .attr('fill', '#222')
          .style('font-size', '9px')
          .style('font-weight', 600)
          .text(`Total raids: ${fmt(totalAgg)}`);
      } else {
        const cur = displayYears.find(d => d.year === year) || { total: 0, totalFmt: fmt(0) };
        yearGroup.append('text')
          .attr('x', 0)
          .attr('y', 2)
          .attr('fill', '#222')
          .style('font-size', '9px')
          .style('font-weight', 600)
          .text(`Total raids: ${cur.totalFmt}`);
      }
    } catch (e) {
      // Non critico: se qualcosa va storto, non rompere la mappa
      console.warn('Unable to render year totals in legend', e);
    }

  }, [year, maxVal, showAggregated, csvYearCounts]);

  // Gestione play/pause per avanzare gli anni (stesso pattern di FlowMapD3)
  useEffect(() => {
    if (!isPlaying) return;
    const [minYear, maxYear] = yearsRange;
    const delay = 1000; // ms per passo
    const id = setInterval(() => {
      setYear(prev => (prev >= maxYear ? minYear : prev + 1));
    }, delay);
    return () => clearInterval(id);
  }, [isPlaying, yearsRange]);

  // Observe container visibility so we can show the 'pace?' overlay when in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    let obs;
    try {
      obs = new IntersectionObserver((entries) => {
        entries.forEach(e => setIsMapVisible(e.isIntersecting));
      }, { threshold: 0.25 });
      obs.observe(containerRef.current);
    } catch (err) {
      // IntersectionObserver may not be available in some environments
      setIsMapVisible(true);
    }
    return () => { if (obs) obs.disconnect(); };
  }, []);

  // Aggiorna il tooltip quando cambia l'anno in modo che mostri il valore corrente
  // Aggiorna il tooltip quando cambia l'anno o la vista aggregata
  useEffect(() => {
    setHovered(h => {
      if (!h) return h;
      // Cerca la feature corrispondente usando id o name
      const feat = districtData.features.find(f => {
        const fid = f.id || f.properties.id || f.properties.code || f.properties.NAME || f.properties.name;
        return (h.id && fid === h.id) || (f.properties.name === h.name);
      });
      if (!feat) return h;
      if (showAggregated) {
        const [minY, maxY] = yearsRange;
        let s = 0;
        for (let y = minY; y <= maxY; y++) s += feat.properties.raids[y] || 0;
        return { ...h, count: s };
      }
      return { ...h, count: feat.properties.raids[year] || 0 };
    });
  }, [year, showAggregated]);

  return (
    <Box sx={{ m: 0, p: 0, width: '100%' }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: 'inherit' }}>
        Yemen Districts Raids: {showAggregated ? `${yearsRange[0]}-${yearsRange[1]} (Aggregate)` : year}
      </Typography>

      <Box ref={containerRef} sx={{ minHeight: 280, position: 'relative' }}>
        {/* Tooltip posizionato vicino al distretto (shared HtmlTooltip) */}
        <HtmlTooltip open={!!hovered} x={hovered?.x} y={hovered?.y}>
          {hovered && (
            <>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{hovered.name}</div>
              <div>Raids: {hovered.count}</div>
            </>
          )}
        </HtmlTooltip>
        {/* Overlay 'pace?' when year is 2023 and map is visible */}
        {year === 2023 && isMapVisible && (
          <div style={{
            position: 'absolute',
            left: '47%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 4px 12px rgba(0,0,0,0.6)',
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '0.04em'
          }}>peace?</div>
        )}
      </Box>

      <Box sx={{ px: 5, py: 0, mt: -2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!showAggregated && (
              <Button
                variant="contained"
                onClick={() => setIsPlaying(p => !p)}
                sx={{ borderRadius: 999, px: 2, backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                size="small"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                // If we're about to enable aggregate view and animation is running, stop it
                if (!showAggregated && isPlaying) setIsPlaying(false);
                setShowAggregated(s => !s);
              }}
              sx={{ ml: 1, textTransform: 'none', backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
            >
              {showAggregated ? 'Close Aggregate' : 'Aggregate'}
            </Button>
          </Box>

          <Box sx={{ flex: 1 }}>
            {!showAggregated && (
              <Slider
                value={year}
                min={2015} max={2025} step={1}
                marks valueLabelDisplay="auto"
                onChange={(e, v) => { if (typeof v === 'number') setYear(v); }}
                sx={{ color: '#d32f2f' }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Raid;