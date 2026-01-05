import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Typography, Box, Slider, Button, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Importa il TUO file pulito
import districtData from '../data/yemen_districts_clean.json'; 

const Raid = () => {
  const containerRef = useRef(null);
  const [year, setYear] = useState(2015);
  const [hovered, setHovered] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const yearsRange = useMemo(() => [2015, 2022], []);
  const [showAggregated, setShowAggregated] = useState(false);

  // Calcola max raid per la scala colori
  const maxVal = useMemo(() => {
    let max = 0;
    districtData.features.forEach(f => {
      const val = f.properties.raids[year] || 0;
      if (val > max) max = val;
    });
    return max || 10;
  }, [year]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = 950;
    const height = 410;
    
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

    // Scala Colore: range espliciti 
    const getColor = (v) => {
      if (!v || v === 0) return '#aaa6a6ff'; // zero
      if (v >= 1 && v <= 10) return '#4caf50'; // verde
      if (v >= 11 && v <= 35) return '#fdd835'; // giallo
      if (v >= 36 && v <= 70) return '#ff9800'; // arancione
      if (v >= 71 && v <= 130) return '#f44336'; // rosso
      if (v >= 131 && v <= 200) return '#9c27b0'; // viola
      return '#000000'; // nero >200
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
      .attr('transform', `translate(${width - 110}, 20)`);

    // Titolo della legenda
    legendGroup.append('text')
      .attr('x', 0)
      .attr('y', -8)
      .attr('fill', '#222')
      .style('font-size', '13px')
      .style('font-weight', 600)
      .text('Number of raids');

    const categories = [
      { label: '0', color: '#aaa6a6ff' },
      { label: '1 - 10', color: '#4caf50' },
      { label: '11 - 35', color: '#fdd835' },
      { label: '36 - 70', color: '#ff9800' },
      { label: '71 - 130', color: '#f44336' },
      { label: '131 - 200', color: '#9c27b0' },
      { label: '200+', color: '#000000' }
    ];

    const itemH = 18;
    legendGroup.append('g')
      .selectAll('g')
      .data(categories)
      .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * (itemH + 8)})`)
      .each(function(d, i) {
        const g = d3.select(this);
        g.append('rect')
          .attr('width', 28)
          .attr('height', itemH)
          .attr('fill', d.color)
          .attr('stroke', '#333');
        g.append('text')
          .attr('x', 36)
          .attr('y', itemH / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#222')
          .style('font-size', '12px')
          .text(d.label);
      });

  }, [year, maxVal, showAggregated]);

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

      <Box ref={containerRef} sx={{ minHeight: 600, position: 'relative' }}>
        {/* Tooltip posizionato vicino al distretto */}
        {hovered && (
          <Box sx={{
            position: 'absolute', left: hovered.x, top: hovered.y,
            bgcolor: 'rgba(255,255,255,0.95)', color: 'black',
            p: 1.25, borderRadius: 1, boxShadow: 3, pointerEvents: 'none',
            minWidth: 120, transform: 'translate(8px, -8px)'
          }}>
            <Typography variant="subtitle2" fontWeight="bold">{hovered.name}</Typography>
            <Typography variant="body2">Raids: {hovered.count}</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 5, py: 0, mt: -2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!showAggregated && (
              <>
                <IconButton
                  onClick={() => setIsPlaying(p => !p)}
                  size="large"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  sx={{ bgcolor: isPlaying ? 'rgba(255,152,0,0.12)' : 'transparent' }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <Typography variant="body2" sx={{ color: 'inherit' }}>{isPlaying ? 'Playing' : 'Paused'}</Typography>
              </>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowAggregated(s => !s)}
              sx={{ ml: 1, textTransform: 'none' }}
            >
              {showAggregated ? 'Close Aggregate' : 'Aggregate'}
            </Button>
          </Box>

          <Box sx={{ flex: 1 }}>
            {!showAggregated && (
              <Slider
                value={year}
                min={2015} max={2022} step={1}
                marks valueLabelDisplay="auto"
                onChange={(e, v) => { if (typeof v === 'number') setYear(v); }}
                sx={{ color: '#ff9800' }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Raid;