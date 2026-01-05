import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';

// Import dei file CSV tramite Vite
import idpPath from '../data/idp.csv?url';
import pocPath from '../data/migrations.csv?url';

const MigrationGroupedChart = () => {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useLogScale, setUseLogScale] = useState(false); // Default lineare

  // 1. Data loading and processing
  useEffect(() => {
    Promise.all([
      d3.csv(idpPath),
      d3.csv(pocPath)
    ]).then(([idpRaw, pocRaw]) => {
      
      // Map to accumulate data by year
      const statsByYear = new Map();

      // Elabora IDP (Interni)
      idpRaw.forEach(d => {
        if (d['Country of Origin ISO'] === 'YEM') {
          const year = +d.Year;
          if (!statsByYear.has(year)) statsByYear.set(year, { year, internal: 0, external: 0 });
          
          statsByYear.get(year).internal += (+d.Total || 0);
        }
      });

      // Elabora PoC (Esterni: Rifugiati + Richiedenti Asilo + Altri)
      pocRaw.forEach(d => {
        if (d['Country of Origin ISO'] === 'YEM') {
          const year = +d.Year;
          // Somma le tre categorie principali
          const totalExternal = (
            (+d['Refugees'] || 0) + 
            (+d['Asylum-seekers'] || 0) + 
            (+d['Other people in need of international protection'] || 0)
          );

          if (totalExternal > 0) {
            if (!statsByYear.has(year)) statsByYear.set(year, { year, internal: 0, external: 0 });
            statsByYear.get(year).external += totalExternal;
          }
        }
      });

      // Converti Mappa in Array e ordina
      const processedData = Array.from(statsByYear.values())
        .filter(d => d.year >= 2011) // Filtra anni vecchi o senza dati rilevanti
        .sort((a, b) => a.year - b.year);

      setData(processedData);
      
      setLoading(false);
    });
  }, []);

  // Use all data (no slider filter)
  const filteredData = useMemo(() => data || [], [data]);

  // 2. DISEGNO DEL GRAFICO
  useEffect(() => {
    if (!filteredData.length || !containerRef.current) return;

    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .style("width", "100%")
      .style("height", "auto")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sottogruppi e Gruppi
    const subgroups = ['internal', 'external'];
    const groups = filteredData.map(d => d.year);

    // Scala X (Anni)
    const x0 = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding(0.2);

    // Scala X1 (Barre interne)
    const x1 = d3.scaleBand()
      .domain(subgroups)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Y scale (Logarithmic or Linear)
    let y;
    const maxVal = d3.max(filteredData, d => Math.max(d.internal, d.external));
    const minVal = d3.min(filteredData, d => Math.min(d.internal, d.external));
    const paddedMax = maxVal ? maxVal * 1.5 : 1;
    if (useLogScale) {
      const domainMin = Math.max(1, (minVal || 1) * 0.8); // evita log(0) e mantiene un minimo coerente
      y = d3.scaleLog()
        .domain([domainMin, paddedMax])
        .range([height, 0])
        .base(10)
        .clamp(true);
    } else {
      y = d3.scaleLinear()
        .domain([0, paddedMax])
        .range([height, 0]);
    }

    // Colori
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#d32f2f', '#000000']); // Red (Internal), Black (External)

    // Assi
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0).tickFormat(d3.format("d")))
      .style("font-size", "12px");

    const logTicks = [1e4, 1e5, 1e6];
    const yAxis = useLogScale 
      ? d3.axisLeft(y)
          .tickValues(logTicks.filter(t => t >= y.domain()[0] && t <= y.domain()[1]))
          .tickFormat(d3.format(".0s"))
      : d3.axisLeft(y).tickFormat(d3.format("~s"));

    svg.append("g")
      .call(yAxis)
      .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width)
          .attr("stroke-opacity", useLogScale ? 0.25 : 0.1));

    // Etichetta Asse Y
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -55)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#666")
      .style("font-size", "12px")
      .text(useLogScale ? "People (Log scale)" : "People (Linear)");

    // Barre
    svg.append("g")
      .selectAll("g")
      .data(filteredData)
      .join("g")
        .attr("transform", d => `translate(${x0(d.year)},0)`)
      .selectAll("rect")
      .data(d => subgroups.map(key => ({ key, value: d[key], year: d.year })))
      .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => {
          const domainMin = useLogScale ? y.domain()[0] : 0;
          const safeVal = Math.max(domainMin, d.value || 0);
          return y(safeVal);
        })
        .attr("width", x1.bandwidth())
        .attr("height", d => {
          const domainMin = useLogScale ? y.domain()[0] : 0;
          const safeVal = Math.max(domainMin, d.value || 0);
          return height - y(safeVal);
        })
        .attr("fill", d => color(d.key))
        .attr("rx", 3)
        // Interazione
          .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).style("opacity", 0.8);
          
          const tooltip = tooltipRef.current;
          tooltip.style.opacity = 1;
          tooltip.style.left = (event.clientX + 12) + "px";
          tooltip.style.top = (event.clientY - 12) + "px";
          tooltip.innerHTML = `
            <div style="font-weight:bold; margin-bottom:4px">${d.year}</div>
            <div style="color:${color(d.key)}">
              ${d.key === 'internal' ? 'Internally Displaced' : 'Refugees (external)'}: 
              <b>${d.value.toLocaleString()}</b>
            </div>
          `;
        })
        .on("mouseout", (event) => {
          d3.select(event.currentTarget).style("opacity", 1);
          tooltipRef.current.style.opacity = 0;
        });

    // Legenda
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, -20)`);

    ['Internal (IDP)', 'External (Refugees)'].forEach((label, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", i === 0 ? '#d32f2f' : '#000000')
        .attr("rx", 2);
      g.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text(label)
        .style("font-size", "12px")
        .style("fill", "#333");
    });

  }, [filteredData, useLogScale]);

  return (
    <Paper elevation={0} sx={{ p: 3, position: 'relative', bgcolor: 'transparent' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        Internal vs External Displacement
      </Typography>

      {/* Controlli (solo scala) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        
        {/* Toggle Scala */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant={!useLogScale ? "contained" : "outlined"} 
            onClick={() => setUseLogScale(false)}
            size="small"
          >
            Linear Scale
          </Button>
          <Button 
            variant={useLogScale ? "contained" : "outlined"} 
            onClick={() => setUseLogScale(true)}
            size="small"
          >
            Log Scale
          </Button>
        </Box>

      </Box>

      {/* Grafico */}
      <Box ref={containerRef} sx={{ width: '100%', minHeight: '400px', position: 'relative' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'absolute', width: '100%' }}>
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Tooltip HTML */}
      <div 
        ref={tooltipRef}
        style={{
          position: 'fixed',
          opacity: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 1000,
          fontSize: '13px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
      
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
        Note: The difference between internally displaced people (millions) and refugees (thousands) is enormous. 
        Use the log scale to compare trends.
      </Typography>
    </Paper>
  );
};

export default MigrationGroupedChart;