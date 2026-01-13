import React, { useEffect, useRef, useState } from 'react';
import { HtmlTooltip } from './ChartTooltip';
import * as d3 from 'd3';
// Import CSV as URL so Vite copies it into the build and returns a runtime URL
import csvUrl from '../data/Yemen_Data_Project_Unified.csv?url';

export default function Donut({ height = 600 }) {
  const containerRef = useRef(null);
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(null);
  const centerNumRef = useRef(null);
  const centerSubRef = useRef(null);
  const totalRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimatedRef = useRef(false);
  const hoverTimeoutRef = useRef(null);

  // color overrides (component-level so legend can use same mapping)
  const scheme = d3.schemeTableau10;
  const specialColors = {
    'International Community': '#000000',
    'Pro-Houthi Positions': '#4a148c'
  };
  const specialLower = Object.fromEntries(Object.entries(specialColors).map(([k,v])=>[k.toLowerCase(), v]));
  const getColor = (key, i) => {
    if (!key) return scheme[i % scheme.length];
    if (specialColors[key]) return specialColors[key];
    const lk = String(key).toLowerCase();
    if (specialLower[lk]) return specialLower[lk];
    return scheme[i % scheme.length];
  };

  useEffect(() => {
    // Use the Vite-provided URL for the CSV
    d3.csv(csvUrl).then(rows => {
      const rowsArr = rows || [];
      if (!rowsArr || rowsArr.length === 0) {
        setData([]);
        return;
      }
      const idCandidates = ['Incident ID', 'IncidentID', 'Incident_Id', 'incident id'];
      const headerKeys = Object.keys(rowsArr[0] || {}).map(h => h.trim());
      const idKey = headerKeys.find(h => idCandidates.map(x => x.toLowerCase()).includes(h.toLowerCase()));
      const seen = new Set();
      const deduped = [];
      rowsArr.forEach(r => {
        let key = '';
        if (idKey && r[idKey]) {
          key = String(r[idKey]).trim();
        } else {
          const date = (r.Date || r.date || '').toString().trim();
          const target = (r.Target || r.target || '').toString().trim();
          const main = (r['Main category'] || r['Main Category'] || r['Main_category'] || '').toString().trim();
          key = `${date}|${target}|${main}`;
        }
        if (!seen.has(key)) { seen.add(key); deduped.push(r); }
      });
      const rowsToUse = deduped;
      const cols = Object.keys(rowsArr[0] || {});
      const findCol = (rx) => cols.find(c => rx.test(String(c).toLowerCase()));
      const mainCol = findCol(/main\s*-?\s*category/) || findCol(/\bmain\b/) || cols.find(c => c.toLowerCase().includes('main')) || 'Main category';
      const toTitle = (s) => s.split(/\s+/).map(w => w ? (w[0].toUpperCase() + w.slice(1)) : '').join(' ');
      const normalize = v => {
        if (v === undefined || v === null) return 'Unknown';
        let s = String(v).trim(); if (!s) return 'Unknown';
        s = s.replace(/_/g, ' ').replace(/\s+/g, ' ').toLowerCase();
        return toTitle(s);
      };
      const rollup = d3.rollup(rowsToUse, v => v.length, d => normalize(d[mainCol]));
      const processedData = Array.from(rollup, ([key, value]) => ({ key, value })).sort((a,b)=>b.value-a.value);
      setData(processedData);
    }).catch(err => { console.error('Failed loading unified CSV for donut:', err); setData([]); });
  }, []);

  // --- Useeffect principale con le modifiche per le linee ---
  useEffect(() => {
    if (!data.length || !containerRef.current) return;
    if (!isVisible) return;
    if (hasAnimatedRef.current) return;
    
    const container = containerRef.current;
    d3.select(container).selectAll('*').remove();
    
    const width = container.clientWidth; 
    // Aumentato margine per fare spazio a linee e testo orizzontale
    const margin = 130; 
    const radius = Math.min(width, height) / 2 - margin;
    
    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width','100%')
      .style('height','auto')
      .append('g')
      .attr('transform', `translate(${width/2}, ${height/2})`);

    const pie = d3.pie().value(d=>d.value).sort(null);
    
    // Arco principale del donut
    const arc = d3.arc().innerRadius(radius*0.6).outerRadius(radius);
    // Arco per l'hover
    const arcHover = d3.arc().innerRadius(radius*0.6).outerRadius(radius+10);
    
    // --- NUOVO: Definizioni raggi per le linee ---
    // Raggio esterno dove posizionare il testo e la fine della linea orizzontale
    const radiusLabel = radius + 30; 
    // Arco invisibile usato per calcolare il punto di snodo (gomito) della linea
    const arcLabel = d3.arc().innerRadius(radiusLabel).outerRadius(radiusLabel);

    const centerGroup = svg.append('g').attr('text-anchor','middle');
    const total = d3.sum(data, d => d.value); totalRef.current = total;
    centerGroup.selectAll('text').remove();
    const centerNum = centerGroup.append('text').attr('dy','-0.2em').style('font-size','24px').style('font-weight','bold').style('fill','#333');
    const centerSub = centerGroup.append('text').attr('dy','1.2em').style('font-size','14px').style('fill','#666').text('Total Raids');
    centerNumRef.current = centerNum; centerSubRef.current = centerSub;
    const interp = d3.interpolateNumber(0, total);
    centerNum.transition().delay(1000).duration(900).tween('text', () => t => centerNum.text(Math.round(interp(t)).toLocaleString()));
    
    const arcs = pie(data);
    const labelThreshold = 0.12; // Soglia per mostrare etichette e linee

    const paths = svg.selectAll('path.slice').data(arcs).join('path')
      .attr('class', 'slice')
      .attr('data-key', d=>d.data.key)
      .attr('fill', (d,i)=>getColor(d.data.key,i))
      .attr('stroke','white')
      .style('stroke-width', '2px')
      .style('cursor','pointer')
      .each(function(d){ this._current = { startAngle: d.startAngle, endAngle: d.startAngle }; });

    paths.transition().delay(1000).duration(900).attrTween('d', function(d){ const interpolate = d3.interpolate(this._current, d); this._current = interpolate(1); return t => arc(interpolate(t)); });
    
    // (Event handlers mouseenter/leave/move e legendenter/leave rimangono uguali, li ometto per brevità ma devono esserci)
    paths.on('mouseenter', function(event,d){ if (hoverTimeoutRef.current){ clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current=null; } d3.select(this).transition().duration(220).attr('d', arcHover).attr('opacity',0.92); const pct = ((d.data.value/total)*100).toFixed(1); try{ centerNum.interrupt(); centerSub.interrupt(); } catch(e){} centerNum.text(d.data.value.toLocaleString()); centerSub.text(`${d.data.key} (${pct}%)`); if (containerRef.current){ const rect = containerRef.current.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; setHovered({ x: Math.min(Math.max(8, x), rect.width - 160), y: Math.min(Math.max(8, y), rect.height - 80), key: d.data.key, value: d.data.value, pct }); } });
    paths.on('mouseleave', function(event,d){ const node=this; d3.select(node).transition().duration(220).attr('d', arc).attr('opacity',1); if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = setTimeout(()=>{ try{ centerNum.interrupt(); centerSub.interrupt(); } catch(e){} const backInterp = d3.interpolateNumber(Number(centerNum.text().replace(/,/g,'')), total); centerNum.transition().duration(600).tween('text', () => t => centerNum.text(Math.round(backInterp(t)).toLocaleString())); centerSub.text('Total Raids'); setHovered(null); hoverTimeoutRef.current = null; }, 120); });
    paths.on('mousemove', function(event){ if (!containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; setHovered(h => h ? { ...h, x: Math.min(Math.max(8, x), rect.width - 160), y: Math.min(Math.max(8, y), rect.height - 80) } : h); });
    paths.on('legendenter', function(event, d) { d3.select(this).transition().duration(220).attr('d', arcHover).attr('opacity', 0.92); try { centerNum.interrupt(); centerSub.interrupt(); } catch (e) {} centerNum.text(d.data.value.toLocaleString()); centerSub.text(`${d.data.key} (${((d.data.value/total)*100).toFixed(1)}%)`); });
    paths.on('legendleave', function(event, d) { const node = this; d3.select(node).transition().duration(220).attr('d', arc).attr('opacity', 1); if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = setTimeout(() => { try { centerNum.interrupt(); centerSub.interrupt(); } catch (e) {} const backInterp = d3.interpolateNumber(Number(centerNum.text().replace(/,/g, '')), total); centerNum.transition().duration(600).tween('text', () => t => centerNum.text(Math.round(backInterp(t)).toLocaleString())); centerSub.text('Total Raids'); setHovered(null); hoverTimeoutRef.current = null; }, 120); });


    // --- NUOVO: Aggiunta delle Polylines (le linee di collegamento) ---
    // Vengono aggiunte PRIMA del testo così il testo appare sopra se si sovrappongono
    const polylines = svg.selectAll('polyline').data(arcs).join('polyline')
      .style('opacity', 0) // Partono invisibili per l'animazione
      .attr('points', d => {
          // Non disegnare linea se la fetta è troppo piccola
          if ((d.endAngle - d.startAngle) <= labelThreshold) return null;

          // Calcolo dell'angolo medio per decidere lato destro o sinistro
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          // Se l'angolo è < PI, siamo a destra.
          const isRightSide = midAngle < Math.PI;

          // Punto A: Inizio linea, vicino al bordo esterno della fetta
          const posA = arc.centroid(d); 
          // Punto B: Punto intermedio "gomito"
          const posB = arcLabel.centroid(d);
          // Punto C: Punto finale orizzontale. Usiamo il raggio esterno e forziamo X a destra o sinistra
          const posC = [ radiusLabel * (isRightSide ? 1 : -1), posB[1] ];

          // Restituisce i tre punti come stringa per l'attributo 'points'
          return [posA, posB, posC].map(p => p.join(',')).join(' ');
      })
      .style('fill', 'none')
      .style('stroke', '#999') // Colore della linea
      .style('stroke-width', '1px')
      .style('pointer-events', 'none'); // Le linee non devono interferire col mouse

    // Animazione entrata linee
    polylines.transition().delay(1600).duration(600).style('opacity', 1);

    // --- MODIFICATO: Logica posizionamento Etichette ---
    const labels = svg.selectAll('text.slice-label').data(arcs).join('text')
      .attr('class','slice-label')
      .attr('dy','0.35em')
      .style('font-size','11px') // Leggermente più piccolo per gestire lo spazio
      .style('pointer-events','none')
      .style('opacity',0)
      .style('font-weight', '600')
      .text(d => (d.endAngle - d.startAngle) > labelThreshold ? `${d.data.key} (${d.data.value})` : '')
      // Nuova logica di trasformazione per seguire la fine della linea orizzontale
      .attr('transform', d => {
          if ((d.endAngle - d.startAngle) <= labelThreshold) return null;
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          const isRightSide = midAngle < Math.PI;
          const posB = arcLabel.centroid(d);
          const posC = [ radiusLabel * (isRightSide ? 1 : -1), posB[1] ];
          
          // Sposta il testo leggermente a destra o sinistra del punto C per non toccare la linea
          const textOffset = isRightSide ? 5 : -5;
          return `translate(${posC[0] + textOffset}, ${posC[1]})`;
      })
      // Ancoraggio del testo basato sul lato
      .style('text-anchor', d => {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midAngle < Math.PI ? 'start' : 'end';
      });
    
    labels.transition().delay(1600).duration(600).style('opacity',1);
    hasAnimatedRef.current = true;
  }, [data, height, isVisible]);

  useEffect(() => {
    if (!containerRef.current) return;
    let obs;
    try {
      obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { setIsVisible(true); if (obs && containerRef.current) obs.unobserve(containerRef.current); } }); }, { threshold: 0.25 });
      obs.observe(containerRef.current);
    } catch (err) { setIsVisible(true); }
    return () => { if (obs) obs.disconnect(); };
  }, []);

  useEffect(() => {
    if (!centerNumRef.current || !centerSubRef.current) return;
    const centerNum = centerNumRef.current;
    const centerSub = centerSubRef.current;
    const total = totalRef.current || d3.sum(data, d => d.value);
    if (hovered) {
      centerNum.text(String(hovered.value).toLocaleString());
      centerSub.text(`${hovered.key} (${hovered.pct || ((hovered.value/total)*100).toFixed(1)}%)`);
    } else {
      const current = Number((centerNum.text && centerNum.text()) ? centerNum.text().replace(/,/g,'') : 0);
      const interp = d3.interpolateNumber(current || 0, total);
      centerNum.transition().duration(600).tween('text', () => t => centerNum.text(Math.round(interp(t)).toLocaleString()));
      centerSub.text('Total Raids');
    }
  }, [hovered, data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <div ref={containerRef} style={{ flex: 2, height: height, position: 'relative' }}>
        {hovered && (
          <HtmlTooltip open={!!hovered} x={hovered.x} y={hovered.y}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{hovered.key}</div>
            <div>{`Count: ${hovered.value.toLocaleString()}`}</div>
            <div>{`${hovered.pct}%`}</div>
          </HtmlTooltip>
        )}
      </div>
      <div style={{ flex: 1, maxHeight: height, overflowY: 'auto', paddingLeft: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Categories affected by the raids</h4>
        <div className="chart-legend">
        {data.map((d, i) => (
          <div
            key={i}
            className="chart-legend-item"
            onMouseEnter={() => {
              if (!containerRef.current) return;
              const svg = containerRef.current.querySelector('svg');
              if (!svg) return;
              const selector = `path[data-key="${String(d.key).replace(/"/g, '\\"')}"]`;
              const pathEl = svg.querySelector(selector);
              if (pathEl) {
                const ev = new CustomEvent('legendenter', { bubbles: true });
                pathEl.dispatchEvent(ev);
              }
            }}
            onMouseLeave={() => {
              if (!containerRef.current) return;
              const svg = containerRef.current.querySelector('svg');
              if (!svg) return;
              const selector = `path[data-key="${String(d.key).replace(/"/g, '\\"')}"]`;
              const pathEl = svg.querySelector(selector);
              if (pathEl) {
                const ev = new CustomEvent('legendleave', { bubbles: true });
                pathEl.dispatchEvent(ev);
              }
            }}
            >
            <span className="chart-legend-swatch" style={{ backgroundColor: getColor(d.key, i) }} />
            <span className="chart-legend-key">{d.key}</span>
            <span className="chart-legend-value">({d.value})</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}