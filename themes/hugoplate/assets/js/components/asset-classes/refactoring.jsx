import { h } from 'preact';
import { formatCurrency, AccountsMap } from '../../utils';
import * as assetData from '../../../reports-widgets-data/investment-portfolio.json';

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
  TrendingUp: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  TrendingDown: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  Calendar: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  Euro: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  BarChart3: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  Wallet: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  Target: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>,
  CreditCard: ({ cls }) => <svg className={cls} /* ... */>/* path */</svg>
};

export function AssetClasses({
  data = assetData.default.filter(
    (i) => !['Goal Net Worth', 'Total'].includes(i.Account)
  )
}) {
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
          <td className="py-4 px-3">
            <div className="flex items-center gap-3">
              <Icon cls="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">
                {AccountsMap[Account] || Account}
              </span>
            </div>
          </td>
          <td className="py-4 px-3 text-gray-600">
            {year}
          </td>
          <td className="py-4 px-3 text-right font-mono text-gray-800">
            {formatCurrency(spentAmountEur ?? spentAmount)}
          </td>
          <td className="py-4 px-3 text-right font-mono text-gray-800">
            {formatCurrency(currentValueEur ?? currentValue)}
          </td>
          <td className="py-4 px-3 text-right">
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

  const summary = [
    {
      title: 'Total (-Paskolos)',
      value: total.growth.currentValueMinusLiabilities,
      roi: total.growth.adjustedRoi,
      icon: 'Target',
      colors: ['green-50', 'emerald-50', 'green-200', 'green-600', 'green-800']
    },
    {
      title: 'Total',
      sub: formatCurrency(total.growth.spentAmount),
      value: total.growth.currentValue,
      roi: total.growth.roi,
      icon: 'BarChart3',
      colors: ['blue-50', 'indigo-50', 'blue-200', 'blue-600', 'blue-800']
    },
    {
      title: 'Paskolos',
      value: total.Liabilities,
      icon: 'CreditCard',
      colors: ['red-50', 'pink-50', 'red-200', 'red-600', 'red-800']
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Svg.Wallet cls="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Turto Balansas</h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              {['Turtas', t('investedDate'), 'Investuota', 'Nerealizuota Vertė', 'ROI'].map((h, i) => (
                <th key={i} className={`text-left py-4 px-3 font-semibold text-gray-700${i===0? ' w-2/5':''}`}>
                  <div className="flex items-center justify-end gap-2">
                    {i===0 && <Svg.Wallet cls="w-4 h-4" />}
                    {i===1 && <Svg.Calendar cls="w-4 h-4" />}
                    {i===2 && <Svg.Euro cls="w-4 h-4" />}
                    {i===3 && <Svg.BarChart3 cls="w-4 h-4" />}
                    {i===4 && <Svg.TrendingUp cls="w-4 h-4" />}
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
        {summary.map((card, i) => {
          const [from, to, border, iconColor, textColor] = card.colors;
          const IconComp = Svg[card.icon];
          return (
            <div key={i} className={`bg-gradient-to-r from-${from} to-${to} rounded-lg p-4 border border-${border}`}> 
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1 bg-${from} rounded`}>
                  <IconComp cls={`w-4 h-4 text-${iconColor}`} />
                </div>
                <span className={`font-semibold text-${textColor}`}>{card.title}</span>
              </div>
              {card.sub && <div className="text-sm text-${iconColor} font-mono mb-1">{card.sub}</div>}
              <div className={`text-2xl font-bold text-${textColor} font-mono`}>{formatCurrency(card.value)}</div>
              {card.roi != null && (
                <div className="flex items-center mt-1">
                  <span style={{ color: card.roi > 0 ? '#10b981' : card.roi < 0 ? '#ef4444' : '#6b7280', fontWeight: 600 }} className="text-sm font-mono">
                    {card.roi.toFixed(1)}%
                  </span>
                  {card.roi>0 ? <Svg.TrendingUp cls="w-4 h-4 text-green-500 ml-1" /> : <Svg.TrendingDown cls="w-4 h-4 text-red-500 ml-1" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
