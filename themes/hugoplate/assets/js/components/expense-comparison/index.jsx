import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatCurrency } from '../../utils';
import * as d3 from 'd3';
import * as comparisonData2024 from '../../../reports-widgets-data/pl-report-comparison-2024-04-30.json';
import * as comparisonData2025 from '../../../reports-widgets-data/pl-report-comparison-2025-04-30.json';
import * as comparisonData2026 from '../../../reports-widgets-data/pl-report-comparison-2026-04-30.json';

const METRICS = [
	{ key: 'totalRevenue', labelKey: 'revenue', color: '#2563eb' },
	{ key: 'totalExpenses', labelKey: 'expenses', color: '#f97316' },
	{ key: 'netResult', labelKey: 'netIncome', color: '#16a34a' }
];

const DEFAULT_DATA = [
	{ year: '2024', ...(comparisonData2024.default || comparisonData2024) },
	{ year: '2025', ...(comparisonData2025.default || comparisonData2025) },
	{ year: '2026', ...(comparisonData2026.default || comparisonData2026) }
];

const translations = {
	en: {
		yearlyComparison: 'Yearly Financial Comparison',
		revenue: 'Revenue',
		expenses: 'Expenses',
		netIncome: 'Net Income'
	},
	lt: {
		yearlyComparison: 'Metų finansų palyginimas',
		revenue: 'Pajamos',
		expenses: 'Išlaidos',
		netIncome: 'Grynosios pajamos'
	}
};

function t(key, lang = 'lt') {
	return translations[lang]?.[key] || key;
}

export function ExpenseComparison({ data = DEFAULT_DATA, title, lang = 'lt' }) {
	const rootRef = useRef(null);
	const svgRef = useRef(null);
	const [width, setWidth] = useState(760);
	const resolvedTitle = title || t('yearlyComparison', lang);

	const chartData = useMemo(() => {
		return data.map((item) => {
			const netResult = item.netIncome != null ? item.netIncome : -(item.netLoss || 0);
			return {
				year: String(item.year),
				totalRevenue: Number(item.totalRevenue || 0),
				totalExpenses: Number(item.totalExpenses || 0),
				netResult: Number(netResult || 0)
			};
		});
	}, [data]);

	useEffect(() => {
		if (!rootRef.current) return;
		const observer = new ResizeObserver((entries) => {
			const nextWidth = entries[0]?.contentRect?.width;
			if (nextWidth) setWidth(nextWidth);
		});
		observer.observe(rootRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!svgRef.current || !chartData.length) return;

		const height = 430;
		const margin = { top: 50, right: 24, bottom: 70, left: 90 };
		const innerWidth = Math.max(320, width - margin.left - margin.right);
		const innerHeight = height - margin.top - margin.bottom;

		const allValues = chartData.flatMap((d) => METRICS.map((m) => d[m.key]));
		const yMin = Math.min(0, d3.min(allValues) || 0);
		const yMax = d3.max(allValues) || 0;

		const x0 = d3.scaleBand().domain(chartData.map((d) => d.year)).range([0, innerWidth]).paddingInner(0.22);
		const x1 = d3.scaleBand().domain(METRICS.map((m) => m.key)).range([0, x0.bandwidth()]).padding(0.14);
		const y = d3.scaleLinear().domain([yMin, yMax]).nice().range([innerHeight, 0]);

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove();
		svg.attr('viewBox', `0 0 ${width} ${height}`);

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		g.append('g')
			.attr('transform', `translate(0,${innerHeight})`)
			.call(d3.axisBottom(x0))
			.call((axis) => axis.selectAll('text').attr('font-size', 12));

		g.append('g')
			.call(d3.axisLeft(y).ticks(6).tickFormat((v) => `${(Number(v) / 1000).toFixed(0)}k`))
			.call((axis) => axis.selectAll('text').attr('font-size', 12));

		g.append('line')
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.attr('y1', y(0))
			.attr('y2', y(0))
			.attr('stroke', '#334155')
			.attr('stroke-opacity', 0.35);

		const yearGroup = g.selectAll('.year-group').data(chartData).enter().append('g').attr('class', 'year-group').attr('transform', (d) => `translate(${x0(d.year)},0)`);

		yearGroup
			.selectAll('rect')
			.data((d) => METRICS.map((m) => ({ metric: m, value: d[m.key] })))
			.enter()
			.append('rect')
			.attr('x', (d) => x1(d.metric.key))
			.attr('width', x1.bandwidth())
			.attr('y', (d) => (d.value >= 0 ? y(d.value) : y(0)))
			.attr('height', (d) => Math.abs(y(d.value) - y(0)))
			.attr('fill', (d) => d.metric.color)
			.attr('rx', 4);

		yearGroup
			.selectAll('text.value')
			.data((d) => METRICS.map((m) => ({ metric: m, value: d[m.key] })))
			.enter()
			.append('text')
			.attr('class', 'value')
			.attr('x', (d) => (x1(d.metric.key) || 0) + x1.bandwidth() / 2)
			.attr('y', (d) => (d.value >= 0 ? y(d.value) - 6 : y(d.value) + 16))
			.attr('text-anchor', 'middle')
			.attr('fill', '#334155')
			.attr('font-size', 11)
			.text((d) => formatCurrency(d.value));

		const legend = svg.append('g').attr('transform', `translate(${margin.left},20)`);
		METRICS.forEach((metric, i) => {
			const item = legend.append('g').attr('transform', `translate(${i * 150},0)`);
			item.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', metric.color);
			item.append('text').attr('x', 18).attr('y', 10).attr('fill', '#0f172a').attr('font-size', 12).text(t(metric.labelKey, lang));
		});
	}, [chartData, width, lang]);

	return (
		<div ref={rootRef} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
			<h3 style={{ margin: '0 0 12px', fontSize: '18px', color: '#0f172a' }}>{resolvedTitle}</h3>
			<svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
		</div>
	);
}

export default ExpenseComparison;