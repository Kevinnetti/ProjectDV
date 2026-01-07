import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gadmData from '../data/gadm41_YEM_1.json';

const MapDis = ({ width = 900, height = 420 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const container = d3.select(ref.current);
    container.selectAll('*').remove();

    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto');

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);
    projection.fitSize([width, height], gadmData);

    svg.append('g')
      .selectAll('path')
      .data(gadmData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#e8e8e8')
      .attr('stroke', '#999')
      .attr('stroke-width', 0.6)
      .style('cursor', 'default')
      .each(function(d) {
        const name = d.properties.NAME_1 || d.properties.NAME || d.properties.name || 'Unknown';
        d3.select(this).append('title').text(name);
      });

  }, [width, height]);

  return <div ref={ref} />;
};

export default MapDis;
