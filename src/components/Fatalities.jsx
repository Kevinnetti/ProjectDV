import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, CircularProgress } from '@mui/material';
import { createSvgTooltip, HtmlTooltip } from './ChartTooltip';

// Import CSV tramite Vite
import fatalitiesCsvPath from '../data/fatalities.csv?url';

const Fatalities = () => {
	const ref = useRef(null);
	const hasAnimatedRef = useRef(false);
	const [data, setData] = useState(null);
	const [hoveredSlice, setHoveredSlice] = useState(null);
	const centerNumRef = useRef(null);
	const centerSubRef = useRef(null);

	// User-controllable tooltip font size (edit this value to change tooltip size)
	const TOOLTIP_FONT_SIZE = 8;

	useEffect(() => {
			// Raggruppa alcune amministrazioni marine in 'Others' e riduci dimensioni del grafico
			const seaGroups = new Set([
				'North Arabian Sea',
				'North Red Sea',
				'Northwestern Indian Ocean',
				'Red Sea',
				'Strait of Bab el Mandeb',
				'West Arabian Sea'
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
						// Aggrega per ADMIN1 (amministrazione)
						let byAdmin = Array.from(
								d3.rollups(rows, v => d3.sum(v, r => r.fatalities), r => r.admin),
								([admin, fatalities]) => ({ admin, fatalities })
						);
						// Unisci tutte le voci con meno di 100 fatalities nella categoria 'Others'
						const threshold = 100;
						const major = [];
						let othersTotal = 0;
						// First, sort so we keep deterministic order
						byAdmin.sort((a, b) => b.fatalities - a.fatalities);
						byAdmin.forEach(item => {
							if (item.admin === 'Others') {
								// if there's already an 'Others' bucket (from seaGroups), include it in othersTotal
								othersTotal += item.fatalities;
							} else if (item.fatalities < threshold) {
								othersTotal += item.fatalities;
							} else {
								major.push(item);
							}
						});
						const finalList = major.slice();
						if (othersTotal > 0) finalList.push({ admin: 'Others', fatalities: othersTotal });
						// Ordina decrescente per visualizzazione (majors already sorted)
						setData(finalList);
		}).catch(err => {
			console.error('Errore caricamento fatalities.csv', err);
		});
	}, []);

	useEffect(() => {
		if (!data || !ref.current) return;

		const container = d3.select(ref.current);
		container.selectAll('*').remove();

		// Rendi il grafico più compatto
		const margin = { top: 10, right: 50, bottom: 20, left: 140 };
		const barHeight = 10;
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

		// Bars
		// create shared svg tooltip (font size is user-controllable via TOOLTIP_FONT_SIZE)
		const tooltip = createSvgTooltip(svg, { padding: 8, rx: 6, fontSize: TOOLTIP_FONT_SIZE });

		// create bars with zero width initially for animation
		const bars = svg.append('g')
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', margin.left)
			.attr('y', d => y(d.admin))
			.attr('height', y.bandwidth())
			.attr('width', 0)
			.attr('fill', '#d32f2f')
			.attr('rx', 4)
            // disable pointer events during animation to avoid interrupting transitions
            .style('pointer-events', 'none')
			.on('mouseenter', function(event, d) {
				// only allow hover after initial animation completed
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

		// ADMIN1 labels (y axis)
		svg.append('g')
			.selectAll('text')
			.data(data)
			.join('text')
			.attr('x', margin.left - 12)
			.attr('y', d => (y(d.admin) || 0) + y.bandwidth() / 2)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'end')
			.style('font-size', '9px')
			.style('fill', '#222')
			.text(d => d.admin);

		// Values at end of bars (start positioned at margin.left to animate later)
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

		// animate bars when chart becomes visible
		const animate = () => {
			bars.transition()
				.duration(800)
				.ease(d3.easeCubicOut)
				.attr('width', d => Math.max(0, x(d.fatalities) - margin.left));

			// update label positions after animation completes
				setTimeout(() => {
					valueTexts
						.attr('x', d => (x(d.fatalities) + 8))
						.transition()
						.duration(300)
						.style('opacity', 1);
					// re-enable pointer events and mark as animated so hover/tooltips become active
					bars.style('pointer-events', 'auto');
					hasAnimatedRef.current = true;
				}, 820);
		};

		// --- Lahij donut: show indirect deaths (fixed) vs direct (sum of fatalities)
		const totalDirect = d3.sum(data, d => d.fatalities);
		const indirectDeaths = 250000;
		const donutData = [
			{ key: 'Direct fatalities', value: totalDirect },
			{ key: 'Indirect deaths', value: indirectDeaths }
		];
		const donutRadius = 90;
		const arcHover = d3.arc().innerRadius(donutRadius * 0.6).outerRadius(donutRadius + 24);
		// find Lahij row y position if present
		const lahijItem = data.find(d => String(d.admin).toLowerCase().includes('lahij'));
		let lahijY = null;
		if (lahijItem) {
			// place slightly below the Lahij row so the donut doesn't overlap the bar
			lahijY = (y(lahijItem.admin) || 0) + y.bandwidth() / 2 + 40;
		} else {
			// place below the chart, offset by donut radius
			lahijY = height - margin.bottom + donutRadius + 24; // place below chart if not found
		}
		const donutX = width - margin.right - donutRadius - 8;
		const donutGroup = svg.append('g')
			.attr('class', 'lahij-donut')
			.attr('transform', `translate(${donutX}, ${lahijY})`);
		const pie = d3.pie().value(d => d.value).sort(null);
		const arc = d3.arc().innerRadius(donutRadius * 0.6).outerRadius(donutRadius);
		// labelArc removed — we'll position labels inside each colored arc using arc.centroid
		const arcs = pie(donutData);
		const pathSel = donutGroup.selectAll('path').data(arcs).join('path')
			.attr('d', d => arc(d))
			.attr('fill', d => d.data.key === 'Indirect deaths' ? '#4e4f4eff' : '#d32f2f')
			.attr('stroke', 'white')
			.attr('stroke-width', 1)
			.style('cursor', 'pointer');

		// slice labels: create invisible arc paths and attach curved percentage text along them;
		// also place category names outside the donut
		const labelArcPath = d3.arc().innerRadius(donutRadius * 0.75).outerRadius(donutRadius * 0.95);
		const labelArc = d3.arc().innerRadius(donutRadius * 0.95).outerRadius(donutRadius + 10);

		// create path elements used only for internal text along path
		donutGroup.selectAll('path.label-path').data(arcs).join('path')
			.attr('class', 'label-path')
			.attr('id', (d, i) => `lahij-label-path-${i}`)
			.attr('d', d => labelArcPath(d))
			.style('fill', 'none')
			.style('pointer-events', 'none');

		// internal curved percentages
		donutGroup.selectAll('text.slice-label').data(arcs).join('text')
			.attr('class', 'slice-label')
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#000')
			.style('pointer-events', 'none')
			.each(function(d, i) {
				const pct = (d.data.value / (totalDirect + indirectDeaths)) * 100;
				const pctLabel = `${Math.round(pct)}%`;
				// clear existing content
				d3.select(this).selectAll('*').remove();
				if (pct > 4) {
					d3.select(this).append('textPath')
						.attr('href', `#lahij-label-path-${i}`)
						.attr('startOffset', '50%')
						.style('dominant-baseline', 'middle')
						.text(pctLabel);
				}
			});

		// external category labels (outside the donut)
		donutGroup.selectAll('text.external-label').data(arcs).join('text')
			.attr('class', 'external-label')
			.attr('transform', d => `translate(${labelArc.centroid(d)})`)
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#000')
			.style('pointer-events', 'none')
			.text(d => d.data.key);

		// interactions: hover enlarge + show HtmlTooltip + update center texts
		pathSel.on('mouseenter', function(event, d) {
			const node = this;
			d3.select(node).transition().duration(180).attr('d', arcHover).attr('opacity', 0.92);
			// update center texts
			try { if (centerNumRef.current) centerNumRef.current.text(d.data.value.toLocaleString()); } catch(e){}
			try { if (centerSubRef.current) centerSubRef.current.text(`${d.data.key}`); } catch(e){}
			// show HtmlTooltip (position relative to container)
			try {
				const rect = ref.current.getBoundingClientRect();
				const x = Math.min(Math.max(8, event.clientX - rect.left), rect.width - 160);
				const y = Math.min(Math.max(8, event.clientY - rect.top), rect.height - 80);
				setHoveredSlice({ x, y, key: d.data.key, value: d.data.value, pct: ((d.data.value/(totalDirect+indirectDeaths))*100).toFixed(1) });
			} catch (e) {}
		})
		.on('mousemove', function(event, d) {
			try {
				const rect = ref.current.getBoundingClientRect();
				const x = Math.min(Math.max(8, event.clientX - rect.left), rect.width - 160);
				const y = Math.min(Math.max(8, event.clientY - rect.top), rect.height - 80);
				setHoveredSlice(h => h ? { ...h, x, y } : { x, y, key: d.data.key, value: d.data.value });
			} catch (e) {}
		})
		.on('mouseleave', function(event, d) {
			const node = this;
			d3.select(node).transition().duration(180).attr('d', d => arc(d)).attr('opacity', 1);
			// restore center labels
			try { if (centerNumRef.current) centerNumRef.current.text((totalDirect + indirectDeaths).toLocaleString()); } catch(e){}
			try { if (centerSubRef.current) centerSubRef.current.text('Total estimate'); } catch(e){}
			setHoveredSlice(null);
		});

		// center labels show the total estimate by default — store refs for updates
		const totalEstimate = totalDirect + indirectDeaths;
		const cNum = donutGroup.append('text')
			.attr('dy', '-0.2em')
			.attr('class', 'donut-center-number')
			.attr('text-anchor', 'middle')
			.text(totalEstimate.toLocaleString());
		const cSub = donutGroup.append('text')
			.attr('dy', '1.2em')
			.attr('class', 'donut-center-sub')
			.attr('text-anchor', 'middle')
			.text('Total estimate');
		// store references so hover can update them
		centerNumRef.current = cNum;
		centerSubRef.current = cSub;

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
			// fallback
			animate();
		}

		// cleanup observer on unmount/re-run
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
							<div style={{ fontWeight: 700, marginBottom: 6 }}>{hoveredSlice.key}</div>
							<div>{`Count: ${hoveredSlice.value.toLocaleString()}`}</div>
							<div>{`${hoveredSlice.pct}%`}</div>
						</HtmlTooltip>
						)}
				</Box>
			)}
		</Box>
	);
};

export default Fatalities;

