import { h } from 'preact';
import { useRef, useEffect, useState } from 'preact/hooks';
import * as d3 from 'd3';

// Icon components using Unicode symbols and CSS
const TrendingUp = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>📈</span>
);

const TrendingDown = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>📉</span>
);

const DollarSign = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>💰</span>
);

const PieChart = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>📊</span>
);

const Search = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>🔍</span>
);

const Filter = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>🔽</span>
);

const Eye = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>👁️</span>
);

const X = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>✕</span>
);

const BarChart3 = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>📋</span>
);

const Target = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>🎯</span>
);

// Mock data structure to match your original
const mockInvestmentData = {
  "subAccount1": {
    openPositions: [
      { symbol: "AAPL", positionValue: 15000, fifoPnlUnrealized: 2500, costBasisPrice: 150, position: 83.33, accountId: "subAccount1" },
      { symbol: "GOOGL", positionValue: 12000, fifoPnlUnrealized: -800, costBasisPrice: 2400, position: 5, accountId: "subAccount1" },
      { symbol: "MSFT", positionValue: 8000, fifoPnlUnrealized: 1200, costBasisPrice: 280, position: 28.57, accountId: "subAccount1" },
      { symbol: "TSLA", positionValue: 6000, fifoPnlUnrealized: -300, costBasisPrice: 200, position: 30, accountId: "subAccount1" },
      { symbol: "NVDA", positionValue: 10000, fifoPnlUnrealized: 3000, costBasisPrice: 400, position: 25, accountId: "subAccount1" }
    ]
  },
  "subAccount2": {
    openPositions: [
      { symbol: "AMZN", positionValue: 7000, fifoPnlUnrealized: 500, costBasisPrice: 3000, position: 2.33, accountId: "subAccount2" },
      { symbol: "META", positionValue: 5000, fifoPnlUnrealized: -200, costBasisPrice: 250, position: 20, accountId: "subAccount2" },
      { symbol: "NFLX", positionValue: 3000, fifoPnlUnrealized: 400, costBasisPrice: 400, position: 7.5, accountId: "subAccount2" }
    ]
  }
};

// Enhanced Metric component with icons and animations
const Metric = ({ label, value, positive, icon: Icon }) => (
  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={16} />
        </div>
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
    </div>
    <div className="mt-2">
      <span className={`text-xl font-bold ${positive ? 'text-green-600' : 'text-red-600'} group-hover:scale-105 transition-transform duration-200 inline-block`}>
        {value}
      </span>
    </div>
  </div>
);

