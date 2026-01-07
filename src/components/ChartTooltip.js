import React from 'react';

// createSvgTooltip: helper to create a consistent SVG tooltip (rect + text)
// svg: d3-selected svg element
// opts: { padding, fill, rx, textFill, fontSize }
export function createSvgTooltip(svg, opts = {}) {
  const { padding = 8, fill = 'rgba(0,0,0,0.85)', rx = 6, textFill = 'white', fontSize = 12 } = opts;

  const g = svg.append('g')
    .attr('class', 'chart-tooltip')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  const rect = g.append('rect')
    .attr('fill', fill)
    .attr('rx', rx)
    .attr('ry', rx);

  const text = g.append('text')
    .attr('fill', textFill)
    .attr('font-size', fontSize)
    .attr('text-anchor', 'middle');

  function setLines(lines = []) {
    text.selectAll('tspan').remove();
    lines.forEach((l, i) => {
      text.append('tspan')
        .attr('x', 0)
        .attr('dy', i === 0 ? '0em' : '1.2em')
        .style('font-weight', i === 0 ? 700 : 400)
        .text(l);
    });
  }

  function show(x, y, lines = []) {
    setLines(lines);
    if (typeof g.raise === 'function') g.raise();
    const bbox = text.node().getBBox();
    rect
      .attr('x', bbox.x - padding)
      .attr('y', bbox.y - padding)
      .attr('width', bbox.width + padding * 2)
      .attr('height', bbox.height + padding * 2);
    g.attr('transform', `translate(${x}, ${y})`)
      .transition()
      .duration(120)
      .style('opacity', 1);
  }

  function hide() {
    g.transition().duration(120).style('opacity', 0);
  }

  function remove() {
    g.remove();
  }

  return { show, hide, remove, group: g, rect, text };
}

// HtmlTooltip: small React component to render consistent HTML tooltip using MUI-like styles
export function HtmlTooltip({ open, x = 0, y = 0, children }) {
  if (!open) return null;
  const style = {
    position: 'absolute',
    left: x,
    top: y,
    transform: 'translate(8px, -8px)',
    pointerEvents: 'none',
    background: 'rgba(0,0,0,0.85)',
    color: 'white',
    padding: '8px',
    borderRadius: 6,
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    minWidth: 120,
    fontSize: 13,
    zIndex: 50
  };
  return (
    React.createElement('div', { style }, children)
  );
}

export default {
  createSvgTooltip,
  HtmlTooltip
};
