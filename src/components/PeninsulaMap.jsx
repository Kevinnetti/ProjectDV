import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

// Load Peninsula geojson via Vite runtime URL
const peninsulaUrl = new URL('../data/Peninsula.json', import.meta.url).toString();

const PeninsulaMap = ({ width = 360, height = 260 }) => {
  const ref = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    d3.json(peninsulaUrl).then((geo) => {
      if (!mounted) return;
      const container = d3.select(ref.current);
      container.selectAll('*').remove();

      const svg = container.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', 'auto');

      const projection = d3.geoMercator().fitSize([width, height], geo);
      const path = d3.geoPath().projection(projection);

      // Draw countries
      svg.append('g').selectAll('path')
        .data(geo.features)
        .join('path')
        .attr('d', path)
        .attr('fill', d => (d.properties && (d.properties.iso_a3 === 'YEM' || d.properties.adm0_a3 === 'YEM') ? '#4e4f4eff' : '#ececec'))
        .attr('stroke', '#9e9a9aff')
        .attr('stroke-width', 0.5)
        .attr('opacity', d => (d.properties && (d.properties.iso_a3 === 'YEM' || d.properties.adm0_a3 === 'YEM') ? 1 : 0.95));

      // Add a subtle label for Yemen
      const yemFeature = geo.features.find(f => f.properties && (f.properties.iso_a3 === 'YEM' || f.properties.adm0_a3 === 'YEM' || f.properties.name === 'Yemen'));
      if (yemFeature) {
        const centroid = path.centroid(yemFeature);
        svg.append('text')
          .attr('x', centroid[0])
          .attr('y', centroid[1])
          .attr('dy', '0.5em')
          .attr('text-anchor', 'middle')
          .classed('peninsula-label', true)
          .text('Yemen');
      }

      setLoading(false);
    }).catch(() => setLoading(false));

    return () => { mounted = false; };
  }, [width, height]);

  return (
    <Box ref={ref} sx={{ width: '100%', maxWidth: width }} aria-hidden={loading} />
  );
};

export default PeninsulaMap;
