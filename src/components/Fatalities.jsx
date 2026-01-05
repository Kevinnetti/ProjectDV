import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, CircularProgress } from '@mui/material';

// Import CSV tramite Vite
import fatalitiesCsvPath from '../data/fatalities.csv?url';

const Fatalities = () => {
	const ref = useRef(null);
	const [data, setData] = useState(null);

	useEffect(() => {
		d3.csv(fatalitiesCsvPath, (d) => ({
			admin: d.ADMIN1 || 'Unknown',
			fatalities: d.FATALITIES === undefined || d.FATALITIES === '' ? 0 : +d.FATALITIES
		})).then((rows) => {
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

		const margin = { top: 30, right: 70, bottom: 30, left: 180 };
		const barHeight = 26;
		const gap = 8;
		const width = 900;
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
		svg.append('g')
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', margin.left)
			.attr('y', d => y(d.admin))
			.attr('height', y.bandwidth())
			.attr('width', d => Math.max(0, x(d.fatalities) - margin.left))
			.attr('fill', '#9e0f0fff')
			.attr('rx', 4);

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

		// Values at end of bars
		svg.append('g')
			.selectAll('text')
			.data(data)
			.join('text')
			.attr('x', d => (x(d.fatalities) + 8))
			.attr('y', d => (y(d.admin) || 0) + y.bandwidth() / 2)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'start')
			.style('font-size', '12px')
			.style('fill', '#111')
			.text(d => d.fatalities.toLocaleString());

		// X axis
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

	}, [data]);

	return (
		<Box sx={{ width: '100%' }}>
			<Typography variant="h6" gutterBottom>
				Fatalities per ADMIN1
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

