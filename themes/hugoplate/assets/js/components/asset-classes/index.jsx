import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { formatCurrency, AccountsMap, prettyDateLT } from '../../utils';
import * as investmentPortfolioData from '../../../reports-widgets-data/investment-portfolio.json';
import { loadInvestmentPortfolio } from '../../data-loaders';
const assetClassesData = investmentPortfolioData.default.filter(item => item.Account !== 'Goal Net Worth' && item.Account !== 'Total');

// Translations
const T = { en: { investedDate: 'Date Invested' }, lt: { investedDate: 'Įsigijimo Data' } };
const t = (key, lang = 'lt') => T[lang][key] || key;

// Icon mapping
const iconMap = {
  Stocks: 'BarChart3',
  Bonds: 'Target',
  'Real Estate': 'Wallet',
  Cash: 'Euro',
  Crypto: 'TrendingUp'
};

// SVG components
const Svg = {
  TrendingUp: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 17 6-6 4 4 8-8M21 7h-5v5"
      />
    </svg>
  ),
  TrendingDown: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7l6 6 4-4 8 8m4-8h-5v5"
      />
    </svg>
  ),
  Calendar: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  Euro: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  BarChart3: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20V10m6 10V4M6 20v-6"
      />
    </svg>
  ),
  Target: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </svg>
  ),
  CreditCard: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  Wallet: ({ cls }) => (
    <svg
      className={cls}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6zM3 10h18"
      />
    </svg>
  ),
};


