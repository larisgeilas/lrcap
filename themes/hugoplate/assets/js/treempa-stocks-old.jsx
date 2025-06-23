import { h } from 'preact';
import { useRef, useEffect, useState } from 'preact/hooks';
import * as d3 from 'd3';
import investmentPortfolioData from '../reports-widgets-data/investment-portfolio.json';

// Simple Metric component
const Metric = ({ label, value, positive }) => (
  <div className="flex flex-col text-right">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-lg font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>{value}</span>
  </div>
);

// Control components
const Select = ({ options, label, value, onChange }) => (
  <label className="flex flex-col text-sm">
    <span className="mb-1 text-gray-700">{label}</span>
    <select
      className="border border-gray-300 rounded p-1"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.key} value={opt.key}>{opt.label}</option>
      ))}
    </select>
  </label>
);

const ToggleGroup = ({ options, selected, onChange }) => (
  <div className="flex items-center space-x-2">
    {options.map(opt => (
      <button
        key={opt.key}
        onClick={() => onChange(opt.key)}
        className={`px-3 py-1 border rounded ${selected === opt.key ? 'bg-gray-200' : 'bg-white'}`}
        aria-pressed={selected === opt.key}
      >{opt.label}</button>
    ))}
  </div>
);

const SearchInput = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Find symbol…"
    className="border border-gray-300 rounded p-1 text-sm"
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

// Main Treemap component
const TreemapOpenPositions = ({ width = 800, height = 600 }) => {
  const svgRef = useRef();
  const [filterAcc, setFilterAcc] = useState('all');
  const [colorMode, setColorMode] = useState('abs');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  // Data extraction
  const investedCash = investmentPortfolioData.find(acc => acc.Account === 'Invested Cash');
  const ibkr = investedCash?.growth?.ibkr || {};
  const allPositions = Object.values(ibkr).flatMap(sub =>
    sub.openPositions.map(pos => ({
      ...pos,
      positionValue: +pos.positionValue,
      profit: +pos.fifoPnlUnrealized
    }))
  );

  // Build account options
  const accountOptions = [
    { key: 'all', label: 'All Accounts' },
    ...Object.keys(ibkr).map(accId => ({ key: accId, label: accId }))
  ];

  // Filtering
  const positions = allPositions
    .filter(p => filterAcc === 'all' || p.accountId === filterAcc)
    .filter(p => p.symbol.toLowerCase().includes(filter.toLowerCase()));

  // Summary metrics
  const totalValue = d3.sum(positions, d => d.positionValue);
  const totalProfit = d3.sum(positions, d => d.profit);
  const totalCost = d3.sum(positions, d => (+d.costBasisPrice * d.position));
  const totalROI = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : '0';

  // D3 rendering
  useEffect(() => {
    if (!positions.length) return;

    const root = d3.hierarchy({ children: positions })
      .sum(d => d.positionValue)
      .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .paddingInner(2)(root);

    const profitVals = positions.map(d => d.profit);
    const roiVals = positions.map(d => (d.profit / (d.costBasisPrice * d.position)) * 100);
    const domain = colorMode === 'abs'
      ? [d3.min(profitVals), d3.max(profitVals)]
      : [d3.min(roiVals), d3.max(roiVals)];
    const colorScale = d3.scaleSequential().domain(domain).interpolator(d3.interpolateRdYlGn);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .on('click', d => setSelected(d.data));

    // Rectangles
    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(
        colorMode === 'abs'
          ? d.data.profit
          : (d.data.profit / (d.data.costBasisPrice * d.data.position) * 100)
      ))
      .attr('class', 'transition-opacity duration-200 hover:opacity-80');

    // Text labels show symbol and value, hide if overflow
    nodes.append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('class', 'text-xs font-medium fill-gray-800')
      .text(d => `${d.data.symbol}: €${Math.round(d.data.positionValue)}`)
      .each(function(d) {
        const rectWidth = d.x1 - d.x0;
        const textWidth = this.getComputedTextLength();
        if (textWidth > rectWidth - 4) d3.select(this).text('');
      });

  }, [positions, width, height, colorMode]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <span className="mr-2">📊</span> Open Positions
        </h2>
        <div className="flex space-x-6 mt-2 md:mt-0">
          <Metric label="Total Value" value={`€ ${totalValue.toFixed(2)}`} />
          <Metric label="Total P&L" value={`€ ${totalProfit.toFixed(2)} (${totalROI}%)`} positive={totalProfit >= 0} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <Select options={accountOptions} label="Account" value={filterAcc} onChange={setFilterAcc} />
        <ToggleGroup
          options={[
            { key: 'abs', label: '€ Profit' },
            { key: 'pct', label: '% ROI' }
          ]}
          selected={colorMode}
          onChange={setColorMode}
        />
        <SearchInput value={filter} onChange={setFilter} />
      </div>

      {/* Treemap Visualization */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="rounded-lg border border-gray-200 w-full h-auto"
        role="img"
        aria-label="Open Positions Treemap"
      />

      {/* Detail Panel */}
      {selected && (
        <DetailPanel data={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default TreemapOpenPositions;
