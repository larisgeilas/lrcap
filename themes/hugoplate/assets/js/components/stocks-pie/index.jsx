import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import * as d3 from 'd3';
import { formatCurrency, prettyDateLT } from '../../utils';
import * as investmentPortfolioData from '../../../reports-widgets-data/investment-portfolio.json';
import { loadInvestmentPortfolio } from '../../data-loaders';
import { PieChart } from 'lucide-react';

const investmentData = investmentPortfolioData.default;

const T = {
	en: {
		'Stock Portfolio by Category': 'Stock Portfolio by Category',
		'Total Positions Value': 'Total Positions Value',
		'Portfolio categories pie chart': 'Portfolio categories pie chart',
		'Loading...': 'Loading...',
		'Error:': 'Error:',
		'No data for this date': 'No data for this date',
		'Failed to load portfolio data': 'Failed to load portfolio data',
		Crypto: 'Crypto',
		Commodities: 'Commodities',
		'ETF / Funds': 'ETF / Funds',
		'US Tech': 'US Tech',
		Healthcare: 'Healthcare',
		Financials: 'Financials',
		'European Stocks': 'European Stocks',
		'Other Stocks': 'Other Stocks',
        'Money Funds': 'Money Funds'
	},
	lt: {
		'Stock Portfolio by Category': 'Portfelis pagal kategorijas',
		'Total Positions Value': 'Bendra poziciju verte',
		'Portfolio categories pie chart': 'Portfelio kategoriju skrituline diagrama',
		'Loading...': 'Ikeliama...',
		'Error:': 'Klaida:',
		'No data for this date': 'Duomenu siai dienai nera',
		'Failed to load portfolio data': 'Nepavyko ikelti portfelio duomenu',
		Crypto: 'Kriptovaliutos',
		Commodities: 'Žaliavos',
		'Index Funds': 'Index Fondai',
		'US Tech': 'JAV technologijos',
		Healthcare: 'Sveikatos apsauga',
		Financials: 'Finansų sektorius',
		'European Stocks': 'Europos akcijos',
		'Other Stocks': 'Kitos akcijos',
        'Money Funds': 'Pinigų fondai'
	}
};

const t = (key, lang = 'lt') => T[lang][key] || key;

const CATEGORY_COLORS = [
	'#2563eb',
	'#16a34a',
	'#f59e0b',
	'#7c3aed',
	'#ef4444',
	'#0891b2',
	'#334155',
    '#999999',
	'#84cc16'
];

// const PieChart = ({ size = 16, className = "" }) => (
//   <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>📊</span>
// );

const classifyPosition = (position) => {
	const symbol = String(position.symbol || '').toUpperCase();
	const assetCategory = String(position.assetCategory || '').toUpperCase();

	if (symbol === 'BTC') return 'Crypto';
	if (symbol === '4GLD') return 'Commodities';
	if (assetCategory === 'ETF' || symbol === 'VWCE' || symbol === 'WDEF') {
		return 'Index ETFs';
	}
    if (assetCategory === 'CASH' || symbol === 'IE00B3L10570') {
		return 'Money Funds';
	}
	if (['AAPL', 'AMZN', 'GOOG'].includes(symbol)) return 'US Tech';
	if (['UNH'].includes(symbol)) return 'Healthcare';
	if (['IBKR', 'BRK B'].includes(symbol)) return 'Financials';
	if (['NOV', 'H1W'].includes(symbol)) return 'European Stocks';

	return 'Other Stocks';
};

const buildCategoryData = (data) => {
	const investedCash = data?.find((acc) => acc.Account === 'Invested Cash');
	const ibkr = investedCash?.growth?.ibkr;
	if (!ibkr) return [];

	const positions = Object.values(ibkr).flatMap((entry) => entry.openPositions || []);
	const grouped = new Map();

	positions.forEach((position) => {
		const value = Number(position.positionValue || 0);
		if (!Number.isFinite(value) || value <= 0) return;

		const category = classifyPosition(position);
		grouped.set(category, (grouped.get(category) || 0) + value);
	});

	const total = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0);
	if (total <= 0) return [];

	return Array.from(grouped.entries())
		.map(([category, value]) => ({
			category,
			value,
			percent: (value / total) * 100
		}))
		.sort((a, b) => b.value - a.value);
};

