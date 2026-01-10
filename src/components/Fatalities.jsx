import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, CircularProgress } from '@mui/material';
import { createSvgTooltip, HtmlTooltip } from './ChartTooltip';

// Import CSV tramite Vite (assicurati che il percorso sia corretto nel tuo progetto)
import fatalitiesCsvPath from '../data/fatalities.csv?url';

const Fatalities = () => {
    const ref = useRef(null);
    const hasAnimatedRef = useRef(false);
    const [data, setData] = useState(null);
    const [hoveredSlice, setHoveredSlice] = useState(null);
    const centerNumRef = useRef(null);
    const centerSubRef = useRef(null);

    const TOOLTIP_FONT_SIZE = 8;

    useEffect(() => {
        const seaGroups = new Set([
            'North Arabian Sea', 'North Red Sea', 'Northwestern Indian Ocean',
            'Red Sea', 'Strait of Bab el Mandeb', 'West Arabian Sea'
        ]);

        d3.csv(fatalitiesCsvPath).then(raw => {
            const rows = raw.map(d => {
                const rawAdmin = (d.ADMIN1 || 'Unknown').trim();
                const admin = seaGroups.has(rawAdmin) ? 'Others' : rawAdmin;
                return {
                    admin,
                    fatalities: d.FATALITIES === undefined || d.FATALITIES === '' ? 0 : +d.FATALITIES
                };
            });

            let byAdmin = Array.from(
                d3.rollups(rows, v => d3.sum(v, r => r.fatalities), r => r.admin),
                ([admin, fatalities]) => ({ admin, fatalities })
            );

            const threshold = 100;
            const major = [];
            let othersTotal = 0;
            
            byAdmin.sort((a, b) => b.fatalities - a.fatalities);
            
            byAdmin.forEach(item => {
                if (item.admin === 'Others') {
                    othersTotal += item.fatalities;
                } else if (item.fatalities < threshold) {
                    othersTotal += item.fatalities;
                } else {
                    major.push(item);
                }
            });

            const finalList = major.slice();
            if (othersTotal > 0) finalList.push({ admin: 'Others', fatalities: othersTotal });
            setData(finalList);
        }).catch(err => {
            console.error('Errore caricamento fatalities.csv', err);
        });
    }, []);

    useEffect(() => {
        if (!data || !ref.current) return;

        const container = d3.select(ref.current);
        container.selectAll('*').remove();

        const margin = { top: 10, right: 50, bottom: 20, left: 140 };
        const barHeight = 12; // Leggermente più alte per leggibilità
        const gap = 6;
        const width = 700;
        const height = margin.top + margin.bottom + data.length * (barHeight + gap);

        const svg = container.append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('width', '100%')
            .style('height', 'auto');

        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.fatalities) || 1])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.admin))
            .range([margin.top, height - margin.bottom])
            .paddingInner(0.1)
            .paddingOuter(0.05);

        const tooltip = createSvgTooltip(svg, { padding: 8, rx: 6, fontSize: TOOLTIP_FONT_SIZE });

        // --- BAR CHART ---
        const bars = svg.append('g')
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', margin.left)
            .attr('y', d => y(d.admin))
            .attr('height', y.bandwidth())
            .attr('width', 0) // start at 0 for animation
            .attr('fill', '#d32f2f')
            .attr('rx', 3)
            .style('pointer-events', 'none')
            .on('mouseenter', function(event, d) {
                if (!hasAnimatedRef.current) return;
                d3.select(this).transition().duration(120).attr('fill', '#7a0b0b');
                const cx = x(d.fatalities);
                const cy = (y(d.admin) || 0) + y.bandwidth() / 2;
                const offsetX = cx > (width/2) ? -64 : 12;
                const offsetY = cy > (height/2) ? -24 : 8;
                tooltip.show(cx + offsetX, cy + offsetY, [d.admin, `${d.fatalities.toLocaleString()} fatalities`]);
            })
            .on('mouseleave', function() {
                d3.select(this).transition().duration(120).attr('fill', '#d32f2f');
                tooltip.hide();
            });

        // Labels Y Axis
        svg.append('g')
            .selectAll('text')
            .data(data)
            .join('text')
            .attr('x', margin.left - 12)
            .attr('y', d => (y(d.admin) || 0) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .style('font-size', '10px')
            .style('fill', '#222')
            .text(d => d.admin);

        // Value Labels (Numeri alla fine delle barre)
        const valueTexts = svg.append('g')
            .selectAll('text')
            .data(data)
            .join('text')
            .attr('x', margin.left)
            .attr('y', d => (y(d.admin) || 0) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .style('font-size', '9px')
            .style('fill', '#111')
            .style('opacity', 0)
            .text(d => d.fatalities.toLocaleString());

        // Animation Bar Chart
        const animate = () => {
            bars.transition()
                .duration(800)
                .ease(d3.easeCubicOut)
                .attr('width', d => Math.max(0, x(d.fatalities) - margin.left));

            setTimeout(() => {
                valueTexts
                    .attr('x', d => (x(d.fatalities) + 8))
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
                bars.style('pointer-events', 'auto');
                hasAnimatedRef.current = true;
            }, 820);
        };

        // --- DONUT CHART (Improved) ---
        const totalDirect = d3.sum(data, d => d.fatalities);
        const indirectDeaths = 250000;
        const totalEstimate = totalDirect + indirectDeaths;
        
        const donutData = [
            { key: 'Direct fatalities', value: totalDirect, color: '#d32f2f' },
            { key: 'Indirect deaths', value: indirectDeaths, color: '#4e4f4eff' }
        ];

        // Dimensioni Donut
        const donutRadius = 80; // Leggermente ridotto per gestire meglio lo spazio
        
        // Posizionamento
        const lahijItem = data.find(d => String(d.admin).toLowerCase().includes('lahij'));
        let lahijY;
        if (lahijItem) {
             lahijY = (y(lahijItem.admin) || 0) + y.bandwidth() / 2 + 30;
        } else {
             lahijY = height - margin.bottom - donutRadius;
        }
        // Spostiamo il donut un po' più a sinistra rispetto al margine destro assoluto
        const donutX = width - margin.right - donutRadius - 30;

        const donutGroup = svg.append('g')
            .attr('class', 'donut-chart')
            .attr('transform', `translate(${donutX}, ${lahijY})`);

        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(donutRadius * 0.55).outerRadius(donutRadius);
        const arcHover = d3.arc().innerRadius(donutRadius * 0.55).outerRadius(donutRadius + 5);
        
        // Arco invisibile più largo per posizionare le etichette esterne
        const labelArc = d3.arc().innerRadius(donutRadius + 15).outerRadius(donutRadius + 15);

        const arcs = pie(donutData);

        // 1. Disegna le fette (Slices)
        const pathSel = donutGroup.selectAll('path')
            .data(arcs)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');

        // 2. Percentuali (Testo interno bianco)
        donutGroup.selectAll('text.percent-label')
            .data(arcs)
            .join('text')
            .attr('class', 'percent-label')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(d => {
                const pct = (d.data.value / totalEstimate) * 100;
                return pct > 5 ? `${Math.round(pct)}%` : '';
            });

        // 3. Etichette Esterne (Direct / Indirect)
        donutGroup.selectAll('text.category-label')
            .data(arcs)
            .join('text')
            .attr('class', 'category-label')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .attr('dy', '0.35em')
            .style('font-size', '11px')
            .style('fill', '#333')
            .style('font-weight', '500')
            .style('text-anchor', d => {
                // Calcola l'angolo medio per decidere l'ancoraggio
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                // Se è sulla destra (< PI), allinea a sinistra (start), altrimenti a destra (end)
                return midAngle < Math.PI ? 'start' : 'end';
            })
            .text(d => d.data.key);

        // 4. Testo Centrale (Totale)
        const cNum = donutGroup.append('text')
            .attr('dy', '-0.2em')
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#000')
            .text(totalEstimate.toLocaleString());
            
        const cSub = donutGroup.append('text')
            .attr('dy', '1.1em')
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', '#666')
            .text('Total estimate');

        centerNumRef.current = cNum;
        centerSubRef.current = cSub;

        // 5. Interazioni Donut
        pathSel.on('mouseenter', function(event, d) {
            const node = this;
            d3.select(node).transition().duration(200).attr('d', arcHover);
            
            // Aggiorna centro
            if (centerNumRef.current) centerNumRef.current.text(d.data.value.toLocaleString());
            if (centerSubRef.current) centerSubRef.current.text(d.data.key);

            // Tooltip React HTML
            const rect = ref.current.getBoundingClientRect();
            // Calcolo coordinate relative al contenitore React
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            setHoveredSlice({ 
                x: mouseX + 15, 
                y: mouseY + 15, 
                key: d.data.key, 
                value: d.data.value, 
                pct: ((d.data.value / totalEstimate) * 100).toFixed(1) 
            });
        })
        .on('mousemove', function(event) {
             const rect = ref.current.getBoundingClientRect();
             const mouseX = event.clientX - rect.left;
             const mouseY = event.clientY - rect.top;
             setHoveredSlice(prev => prev ? { ...prev, x: mouseX + 15, y: mouseY + 15 } : null);
        })
        .on('mouseleave', function() {
            const node = this;
            d3.select(node).transition().duration(200).attr('d', arc);
            
            // Ripristina centro
            if (centerNumRef.current) centerNumRef.current.text(totalEstimate.toLocaleString());
            if (centerSubRef.current) centerSubRef.current.text('Total estimate');
            
            setHoveredSlice(null);
        });

        // Intersection Observer per animazione
        let observer;
        if (typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimatedRef.current) {
                        animate();
                        if (observer) observer.disconnect();
                    }
                });
            }, { threshold: 0.25 });
            observer.observe(ref.current);
        } else {
            animate();
        }

        return () => {
            if (observer) observer.disconnect();
        };

    }, [data]);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }} align="center">
                Fatalities by Governorates
            </Typography>

            {!data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box ref={ref} sx={{ width: '100%', minHeight: 200, position: 'relative' }}>
                    {hoveredSlice && (
                        <HtmlTooltip open={!!hoveredSlice} x={hoveredSlice.x} y={hoveredSlice.y}>
                            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '12px' }}>{hoveredSlice.key}</div>
                            <div style={{ fontSize: '11px' }}>{`Count: ${hoveredSlice.value.toLocaleString()}`}</div>
                            <div style={{ fontSize: '11px' }}>{`${hoveredSlice.pct}%`}</div>
                        </HtmlTooltip>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Fatalities;