import { h } from 'preact';
import { useRef, useEffect, useState, useLayoutEffect, useMemo } from 'preact/hooks';
import { formatCurrency, prettyDateLT } from '../../utils';
import * as d3 from 'd3';
import * as investmentPortfolioData from '../../../reports-widgets-data/investment-portfolio.json';
import { loadInvestmentPortfolio } from '../../data-loaders';

const investmentData = investmentPortfolioData.default

const T = {
  en: {
    'Investment Portfolio':                       'Investment Portfolio',
    'Open positions treemap visualization':       'Positions treemap visualization',
    'Position Details':                           'Position Details',
    'Position Value':                             'Position Value',
    'Quantity':                                   'Quantity',
    'P&L':                                        'P&L',
    'Cost Basis':                                 'Cost Basis',
    'Account':                                    'Account',
    'Total Value':                                'Total Value',
    'Total P&L':                                  'Total P&L',
    'Account Filter':                             'Account Filter',
    'Color Mode':                                 'Color Mode',
    'Profit (€)':                                 'Profit (€)',
    'ROI (%)':                                    'ROI (%)',
    'Loading…':                                   'Loading…',
    'Error:':                                     'Error:',
    'No data for this date':                      'No data for this date',
    'Profitable':                                 'Profitable',
    'Loss':                                       'Loss',
    'Break-even':                                 'Break-even',
    'Passive Investments': 'Passive Investments',
    'Active Investments': 'Active Investments',
    'All Investments': 'All Investments'
  },
  lt: {
    'Investment Portfolio':                       'Investicinis portfelis',
    'Open positions treemap visualization':       'Įgytų pozicijų vizualizacija',
    'Position Details':                           'Pozicijos informacija',
    'Position Value':                             'Pozicijos vertė',
    'Quantity':                                   'Kiekis',
    'P&L':                                        'P&L',
    'Cost Basis':                                 'Įsigijimo savikaina',
    'Account':                                    'Investicinė sąskaita',
    'Total Value':                                'Bendra vertė',
    'Total P&L':                                  'Bendras P&L',
    'Account Filter':                             'Investicinės sąskaitos filtras',
    'Color Mode':                                 'Skaičiavimas pagal',
    'Profit (€)':                                 'Pelnas (€)',
    'ROI (%)':                                    'ROI (%)',
    'Loading…':                                   'Įkeliama…',
    'Error:':                                     'Klaida:',
    'No data for this date':                      'Duomenų šiai dienai nėra',
    'Profitable':                                 'Pelninga',
    'Loss':                                       'Nuostolinga',
    'Break-even':                                 'Be pokyčių',
    'Passive Investments': 'Pasyvios Investicijos',
    'Active Investments': 'Aktyvios Investicijos',
    'All Investments': 'Visos Investicijos'
  }
};

const t = (key, lang = 'lt') => T[lang][key] || key;

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