const PieChart2 = ({ size = 16, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={{fontSize: `${size}px`}}>◔</span>
);

export function StocksPie({ d = investmentData, date = null }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(d);
	const [activeCategory, setActiveCategory] = useState(null);

	useEffect(() => {
		setError(null);
		if (!date) {
			setData(d);
			return;
		}

		let cancelled = false;
		setLoading(true);

		loadInvestmentPortfolio(date)
			.then((raw) => {
				if (!cancelled) setData(raw);
			})
			.catch((err) => {
				if (!cancelled) {
					console.error(err);
					setError(err.message || t('Failed to load portfolio data'));
					setData(d);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [date, d]);

	const investedCash = useMemo(
		() => data?.find((acc) => acc.Account === 'Invested Cash'),
		[data]
	);

	const categories = useMemo(() => buildCategoryData(data), [data]);
	const totalValue = investedCash?.growth?.currentValue || 0;

	const pieArcs = useMemo(() => {
		if (!categories.length) return [];

		const pie = d3
			.pie()
			.value((item) => item.value)
			.sort(null);

		const arc = d3
			.arc()
			.innerRadius(50)
			.outerRadius(130);

		const midArc = d3
			.arc()
			.innerRadius(-50)
			.outerRadius(250);

		const outerArc = d3
			.arc()
			.innerRadius(100)
			.outerRadius(100);

		const labelArc = d3
			.arc()
			.innerRadius(150)
			.outerRadius(150);

		return pie(categories).map((segment, index) => {
			const isSmall = segment.data.percent < 8;
			const midPos = midArc.centroid(segment);
			const labelPos = labelArc.centroid(segment);
			const outerPos = outerArc.centroid(segment);
			const side = labelPos[0] >= 0 ? 1 : -1;
			const lineEnd = [labelPos[0] + side * 4, labelPos[1]];
			const textPos = [labelPos[0] + side * 10, labelPos[1]];

			return {
			...segment,
			path: arc(segment),
			midPos,
			outerPos,
			lineEnd,
			textPos,
			textAnchor: side > 0 ? 'start' : 'end',
			isSmall,
			color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
			};
		});
	}, [categories]);

	if (loading) return <div>{t('Loading...')}</div>;
	if (error) return <div>{t('Error:')} {error}</div>;
	if (!categories.length) return <div>{t('No data for this date')}</div>;

	const displayDate = date || new Date();

	return (
		<div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 border border-gray-100" style={{ marginTop: '20px'}}>
            <style>
                {`
                @media (max-width: 639px) {
                    .piechart {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .piechart > div:first-child {
                        width: 300px;
                        height: 300px;
                    
                    }
                }
                @media (min-width: 640px) and (max-width: 767px) {
                    .piechart {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .piechart > div:first-child {
                        width: 300px;
                        height: 300px;
                    }
                }
         
                `}
            </style>
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 text-white">
                <PieChart2 size={24} />
                </div>
                <div>
                <div>
					<h2 className="text-2xl font-bold text-gray-800">{t('Stock Portfolio by Category')}</h2>
					<p className="text-sm text-gray-500">{prettyDateLT(displayDate)} {t('Total Positions Value')}: <span className="font-semibold text-gray-800">{formatCurrency(totalValue)}</span></p>
				</div>
            </div>
            </div>

            <div className="flex md:flex-row md:items-start gap-8 md:gap-12 piechart">
                <div className="flex items-center justify-center w-full md:w-auto md:flex-shrink-0">
					<svg width="400" height="400" viewBox="0 0 400 400" role="img" aria-label={t('Portfolio categories pie chart')}>
						<defs>
							<marker
								id="pie-label-arrow"
								viewBox="0 0 10 10"
								refX="8"
								refY="5"
								markerWidth="6"
								markerHeight="6"
								orient="auto-start-reverse"
							>
								<path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
							</marker>
						</defs>
						<g transform="translate(200,200)">
							{pieArcs.map((segment) => (
								<g
									key={segment.data.category}
									onMouseEnter={() => setActiveCategory(segment.data.category)}
									onMouseLeave={() => setActiveCategory(null)}
									onTouchStart={() => setActiveCategory(segment.data.category)}
								>
								<path
									d={segment.path}
									fill={segment.color}
									stroke="#ffffff"
									strokeWidth={activeCategory === segment.data.category ? '4' : '2'}
									style={{
										transform: activeCategory === segment.data.category ? 'scale(1.04)' : 'scale(1)',
										transformOrigin: 'center',
										transition: 'transform 180ms ease, stroke-width 180ms ease, filter 180ms ease',
										filter: activeCategory === segment.data.category ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' : 'none'
									}}
								/>
								{segment.isSmall && (
									<line
										x1={segment.outerPos[0]}
										y1={segment.outerPos[1]}
										x2={segment.lineEnd[0]}
										y2={segment.lineEnd[1]}
										stroke="#6b7280"
										strokeWidth={activeCategory === segment.data.category ? '2' : '1.25'}
										markerEnd="url(#pie-label-arrow)"
										pointerEvents="none"
									/>
								)}
								<text
									x={segment.isSmall ? segment.textPos[0] : segment.midPos[0]}
									y={segment.isSmall ? segment.textPos[1] : segment.midPos[1]}
									textAnchor={segment.isSmall ? segment.textAnchor : 'middle'}
									dominantBaseline="middle"
									fill={'#374151'}
									fontSize={'12px'}
									fontWeight="700"
									pointerEvents="none"
								>
									{segment.data.percent.toFixed(1)}%
								</text>
								</g>
							))}
						</g>
					</svg>
				</div>

			    <div className="space-y-3 w-full md:flex-1">
					{pieArcs.map((segment) => (
						<div
							key={segment.data.category}
							onMouseEnter={() => setActiveCategory(segment.data.category)}
							onMouseLeave={() => setActiveCategory(null)}
							onTouchStart={() => setActiveCategory(segment.data.category)}
							className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 transition-all duration-200"
							style={{
								borderColor: activeCategory === segment.data.category ? segment.color : undefined,
								boxShadow:
									activeCategory === segment.data.category
										? '0 6px 18px rgba(15, 23, 42, 0.14)'
										: 'none',
								transform: activeCategory === segment.data.category ? 'translateY(-1px)' : 'translateY(0)'
							}}
						>
							<div className="flex items-center gap-3">
								<span
									className="inline-block w-3 h-3 rounded-full"
									style={{ backgroundColor: segment.color }}
								/>
								<span className="font-medium text-gray-800">{t(segment.data.category)}</span>
							</div>
							<div className="text-right">
								<div className="text-sm font-semibold text-gray-800">{segment.data.percent.toFixed(1)}%</div>
								<div className="text-xs text-gray-500">{formatCurrency(segment.data.value)}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default StocksPie;
