import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { formatCurrency, AccountsMap } from '../../utils';
import * as investmentPortfolioData from "../../../reports-widgets-data/investment-portfolio.json";
const assetClassesData = investmentPortfolioData.default.filter(item => item.Account !== 'Goal Net Worth' && item.Account !== 'Total');

const translations = {
  en: {
    investedDate: 'Date Invested'
  },
  lt: {
    investedDate: 'Įsigijimo Data'
  }
};

// SVG Icons as Preact components
const TrendingUp = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'm3 17 6-6 4 4 8-8M21 7h-5v5' 
}));

const TrendingDown = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M3 7l6 6 4-4 8 8m4-8h-5v5' 
}));

const Calendar = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' 
}));

const Euro = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
}));

const BarChart3 = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M12 20V10m6 10V4M6 20v-6' 
}));

const Wallet = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M21 12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6zM3 10h18' 
}));

const CreditCard = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' 
}));

const Target = ({ className }) => h('svg', { 
  className, 
  fill: 'none', 
  stroke: 'currentColor', 
  viewBox: '0 0 24 24' 
}, h('path', { 
  strokeLinecap: 'round', 
  strokeLinejoin: 'round', 
  strokeWidth: 2, 
  d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' 
}));

const t = (key, lang = 'lt') => translations[lang][key] || key;

// Mock data for demonstration
const getAssetIcon = (account) => {
  const iconMap = {
    'Stocks': h(BarChart3, { className: "w-5 h-5 text-blue-600" }),
    'Bonds': h(Target, { className: "w-5 h-5 text-green-600" }),
    'Real Estate': h(Wallet, { className: "w-5 h-5 text-purple-600" }),
    'Cash': h(Euro, { className: "w-5 h-5 text-yellow-600" }),
    'Crypto': h(TrendingUp, { className: "w-5 h-5 text-orange-600" })
  };
  return iconMap[account] || h(Wallet, { className: "w-5 h-5 text-gray-600" });
};