export function AssetClasses({ d = assetClassesData, date = null }) {
  const [data, setData]   = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
    if (!date) {
      setData(d);
      return;
    }
    setLoading(true)

    loadInvestmentPortfolio(date)
      .then(raw => {
        setData(raw.filter(item =>
          item.Account !== 'Goal Net Worth' && item.Account !== 'Total'
        ));
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setData(d); // fallback to the ytd data
      })
      .finally(() => {
        // 3) Always clear loading flag
        setLoading(false);
      });
  }, [date]);

  
  if (loading) return <div>Loading…</div>;
  if (data === undefined) return <div>Loading…</div>;
  if (data.length === 0) return <div>No data for this date</div>;
  const total = data.find((i) => i.Account === 'Current Total Net Worth');

  const rows = data
    .filter((i) => i.Account !== 'Current Total Net Worth')
    .map((item, idx) => {
      const { Account, savingsStart, PurchaseYear, growth } = item;
      const Icon = Svg[iconMap[Account] || 'Wallet'];
      const year = savingsStart?.split('-')[0] || PurchaseYear || '-';
      const {
        spentAmount,
        spentAmountEur,
        currentValue,
        currentValueEur,
        roi
      } = growth || {};

      return (
        <tr
          key={idx}
          className="border-b hover:bg-gray-50 transition-colors"
        >
          <td className="responsive-th-4 responsive-th-3">
            <div className="flex items-center gap-3">
              <Icon cls="w-5 h-5 text-gray-600 icons" />
              <span className="font-medium text-gray-800">
                {AccountsMap[Account] || Account}{year !== '-' ? `, ${year}` : ''}
              </span>
            </div>
          </td>
          {/* <td className="py-4 px-3 text-gray-600">
            {year}
          </td> */}
          <td className="responsive-th-4 responsive-th-3 text-right font-mono text-gray-800">
            {formatCurrency(spentAmountEur ?? spentAmount)}
          </td>
          <td className="responsive-th-4 responsive-th-3 text-right font-mono text-gray-800">
            {formatCurrency(currentValueEur ?? currentValue)}
          </td>
          <td className="responsive-th-4 responsive-th-3 text-right">
            <div className="flex items-center justify-end">
              <span style={{
                color: roi > 0 ? '#10b981' : roi < 0 ? '#ef4444' : '#6b7280',
                fontWeight: '600'
              }} className="font-mono">
                {growth ? `${roi}%` : '-'}
              </span>
              {growth && (roi > 0 ? (
                <Svg.TrendingUp cls="w-4 h-4 text-green-500 inline ml-1" />
              ) : (
                <Svg.TrendingDown cls="w-4 h-4 text-red-500 inline ml-1" />
              ))}
            </div>
          </td>
        </tr>
      );
    });
    const summaryStyles = {
      minusLiabilities: {
        container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
        iconBg:    'bg-green-50',
        icon:      'text-green-600',
        title:     'text-green-800',
        sub:       'text-green-600',
        value:     'text-green-800',
      },
      total: {
        container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
        iconBg:    'bg-blue-50',
        icon:      'text-blue-600',
        title:     'text-blue-800',
        sub:       'text-blue-600',
        value:     'text-blue-800',
      },
      liabilities: {
        container: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
        iconBg:    'bg-red-50',
        icon:      'text-red-600',
        title:     'text-red-800',
        value:     'text-red-800',
        // no sub for this card
      },
    };

  const summary = [
  {
    key:  'minusLiabilities',
    title: 'Total (-Paskolos)',
    value: total.growth.currentValueMinusLiabilities,
    roi:   total.growth.adjustedRoi,
    icon:  'Target',
  },
  {
    key:  'total',
    title: 'Total',
    sub:   formatCurrency(total.growth.spentAmount),
    value: total.growth.currentValue,
    roi:   total.growth.roi,
    icon:  'BarChart3',
  },
  {
    key:  'liabilities',
    title: 'Paskolos',
    value: total.Liabilities,
    icon:  'CreditCard',
  }
];

  const displayDate = error 
    ? new Date()                    // today
    : date;

  const subtitleStyle = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '10px 0 0 0'
  };


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      <style>
        {`
          @media (max-width: 639px) {
            .responsive-th-4 {
              padding-block: calc(var(--spacing) * 2);
            }
            .responsive-th-3 {
              padding-inline: calc(var(--spacing) * 1);
            }

            .icons {
              display: none;}
          }
          @media (min-width: 640px) and (max-width: 767px) {
            .responsive-th-4 {
              padding-block: calc(var(--spacing) * 4);
            }
            .responsive-th-3 {
              padding-inline: calc(var(--spacing) * 3);
            }
          }
          @media (min-width: 768px) {
            .responsive-th-4 {
              padding-block: calc(var(--spacing) * 4);
            }
            .responsive-th-3 {
              padding-inline: calc(var(--spacing) * 3);
            }
          }
        `}
      </style>
      <header className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Svg.Wallet cls="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Turto Balansas</h2>
        <p style={subtitleStyle}>{prettyDateLT(displayDate)}</p>

      </header>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              {/* {['Turtas', t('investedDate'), 'Investuota', 'Nerealizuota Vertė', 'ROI'].map((h, i) => ( */}
              {['Turtas', 'Investuota', 'Nerealizuota Vertė', 'ROI'].map((h, i) => (
                <th key={i} className={`text-left responsive-th-4 responsive-th-3 font-semibold text-gray-700${i===0? ' w-2/5':''}`}>
                  <div className={`flex items-center ${i < 1 ? 'justify-start' : 'justify-end'} gap-2`}>
                    {i===0 && <Svg.Wallet cls="w-4 h-4" />}
                    {/* {i===1 && <Svg.Calendar cls="w-4 h-4" />} */}
                    {i===1 && <Svg.Euro cls="w-4 h-4" />}
                    {i===2 && <Svg.BarChart3 cls="w-4 h-4" />}
                    {i===3 && <Svg.TrendingUp cls="w-4 h-4" />}
                    {h}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {summary.map(card => {
        const styles   = summaryStyles[card.key];
        const IconComp = Svg[card.icon];

        return (
          <div
            key={card.key}
            className={`rounded-lg p-4 border ${styles.container}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded ${styles.iconBg}`}>
                <IconComp cls={`w-4 h-4 ${styles.icon}`} />
              </div>
              <span className={`font-semibold ${styles.title}`}>
                {card.title}
              </span>
            </div>

            {card.sub && (
              <div className={`text-sm font-mono mb-1 ${styles.sub}`}>
                {card.sub}
              </div>
            )}

            <div className={`text-2xl font-bold font-mono ${styles.value}`}>
              {formatCurrency(card.value)}
            </div>

            {card.roi != null && (
              <div className="flex items-center mt-1">
                <span
                  className="text-sm font-mono"
                  style={{
                    color:
                      card.roi > 0 ? '#10b981'
                        : card.roi < 0 ? '#ef4444'
                        : '#6b7280',
                    fontWeight: 600
                  }}
                >
                  {card.roi.toFixed(1)}%
                </span>
                {card.roi > 0 ? (
                  <Svg.TrendingUp cls="w-4 h-4 text-green-500 ml-1" />
                ) : (
                  <Svg.TrendingDown cls="w-4 h-4 text-red-500 ml-1" />
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