// Enhanced Select component
const Select = ({ options, label, value, onChange, icon: Icon }) => (
  <div className="flex flex-col space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <Icon size={16} className="text-gray-500" />
      <span>{label}</span>
    </label>
    <select
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.key} value={opt.key}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Enhanced Toggle Group
const ToggleGroup = ({ options, selected, onChange }) => (
  <div className="flex items-center bg-gray-100 rounded-lg p-1 space-x-1">
    {options.map(opt => (
      <button
        key={opt.key}
        onClick={() => onChange(opt.key)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
          selected === opt.key 
            ? 'bg-white text-blue-600 shadow-sm border border-blue-200' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
      >
        <span>{opt.icon}</span>
        <span>{opt.label}</span>
      </button>
    ))}
  </div>
);

// Enhanced Search Input
const SearchInput = ({ value, onChange }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search size={16} className="text-gray-400" />
    </div>
    <input
      type="text"
      placeholder="Search symbols..."
      className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 w-full"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// Detail Panel Component
const DetailPanel = ({ data, onClose }) => {
  const roi = ((data.profit / (data.costBasisPrice * data.position)) * 100).toFixed(2);
  const isPositive = data.profit >= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full m-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all duration-200"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{data.symbol}</h3>
              <p className="text-blue-100">Position Details</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-600">Position Value</span>
              </div>
              <span className="text-xl font-bold text-gray-800">€{data.positionValue.toFixed(2)}</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Quantity</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{data.position}</span>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${isPositive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isPositive ? <TrendingUp size={20} className="text-green-600" /> : <TrendingDown size={20} className="text-red-600" />}
                <span className="font-medium text-gray-700">P&L</span>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  €{data.profit.toFixed(2)}
                </div>
                <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {roi}% ROI
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Cost Basis</span>
              <span className="font-semibold text-gray-800">€{data.costBasisPrice}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-600">Account</span>
              <span className="font-semibold text-gray-800">{data.accountId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Treemap component
const TreemapOpenPositions = ({ width = 800, height = 500 }) => {
  const svgRef = useRef();
  const [filterAcc, setFilterAcc] = useState('all');
  const [colorMode, setColorMode] = useState('abs');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Use mock data for demo
  const ibkr = mockInvestmentData;
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

  // D3 rendering with enhanced styling
  useEffect(() => {
    if (!positions.length) return;

    const root = d3.hierarchy({ children: positions })
      .sum(d => d.positionValue)
      .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(2)(root);

    const profitVals = positions.map(d => d.profit);
    const roiVals = positions.map(d => (d.profit / (d.costBasisPrice * d.position)) * 100);
    const domain = colorMode === 'abs'
      ? [d3.min(profitVals), d3.max(profitVals)]
      : [d3.min(roiVals), d3.max(roiVals)];
    
    const colorScale = d3.scaleSequential()
      .domain(domain)
      .interpolator(d3.interpolateRdYlGn);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add gradient definitions
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'hover-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(255,255,255,0.3)');
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(255,255,255,0)');

    const nodes = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelected(d.data))
      .on('mouseenter', (event, d) => setHoveredNode(d.data))
      .on('mouseleave', () => setHoveredNode(null));

    // Enhanced rectangles with rounded corners and hover effects
    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => colorScale(
        colorMode === 'abs'
          ? d.data.profit
          : (d.data.profit / (d.data.costBasisPrice * d.data.position) * 100)
      ))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .style('transition', 'all 0.3s ease');

    // Hover overlay
    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', 'url(#hover-gradient)')
      .attr('opacity', 0)
      .style('transition', 'opacity 0.3s ease');

    // Enhanced text labels
    const textGroups = nodes.append('g')
      .attr('class', 'text-group');

    // Symbol text
    textGroups.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 - 10)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'font-bold')
      .attr('fill', '#1f2937')
      .attr('font-size', d => Math.min(16, (d.x1 - d.x0) / 6))
      .text(d => d.data.symbol)
      .each(function(d) {
        const rectWidth = d.x1 - d.x0;
        const textWidth = this.getComputedTextLength();
        if (textWidth > rectWidth - 8) d3.select(this).text('');
      });

    // Value text
    textGroups.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 + 8)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', d => Math.min(12, (d.x1 - d.x0) / 8))
      .text(d => `€${Math.round(d.data.positionValue)}`)
      .each(function(d) {
        const rectWidth = d.x1 - d.x0;
        const textWidth = this.getComputedTextLength();
        if (textWidth > rectWidth - 8) d3.select(this).text('');
      });

    // Hover effects
    nodes.on('mouseenter', function(event, d) {
      d3.select(this).select('rect:last-child').attr('opacity', 1);
      d3.select(this).style('transform', 'scale(1.02)');
    })
    .on('mouseleave', function() {
      d3.select(this).select('rect:last-child').attr('opacity', 0);
      d3.select(this).style('transform', 'scale(1)');
    });

  }, [positions, width, height, colorMode]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 text-white">
            <PieChart size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Portfolio Overview</h2>
            <p className="text-gray-600">Open positions treemap visualization</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Metric 
            label="Total Value" 
            value={`€${totalValue.toLocaleString()}`}
            positive={true}
            icon={DollarSign}
          />
          <Metric 
            label="Total P&L" 
            value={`€${totalProfit.toFixed(2)} (${totalROI}%)`}
            positive={totalProfit >= 0}
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 space-y-4 lg:space-y-0 mb-8">
        <Select 
          options={accountOptions} 
          label="Account Filter" 
          value={filterAcc} 
          onChange={setFilterAcc}
          icon={Filter}
        />
        
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Eye size={16} className="text-gray-500" />
            <span>Color Mode</span>
          </label>
          <ToggleGroup
            options={[
              { key: 'abs', label: 'Profit (€)', icon: '💰' },
              { key: 'pct', label: 'ROI (%)', icon: '📈' }
            ]}
            selected={colorMode}
            onChange={setColorMode}
          />
        </div>
        
        <div className="flex-1 max-w-xs">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Search size={16} className="text-gray-500" />
            <span>Search</span>
          </label>
          <SearchInput value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Treemap Visualization */}
      <div className="relative bg-white rounded-2xl border border-gray-200 p-4 shadow-inner">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          role="img"
          aria-label="Investment Portfolio Treemap"
        />
        
        {/* Hover tooltip */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white rounded-lg p-3 text-sm pointer-events-none">
            <div className="font-semibold">{hoveredNode.symbol}</div>
            <div>Value: €{hoveredNode.positionValue.toFixed(2)}</div>
            <div className={hoveredNode.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
              P&L: €{hoveredNode.profit.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Profitable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Loss</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Break-even</span>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <DetailPanel data={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default TreemapOpenPositions;