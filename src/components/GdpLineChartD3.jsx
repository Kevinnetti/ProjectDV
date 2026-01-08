import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { createSvgTooltip } from './ChartTooltip';

// IMPORTANTE: Importiamo l'URL del file CSV grazie a Vite
// '?url' dice a Vite di darci il percorso del file finale, non il contenuto grezzo
import gdpCsvPath from '../data/gdp.csv?url';

const GdpLineChartD3 = () => {
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  
  // Stato per i dati (inizialmente null perché dobbiamo caricarli)
  const [data, setData] = useState(null);

  // 1. EFFETTO DI CARICAMENTO DATI
  useEffect(() => {
    // d3.csv prende il percorso e una funzione di "pulizia" (row converter)
    d3.csv(gdpCsvPath, (d) => {
      return {
        year: +d.Year, // Il '+' converte la stringa "1990" in numero 1990
        value: +d.GDP  // Il '+' converte la stringa "12.644" in numero 12.644
      };
    }).then((loadedData) => {
      setData(loadedData); // Salviamo i dati puliti nello stato
    });
  }, []);

  // 2. EFFETTO DI DISEGNO GRAFICO (Scatta solo quando 'data' cambia)
  useEffect(() => {
    // Se i dati non sono ancora pronti, non fare nulla
    if (!data || !containerRef.current) return;

    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
    const width = 800; 
    const height = 350;

    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("overflow", "visible");

    // --- SCALE ---
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = "#d32f2f";

    // --- ASSI ---
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).ticks(6);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style("font-size", "12px")
      .style("color", "#666");

    const yAxisG = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("font-size", "12px")
      .style("color", "#666");

    yAxisG.select(".domain").remove();
    yAxisG.selectAll(".tick line").remove();

    yAxisG.selectAll(".tick")
      .filter(d => d !== 0)
      .append("line")
      .attr("x1", 0)
      .attr("x2", width - margin.left - margin.right)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#b87c7cff")
      .attr("stroke-dasharray", "4,4");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#999")
      .text("Billions of USD ($)");

    // Etichetta Asse X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 5)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#999")
        .text("Years");

    // --- LINEA ---
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    // --- PUNTI ---
    const points = svg.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.value))
      .attr("r", 4)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .style("cursor", "pointer");

    // --- ANIMAZIONE (avvia solo quando visibile) ---
    const totalLength = path.node().getTotalLength();

    const startAnimation = () => {
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .delay(1000)
        .duration(2000)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          points
            .transition()
            .duration(500)
            .style("opacity", 1);
        });
    };

    let observer;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            startAnimation();
            if (observer) observer.disconnect();
          }
        });
      }, { threshold: 0.25 });
      observer.observe(containerRef.current);
    } else {
      // fallback: start immediately
      startAnimation();
    }

    // --- INTERAZIONE: Tooltip SVG su ogni punto (shared helper) ---
    const tooltip = createSvgTooltip(svg, { padding: 8, rx: 6, fontSize: 12 });

    // Hover su ogni singolo punto
    points
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 7)
          .attr('stroke-width', 3);

        const cx = xScale(d.year);
        const cy = yScale(d.value);
        const offsetX = cx > width / 2 ? -80 : 15;
        const offsetY = cy > height / 2 ? -40 : 10;

        tooltip.show(cx + offsetX, cy + offsetY, [`Year: ${d.year}`, `GDP: $${d.value.toFixed(2)} Bn`]);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4)
          .attr('stroke-width', 2);

        tooltip.hide();
      });

    // cleanup observer on unmount/re-run
    return () => {
      if (observer) observer.disconnect();
    };
  }, [data]); // Questo useEffect parte solo quando 'data' viene aggiornato

  return (
    <Box sx={{ position: 'relative' }}>
     
      
      {/* Mostra un caricamento se i dati non sono ancora arrivati */}
      {!data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box ref={containerRef} sx={{ width: '100%', minHeight: '350px' }} />
      )}

      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1, color: '#777' }}>
        Source: World Bank CSV data
      </Typography>
    </Box>
  );
};

export default GdpLineChartD3;