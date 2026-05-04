import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { formatCurrency } from '../../../utils';
import * as comparisonData2024 from '../../../../reports-widgets-data/pl-report-comparison-2024-04-30.json';
import * as comparisonData2025 from '../../../../reports-widgets-data/pl-report-comparison-2025-04-30.json';
import * as comparisonData2026 from '../../../../reports-widgets-data/pl-report-comparison-2026-04-30.json';

const METRICS = [
	{ key: 'totalRevenue', label: 'Revenue', color: '#2c6ce3' },
	{ key: 'totalExpenses', label: 'Expenses', color: '#d34a4a' },
	{ key: 'netResult', label: 'Net Income', color: '#13dd5d' }
];

const DEFAULT_DATA = [
	{ year: '2024', ...(comparisonData2024.default || comparisonData2024) },
	{ year: '2025', ...(comparisonData2025.default || comparisonData2025) },
	{ year: '2026', ...(comparisonData2026.default || comparisonData2026) }
];

const translations = {
	en: {
		yearlySnapshot: 'Year Financial Snapshot',
		year: 'Year',
		metric: 'Metric',
		amount: 'Amount',
		revenue: 'Revenue',
		expenses: 'Expenses',
		netIncome: 'Net Income',
		revenueExpensesNet: 'Revenue / Expenses / Net',
		positiveNet: 'Positive net',
		negativeNet: 'Negative net'
	},
	lt: {
		yearlySnapshot: 'Metų finansinė apžvalga',
		year: 'Metai',
		metric: 'Rodiklis',
		amount: 'Suma',
		revenue: 'Pajamos',
		expenses: 'Išlaidos',
		netIncome: 'Grynosios pajamos',
		revenueExpensesNet: 'Pajamos / Išlaidos / Grynosios pajamos',
		positiveNet: 'Teigiamas rezultatas',
		negativeNet: 'Neigiamas rezultatas'
	}
};

function t(key, lang = 'lt') {
	return translations[lang]?.[key] || key;
}

function parseYear(value) {
	if (value == null) return String(new Date().getFullYear());
	const strValue = String(value);
	const fromPrefix = strValue.match(/^\d{4}/);
	if (fromPrefix) return fromPrefix[0];

	const parsed = new Date(strValue);
	if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());

	return String(new Date().getFullYear());
}

export function OneYearExpenseShowUp({ data = DEFAULT_DATA, date, lang = 'lt' }) {
	const selectedYear = useMemo(() => parseYear(date), [date]);
	const title = `${selectedYear} ${t('yearlySnapshot', lang)}`;
	const selectedData = useMemo(() => {
		const source = Array.isArray(data) && data.length ? data : DEFAULT_DATA;
		return source.find((item) => String(item.year) === selectedYear) || source[0];
	}, [data, selectedYear]);

	const metrics = useMemo(() => {
		const revenue = Number(selectedData?.totalRevenue || 0);
		const expenses = Number(selectedData?.totalExpenses || 0);
		const netResultRaw = selectedData?.netIncome != null ? selectedData.netIncome : -(selectedData?.netLoss || 0);
		const netResult = Number(netResultRaw || 0);
		return { revenue, expenses, netResult };
	}, [selectedData]);

	const maxBubbleValue = Math.max(metrics.revenue, metrics.expenses, Math.abs(metrics.netResult), 1);
	const revenueRadius = 42 + (metrics.revenue / maxBubbleValue) * 54;
	const expensesRadius = 30 + (metrics.expenses / maxBubbleValue) * 42;
	const netRadius = 20 + (Math.abs(metrics.netResult) / maxBubbleValue) * 28;

	const netCircle = metrics.netResult >= 0
		? {
			cx: 120,
			cy: 120,
			r: Math.max(16, Math.min(netRadius, Math.max(16, revenueRadius - 10))),
			fill: '#16a34a',
			label: t('positiveNet', lang)
		}
		: {
			cx: 120 + revenueRadius + netRadius + 10,
			cy: 120,
			r: Math.max(16, netRadius),
			fill: '#dc2626',
			label: t('negativeNet', lang)
		};

	return (
		<div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
				<h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{title}</h3>
				<div style={{ color: '#475569', fontSize: '13px' }}>{t('year', lang)}: {selectedYear}</div>
			</div>

			<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
				<div style={{ flex: '1 1 240px', minWidth: '240px' }}>
					<svg viewBox='0 0 320 240' style={{ width: '100%', display: 'block', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
						<circle cx='120' cy='120' r={revenueRadius} fill='#2c6ce3' fillOpacity='0.22' stroke='#2c6ce3' strokeWidth='2' />
						<circle cx='120' cy='120' r={expensesRadius} fill='#d34a4a' fillOpacity='0.3' stroke='#d34a4a' strokeWidth='2' />
						<circle cx={netCircle.cx} cy={netCircle.cy} r={netCircle.r} fill={netCircle.fill} fillOpacity='0.35' stroke={netCircle.fill} strokeWidth='2' />

						<text x='120' y='24' textAnchor='middle' fill='#0f172a' fontSize='12'>{t('revenueExpensesNet', lang)}</text>
						<text x={netCircle.cx} y={netCircle.cy + 4} textAnchor='middle' fill='#0f172a' fontSize='11'>{netCircle.label}</text>
					</svg>
				</div>

				<div style={{ flex: '1 1 260px', minWidth: '260px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
						<thead>
							<tr style={{ background: '#f8fafc', color: '#334155' }}>
								<th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>{t('metric', lang)}</th>
								<th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>{t('amount', lang)}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', color: '#1e3a8a' }}>{t('revenue', lang)}</td>
								<td style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', textAlign: 'right', color: '#1e3a8a', fontWeight: 600 }}>{formatCurrency(metrics.revenue)}</td>
							</tr>
							<tr>
								<td style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', color: '#b91c1c' }}>{t('expenses', lang)}</td>
								<td style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', textAlign: 'right', color: '#b91c1c', fontWeight: 600 }}>{formatCurrency(metrics.expenses)}</td>
							</tr>
							<tr>
								<td style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', color: metrics.netResult >= 0 ? '#166534' : '#b91c1c' }}>{t('netIncome', lang)}</td>
								<td style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', textAlign: 'right', color: metrics.netResult >= 0 ? '#166534' : '#b91c1c', fontWeight: 700 }}>{formatCurrency(metrics.netResult)}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default OneYearExpenseShowUp;