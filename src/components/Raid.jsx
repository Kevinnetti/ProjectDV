import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Typography, Box, Slider } from '@mui/material';

// Importa il TUO file pulito
import districtData from '../data/yemen_districts_clean.json'; 

const Raid = () => {
  const containerRef = useRef(null);
  const [year, setYear] = useState(2015);
  const [hovered, setHovered] = useState(null);

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

    const width = 900;
    const height = 600;
    
    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', 'transparent');

    // Proiezione centrata
    const projection = d3.geoMercator()
      .fitSize([width, height], districtData); // Adatta automaticamente

    const path = d3.geoPath().projection(projection);

    // Scala Colore (Nero -> Arancione -> Rosso)
    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, Math.sqrt(maxVal)]); // Usa radice quadrata per evidenziare i piccoli numeri

    svg.append('g')
      .selectAll('path')
      .data(districtData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', d => {
        const val = d.properties.raids[year] || 0;
        return val > 0 ? colorScale(Math.sqrt(val)) : '#333';
      })
      .attr('stroke', '#555')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (e, d) => {
        d3.select(e.target).attr('stroke', '#fff').attr('stroke-width', 1.5).raise();
        setHovered({
          name: d.properties.name,
          count: d.properties.raids[year] || 0
        });
      })
      .on('mouseleave', (e) => {
        d3.select(e.target).attr('stroke', '#555').attr('stroke-width', 0.5);
        setHovered(null);
      });

  }, [year, maxVal]);

  return (
    <Box sx={{ m: 0, p: 0, width: '100%' }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: 'inherit' }}>
        Yemen Districts Raids: {year}
      </Typography>

      <Box ref={containerRef} sx={{ minHeight: 600, position: 'relative' }}>
        {/* Tooltip */}
        {hovered && (
          <Box sx={{
            position: 'absolute', top: 20, right: 20,
            bgcolor: 'rgba(255,255,255,0.9)', color: 'black',
            p: 2, borderRadius: 2, boxShadow: 3, pointerEvents: 'none'
          }}>
            <Typography variant="subtitle1" fontWeight="bold">{hovered.name}</Typography>
            <Typography variant="body2">Raids: {hovered.count}</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 5, py: 2 }}>
        <Slider
          value={year}
          min={2015} max={2022} step={1}
          marks valueLabelDisplay="auto"
          onChange={(e, v) => setYear(v)}
          sx={{ color: '#ff9800' }}
        />
      </Box>
    </Box>
  );
};

export default Raid;