// Detail Panel Component
const DetailPanel = ({ data, onClose }) => {

  let roi = ((data.profit / (data.costBasisPrice * data.position)) * 100).toFixed(2);
  if (data.symbol === 'BTC') {
     roi = (data.profit / data.costBasisPrice * 100).toFixed(2)
  }
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
              <p className="text-blue-100">{t('Position Details')}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-600">{t('Position Value')}</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{formatCurrency(data.positionValue)}</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-600">{t('Quantity')}</span>
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
                  {formatCurrency(data.profit)}
                </div>
                <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {roi}% ROI
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{t('Cost Basis')}</span>
              <span className="font-semibold text-gray-800">{formatCurrency(data.costBasisPrice)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-600">{t('Account')}</span>
              <span className="font-semibold text-gray-800">{data.accountId === 'U******29' ? t('Passive Investments') : t('Active Investments')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Treemap component
export function Stocks ({ d = investmentData, date = null}) {
  const [containerEl, setContainerEl] = useState(null);
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });  

  const [selected, setSelected] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filterAcc, setFilterAcc] = useState('all');
  const [filter,    setFilter]    = useState('');
  const [colorMode, setColorMode] = useState('abs');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [data,      setData]      = useState();

  useLayoutEffect(() => {
    if (!(containerEl instanceof Element)) {
      return;
    }

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ width, height });
    });

    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl]);

  // 1) Load data effect (no accountOptions or positions here)
  useEffect(() => {
    setError(null);
    if (!date) {
      setData(d);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadInvestmentPortfolio(date)
      .then(raw => {
        if (!cancelled) {
          setData(raw); 
        }
      })
      .catch(err => { 
        if (!cancelled) {
          console.error(err);
          setError(err.message);
          setData(d);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date, d]);

  const accountOptions = useMemo(() => {
    if (!data) return [{ key: 'all', label: t('All Investments') }];
    const ibkr = data.find(acc => acc.Account==='Invested Cash').growth.ibkr;
  
    return [
      { key: 'all', label: 'Visos Investicijos' },
      ...Object.keys(ibkr).map(accId => ({
        key:   accId,
        label: accId === 'U******58'
          ? t('Active Investments')
          : t('Passive Investments')
      }))
    ];
  }, [data]);

  // 1️⃣ derive ALL positions from your loaded data (no filter yet)
  const allPositions = useMemo(() => {
    if (!data) return [];
    const ibkr = data.find(acc => acc.Account==='Invested Cash').growth.ibkr;
  
    return Object.entries(ibkr)   // gives you [[accId, sub], …]
      .flatMap(([accId, sub]) =>
        sub.openPositions.map(pos => ({
          ...pos,
          positionValue: +pos.positionValue,
          profit:         +pos.fifoPnlUnrealized,
          accountId:      accId         // ← now defined!
        }))
      );
  }, [data]);

  //region 2️⃣ apply account & text filters in a memo  
  const positions = useMemo(() => {
    return allPositions
      .filter(p => filterAcc === 'all' || p.accountId === filterAcc)
      .filter(p => p.symbol.toLowerCase().includes(filter.toLowerCase()));
  }, [allPositions, filterAcc, filter]);

  // D3 rendering with enhanced styling
  useLayoutEffect(() => {

    if (
      loading ||
      !Array.isArray(positions) ||
      positions.length === 0 ||
      !dims?.width ||
      !dims?.height
    ) {
      return;
    }
    const { width, height } = dims;

    const root = d3.hierarchy({ children: positions })
      .sum(d => d.positionValue)
      .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(2)(root);

      const roiBreaks = [ -15, -5, 0,  1,  10,  20, 30 ];  
      //    < -10 | -10→-5 | -5→-2 | -2→+1 | +1→+10 | +10→+30 | ≥+30
      
      // 2) one more color than break-points:
      const roiColors = [
        '#7f1d1d', // deep red    (< -10%)
        '#dc2626', // red-600     (-10 → -3)
        '#fb923c', // orange-400  (-3 → 0)
        '#facc15', // green-50  (0 → +1)
        '#bbf7d0', // green-100   (+1 → +10)
        '#4ade80', // green-200   (+10 → +30)
        '#22c55e'  // green-300   (≥ +30)
      ];
      
      // 3) build your scaleThreshold **once**, using the full breaks:
      const colorScaleROI = d3.scaleThreshold()
        .domain(roiBreaks)
        .range(roiColors);
      
      // 4) same for absolute profit, if you like:
      const absBreaks = [ -500, -200, -50, 0, 100, 500, 5000 ];
      const absColors = [
        '#7f1d1d', '#dc2626', '#fb923c', 
        '#facc15', '#bbf7d0', '#4ade80', 
        '#22c55e', '#166534'
      ];
      const colorScaleAbs = d3.scaleThreshold()
        .domain(absBreaks)
        .range(absColors);


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

    nodes
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center')
      .style('transition', 'transform 0.3s ease');
      
   // 4) in your draw code, compute pct and feed the scale:
    nodes.append('rect')
      .attr('width',  d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('rx',     8)
      .attr('ry',     8)
      .attr('fill', d => {
        let pct = (d.data.profit  
          / (d.data.costBasisPrice * d.data.position)) * 100;

        if (d.data.symbol === 'BTC') {
          pct = (d.data.profit / d.data.costBasisPrice * 100).toFixed(2)
        }
        return colorMode === 'abs'
          ? colorScaleAbs(d.data.profit)
          : colorScaleROI(pct);
      })
      .attr('stroke',       '#fff')
      .attr('stroke-width', 2)
      .style('filter',      'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .style('transition',  'all 0.3s ease');

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
      .attr('fill', '#1f2937')
      .attr('font-size', d => Math.min(12, (d.x1 - d.x0) / 8))
      .text(d => formatCurrency(d.data.positionValue))
      .each(function(d) {
        const rectWidth = d.x1 - d.x0;
        const textWidth = this.getComputedTextLength();
        if (textWidth > rectWidth - 8) d3.select(this).text('');
      });

    // Hover effects
    nodes
      .on('mouseenter', function(event, d) {
        d3.select(this).raise();   // bring to front
        d3.select(this)
          .transition().duration(200)
          .attr(
            'transform',
            `translate(${d.x0 - (d.x1 - d.x0)*0.01},${d.y0 - (d.y1 - d.y0)*0.01})
            scale(1.02)`
          );
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('transform', `translate(${d.x0},${d.y0})`);
      });

    }, [positions, colorMode, filterAcc, dims, loading]);


  if (loading) return <div>Loading…</div>;
  if (error)   return <div>Error: {error}</div>;
  if (!data)   return <div>No data for this date</div>;

  const investedCash = useMemo(() => {
    return data.find(acc => acc.Account === 'Invested Cash');
  }, [data]);
  
  const totalValue = useMemo(() => {
    return filterAcc === 'all'
      ? investedCash.growth.currentValue
      : investedCash.growth.accountsGrowth[filterAcc].currentValue;
  }, [investedCash, filterAcc]);
  
  const totalProfit = useMemo(() => {
    return filterAcc === 'all'
      ? investedCash.growth.profit
      : investedCash.growth.accountsGrowth[filterAcc].profit;
  }, [investedCash, filterAcc]);
  
  const totalROI = useMemo(() => {
    return filterAcc === 'all'
      ? investedCash.growth.roi
      : investedCash.growth.accountsGrowth[filterAcc].roi;
  }, [investedCash, filterAcc]);
  
  const displayDate = error 
    ? new Date()                    // today
    : date;

  const subtitleStyle = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '10px 0 0 0'
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 border border-gray-100" style={{ marginTop: '20px'}}>
      <div className="flex flex-col lg:flex-row lg:justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 text-white">
            <PieChart size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{t('Investment Portfolio')}</h2>
            <p style={subtitleStyle}>{t('Open positions treemap visualization')} {prettyDateLT(displayDate)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Metric 
            label={`${t('Total Value')}`} 
            value={`${formatCurrency(totalValue)}`}
            positive={true}
            icon={DollarSign}
          />
          <Metric 
            label={`${t('Total P&L')}`}
            value={`${formatCurrency(totalProfit)} (${totalROI}%)`}
            positive={totalProfit >= 0}
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 space-y-4 lg:space-y-0 mb-8">
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Filter size={16} className="text-gray-500" />
            <span>{t('Account Filter')}</span>
          </label>
          <ToggleGroup
            options={accountOptions}
            selected={filterAcc}
            onChange={setFilterAcc}
          />
        </div>
                
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-  2 text-sm font-medium text-gray-700">
            <Eye size={16} className="text-gray-500" />
            <span>{t('Color Mode')}</span>
          </label>
          <ToggleGroup
            options={[
              { key: 'abs', label: t('Profit (€)'), icon: '💰' },
              { key: 'pct', label: t('ROI (%)'), icon: '📈' }
            ]}
            selected={colorMode}
            onChange={setColorMode}
          />
        </div>
      </div>

      {/* Treemap Visualization */}
      <div className="relative bg-white rounded-2xl border border-gray-200 p-4 shadow-inner">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            {t('Loading…')}
          </div>
        )}
        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            {t('Error...')} {error}
          </div>
        )}
        {!loading && !error && positions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {T('No data for this date')}
          </div>
        )}
        <div
          ref={setContainerEl}
          className="w-full h-[500px] bg-gray-50"
          style={{ position: 'relative' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              {t('Loading…')}
            </div>
          )}
          <svg
            ref={svgRef}
            width="100%"
            height="500"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Investment Portfolio Treemap"
          />
          
          {/* Hover tooltip */}
          {hoveredNode && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white rounded-lg p-3 text-sm pointer-events-none">
              <div className="font-semibold">{hoveredNode.symbol}</div>
              <div>Value: {formatCurrency(hoveredNode.positionValue)}</div>
              <div className={hoveredNode.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                P&L: {formatCurrency(hoveredNode.profit)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>{t('Profitable')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>{t('Loss')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>{t('Break-even')}</span>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <DetailPanel data={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};