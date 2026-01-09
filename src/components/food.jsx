import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import ipcRaw from '../data/IPC_YE_A_82302905_2025-12-30.geojson?raw';

export default function Food({ src, height = 420 }) {
	const ref = useRef(null);
	const [data, setData] = useState(null);
	const [stats, setStats] = useState(null);

	// Unified color range to be used both for the map and the legends
	const colorRange = ['#2ca02c','#ffdd57','#ff8c00','#d32f2f','#6a0dad'];
	const colorScale = d3.scaleOrdinal().domain([1,2,3,4,5]).range(colorRange);

	// IPC phase labels
	const phaseLabels = {
		1: 'P1-Minimal',
		2: 'P2-Stressed',
		3: 'P3-Crisis',
		4: 'P4-Emergency',
		5: 'P5-Famine'
	};

	useEffect(() => {
		// If a `src` prop is provided, try fetching it (useful for overrides).
		if (src) {
			let cancelled = false;
			fetch(src)
				.then((r) => r.json())
				.then((json) => {
					if (!cancelled) setData(json);
				})
				.catch(() => setData(null));
			return () => { cancelled = true; };
		}

		// Default: parse the raw imported geojson text
		try {
			setData(JSON.parse(ipcRaw));
		} catch (e) {
			console.error('Failed to parse local geojson', e);
			setData(null);
		}
	}, [src]);

	// compute area & population percentages per phase
	useEffect(() => {
		if (!data) return;
		const phases = [1,2,3,4,5];
		const counts = {1:0,2:0,3:0,4:0,5:0};
		const popByPhase = {1:0,2:0,3:0,4:0,5:0};
		let popTotal = 0;

		const hasPhasePopKeys = data.features.some(f => f.properties && f.properties['phase1_population'] != null);

		data.features.forEach(f => {
			const p = f.properties || {};
			const phaseVal = p.overall_phase_value || p.phase;
			if (phaseVal && phases.includes(Number(phaseVal))) counts[phaseVal]++;
			const pop = Number(p.population ?? p.estimated_population ?? 0) || 0;
			popTotal += pop;
			if (hasPhasePopKeys) {
				for (let n=1;n<=5;n++) {
					const key = `phase${n}_population`;
					popByPhase[n] += Number(p[key] ?? 0) || 0;
				}
			} else if (phaseVal && phases.includes(Number(phaseVal))) {
				popByPhase[phaseVal] += pop;
			}
		});

		const areaPercent = {};
		const popPercent = {};
		const totalAreas = data.features.length || 1;
		for (let n of phases) {
			areaPercent[n] = (counts[n] / totalAreas) * 100;
			popPercent[n] = popTotal ? (popByPhase[n] / popTotal) * 100 : 0;
		}

		setStats({ counts, popByPhase, areaPercent, popPercent, popTotal, totalAreas });
	}, [data]);

	useEffect(() => {
		if (!data) return;
		const container = ref.current;
		const width = container.clientWidth || 900;
		d3.select(container).selectAll('*').remove();

		const svg = d3.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.style('display', 'block');

		const projection = d3.geoMercator().fitSize([width, height], data);
		const path = d3.geoPath().projection(projection);

		const color = colorScale;

		// Tooltip
		const tooltip = d3.select(container)
			.append('div')
			.attr('class', 'chart-html-tooltip')
			.style('position', 'absolute')
			.style('pointer-events', 'none')
			.style('display', 'none');

		svg.append('g')
			.selectAll('path')
			.data(data.features)
			.join('path')
			.attr('d', path)
			.attr('fill', d => {
				const v = d.properties && (d.properties.overall_phase_value || d.properties.phase);
				return v ? color(v) : '#eee';
			})
			.attr('stroke', '#444')
			.attr('stroke-width', 0.4)
			.on('mouseover', function(event, d) {
				d3.select(this).attr('stroke-width', 1.2);
				const p = d.properties || {};
				tooltip.html(`<strong>${p.area_name || p.name || ''}</strong><br/>Phase: ${p.overall_phase_label || p.phase || "n/a"}<br/>P4: ${p.phase4_percentage ?? p.phase4_percentage ?? '-'}%`) 
					.style('display', 'block');
			})
			.on('mousemove', function(event) {
				tooltip.style('left', (event.offsetX + 12) + 'px')
							 .style('top', (event.offsetY + 12) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this).attr('stroke-width', 0.4);
				tooltip.style('display', 'none');
			});

		// Legend
		const legend = svg.append('g').attr('transform', `translate(12,12)`);
		const phases = [1,2,3,4,5];
		phases.forEach((p, i) => {
			const g = legend.append('g').attr('transform', `translate(0,${i*20})`);
			g.append('rect').attr('width', 14).attr('height', 14).attr('fill', color(p)).attr('stroke', '#333');
			g.append('text').attr('x', 20).attr('y', 11).attr('fill', '#222').classed('chart-legend-text', true).text(phaseLabels[p] || `P${p}`);
		});

		// Responsiveness: redraw on resize
		const ro = new ResizeObserver(() => {
			if (container.clientWidth && container.clientWidth !== width) {
				// re-render by re-setting data (simple approach)
				setTimeout(() => setData(Object.assign({}, data)), 50);
			}
		});
		ro.observe(container);
		return () => ro.disconnect();
	}, [data, height]);

	return (
		<div>
			<div ref={ref} style={{ position: 'relative', width: '100%', minHeight: height }} />

			{stats && (
				<div style={{ maxWidth: 960, margin: '14px auto 0', padding: 12 }}>
					<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
						{[1,2,3,4,5].map(p => (
							<div key={p} style={{ flex: '1 1 180px', minWidth: 140 }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
									<div style={{ width: 12, height: 12, background: colorScale(p) || '#999', border: '1px solid #333' }} />
									<div style={{ fontWeight: 700 }}>{phaseLabels[p] || `P${p}`}</div>
								</div>
								<div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>
									Area: {stats.areaPercent[p].toFixed(1)}% ({stats.counts[p]}/{stats.totalAreas})
								</div>
								<div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
									Population: {stats.popPercent[p].toFixed(1)}% ({Math.round(stats.popByPhase[p]).toLocaleString()})
								</div>
								<div style={{ height: 8, background: '#eef0f3', borderRadius: 6, marginTop: 8, overflow: 'hidden' }}>
									<div style={{ height: '100%', width: `${Math.max(0, Math.min(100, stats.popPercent[p]))}%`, background: colorScale(p) }} />
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