export function AssetClasses({ d = assetClassesData, jsonUrl = null }) {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(jsonUrl)
      .then(res => {
        if (!res.ok) setData(d)
        return
      })
      .then(raw => {
        // filter out unwanted accounts
        setData(raw.filter(item =>
          item.Account !== 'Goal Net Worth' && item.Account !== 'Total'
        ));
      })
      .catch(console.error);
  }, [jsonUrl]);

  if (!data) return <div>Loading…</div>;
  const totalNetWorthObject = data.find(item => item.Account === "Current Total Net Worth");

  const getRoiStyle = (roi) => ({
    color: roi > 0 ? '#10b981' : roi < 0 ? '#ef4444' : '#6b7280',
    fontWeight: '600'
  });

  const getRoiIcon = (roi) => {
    if (roi > 0) return h(TrendingUp, { className: "w-4 h-4 text-green-500 inline ml-1" });
    if (roi < 0) return h(TrendingDown, { className: "w-4 h-4 text-red-500 inline ml-1" });
    return null;
  };

  return h('div', { className: "bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto" },
    h('div', { className: "flex items-center gap-3 mb-6" },
      h('div', { className: "p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" },
        h(Wallet, { className: "w-6 h-6 text-white" })
      ),
      h('h2', { className: "text-2xl font-bold text-gray-800" }, 'Turto Balansas')
    ),
    
    h('div', { className: "overflow-x-auto" },
      h('table', { className: "w-full" },
        h('thead', null,
          h('tr', { className: "border-b-2 border-gray-100" },
            h('th', { className: "text-left py-4 px-3 font-semibold text-gray-700 w-2/5" },
              h('div', { className: "flex items-center gap-2" },
                h(Wallet, { className: "w-4 h-4" }),
                'Turtas'
              )
            ),
            h('th', { className: "text-left py-4 px-3 font-semibold text-gray-700" },
              h('div', { className: "flex items-center gap-2" },
                h(Calendar, { className: "w-4 h-4" }),
                t('investedDate')
              )
            ),
            h('th', { className: "text-right py-4 px-3 font-semibold text-gray-700" },
              h('div', { className: "flex items-center justify-end gap-2" },
                h(Euro, { className: "w-4 h-4" }),
                'Investuota'
              )
            ),
            h('th', { className: "text-right py-4 px-3 font-semibold text-gray-700" },
              h('div', { className: "flex items-center justify-end gap-2" },
                h(BarChart3, { className: "w-4 h-4" }),
                'Nerealizuota Vertė'
              )
            ),
            h('th', { className: "text-right py-4 px-3 font-semibold text-gray-700" },
              h('div', { className: "flex items-center justify-end gap-2" },
                h(TrendingUp, { className: "w-4 h-4" }),
                'ROI'
              )
            )
          )
        ),
        h('tbody', null,
          data.map((obj, index) => {
            if (obj.Account !== "Current Total Net Worth") {
              return h('tr', { key: index, className: "border-b border-gray-50 hover:bg-gray-50 transition-colors" },
                h('td', { className: "py-4 px-3" },
                  h('div', { className: "flex items-center gap-3" },
                    getAssetIcon(obj.Account),
                    h('span', { className: "font-medium text-gray-800" },
                      AccountsMap[obj.Account] || obj.Account
                    )
                  )
                ),
                h('td', { className: "py-4 px-3 text-gray-600" },
                  obj.savingsStart ? obj.savingsStart.split('-')[0] : obj.PurchaseYear || '-'
                ),
                h('td', { className: "py-4 px-3 text-right font-mono text-gray-800" },
                  formatCurrency(obj.growth?.spentAmountEur || obj.growth?.spentAmount)
                ),
                h('td', { className: "py-4 px-3 text-right font-mono text-gray-800" },
                  formatCurrency(obj.growth?.currentValueEur || obj.growth?.currentValue)
                ),
                h('td', { className: "py-4 px-3 text-right" },
                  h('div', { className: "flex items-center justify-end" },
                    h('span', { style: getRoiStyle(obj.growth?.roi), className: "font-mono" },
                      obj.growth ? `${obj.growth.roi}%` : '-'
                    ),
                    obj.growth && getRoiIcon(obj.growth.roi)
                  )
                )
              );
            }
            return null;
          })
        )
      )
    ),

    // Summary Cards
    h('div', { className: "mt-8 grid grid-cols-1 md:grid-cols-3 gap-4" },
      // Total with Liabilities
      h('div', { className: "bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200" },
        h('div', { className: "flex items-center gap-2 mb-2" },
          h('div', { className: "p-1 bg-green-100 rounded" },
            h(Target, { className: "w-4 h-4 text-green-600" })
          ),
          h('span', { className: "font-semibold text-green-800" }, 'Total (-Paskolos)')
        ),
        h('div', { className: "text-2xl font-bold text-green-700 font-mono" },
          formatCurrency(totalNetWorthObject?.growth?.currentValueMinusLiabilities)
        ),
        h('div', { className: "flex items-center mt-1" },
          h('span', { style: getRoiStyle(totalNetWorthObject?.growth?.adjustedRoi), className: "text-sm font-mono" },
            totalNetWorthObject?.growth?.adjustedRoi?.toFixed(1) + '%'
          ),
          totalNetWorthObject?.growth?.adjustedRoi && getRoiIcon(totalNetWorthObject.growth.adjustedRoi)
        )
      ),

      // Total
      h('div', { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200" },
        h('div', { className: "flex items-center gap-2 mb-2" },
          h('div', { className: "p-1 bg-blue-100 rounded" },
            h(BarChart3, { className: "w-4 h-4 text-blue-600" })
          ),
          h('span', { className: "font-semibold text-blue-800" }, 'Total')
        ),
        h('div', { className: "text-sm text-blue-600 font-mono mb-1" },
          'Investuota: ' + formatCurrency(totalNetWorthObject?.growth?.spentAmount)
        ),
        h('div', { className: "text-2xl font-bold text-blue-700 font-mono" },
          formatCurrency(totalNetWorthObject?.growth?.currentValue)
        ),
        h('div', { className: "flex items-center mt-1" },
          h('span', { style: getRoiStyle(totalNetWorthObject?.growth?.roi), className: "text-sm font-mono" },
            totalNetWorthObject?.growth?.roi?.toFixed(1) + '%'
          ),
          totalNetWorthObject?.growth?.roi && getRoiIcon(totalNetWorthObject.growth.roi)
        )
      ),

      // Liabilities
      h('div', { className: "bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200" },
        h('div', { className: "flex items-center gap-2 mb-2" },
          h('div', { className: "p-1 bg-red-100 rounded" },
            h(CreditCard, { className: "w-4 h-4 text-red-600" })
          ),
          h('span', { className: "font-semibold text-red-800" }, 'Paskolos')
        ),
        h('div', { className: "text-2xl font-bold text-red-700 font-mono" },
          formatCurrency(totalNetWorthObject?.Liabilities)
        )
      )
    )
  );
}