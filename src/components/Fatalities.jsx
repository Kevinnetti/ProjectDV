import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, CircularProgress } from '@mui/material';
import { createSvgTooltip } from './ChartTooltip';

// Import CSV tramite Vite
import fatalitiesCsvPath from '../data/fatalities.csv?url';

const Fatalities = () => {
	const ref = useRef(null);
	const hasAnimatedRef = useRef(false);
	const [data, setData] = useState(null);

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
			const byAdmin = Array.from(
				d3.rollups(rows, v => d3.sum(v, r => r.fatalities), r => r.admin),
				([admin, fatalities]) => ({ admin, fatalities })
			);
			// Ordina decrescente per visualizzazione
			byAdmin.sort((a, b) => b.fatalities - a.fatalities);
			setData(byAdmin);
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
		// create shared svg tooltip
		const tooltip = createSvgTooltip(svg, { padding: 8, rx: 6, fontSize: 12 });

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
			.style('font-size', '12px')
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
			.style('font-size', '12px')
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

		/*// X axis
		const xAxis = d3.axisTop(x).ticks(5).tickFormat(d3.format('~s'));
		svg.append('g')
			.attr('transform', `translate(0, ${margin.top - 8})`)
			.call(xAxis)
			.selectAll('text')
			.style('font-size', '12px');

		// Title
		svg.append('text')
			.attr('x', margin.left)
			.attr('y', 18)
			.style('font-size', '14px')
			.style('font-weight', 600)
			.text('Total Fatalities by ADMIN1');
*/
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
				<Box ref={ref} sx={{ width: '100%', minHeight: 200 }} />
			)}
		</Box>
	);
};

export default Fatalities;

