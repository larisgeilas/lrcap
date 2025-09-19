import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { AccountsMap, formatCurrency, prettyDateLT } from '../../utils';
import * as expensesDataSummary from "../../../reports-widgets-data/pl-report-summary.json";
import { loadProfitLoss } from '../../data-loaders';

const translations = {
  en: {
    annualExpenses: 'Annual Expenses',
    expenseTimeline: 'Expense Timeline',
    revenue: 'Revenue',
    saved: 'Saved',
    expenses: 'Expenses',
    topExpenses: 'Top Expenses',
    expenseRatio: 'Expense Ratio',
    onTrack: 'On Track',
    overGoal: 'Over Goal',
    netIncome: 'Net Income',
    goal: 'Goal'
  },
  lt: {
    annualExpenses: 'Metinės Išlaidos',
    expenseTimeline: 'Išlaidų Chronologija',
    revenue: 'Pajamos',
    saved: 'Sutaupyta',
    expenses: 'Išlaidos',
    topExpenses: 'Didžiausios Išlaidos',
    expenseRatio: 'Išlaidų Santykis',
    onTrack: 'Pagal Planą',
    overGoal: 'Viršyta Ribą',
    netIncome: 'Grynosios Pajamos',
    goal: 'Tikslas'
  }
};


// Helper function to get translated text
function t(key, lang = 'lt') {
  return translations[lang][key] || key;
}

// Icons using CSS and Unicode
const CalendarIcon = () => (
  <span style={{ fontSize: '24px' }}>📅</span>
);

const TrendingUpIcon = () => (
  <span style={{ 
    fontSize: '16px', 
    color: '#10b981',
    fontWeight: 'bold'
  }}>📈</span>
);

const TrendingDownIcon = () => (
  <span style={{ 
    fontSize: '16px', 
    color: '#ef4444',
    fontWeight: 'bold'
  }}>📉</span>
);

const MoneyIcon = () => (
  <span style={{ fontSize: '16px' }}>💰</span>
);

const ExpenseIcon = () => (
  <span style={{ fontSize: '16px' }}>💸</span>
);

const SavingsIcon = () => (
  <span style={{ fontSize: '16px' }}>🏦</span>
);

function TopExpensesList({ expenses }) {
  const listStyle = {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  };

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    fontSize: '12px'
  };

  const categoryStyle = {
    color: '#6b7280',
    fontWeight: '500'
  };

  const amountStyle = {
    color: '#111827',
    fontWeight: 'bold'
  };

  return (
    <div style={listStyle}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
        {t('topExpenses')}:
      </div>
      {expenses.slice(0, 4).map((expense, index) => (
        <div key={index} style={itemStyle}>
          <span style={categoryStyle}>{AccountsMap[expense.expenseName]}</span>
          <span style={amountStyle}>{formatCurrency(expense.expenseAmount)}</span>
        </div>
      ))}
      ...
    </div>
  );
}

function Tooltip({ totalExpenses, totalRevenue, netIncome, topExpenses, style }) {
  const tooltipContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0'
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  };

  const valueStyle = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#111827'
  };

  return (
    <div style={style}>
      <div style={tooltipContentStyle}>
        <div style={summaryRowStyle}>
          <span style={labelStyle}>{t('revenue')}:</span>
          <strong style={valueStyle}>{formatCurrency(totalRevenue)}</strong>
        </div>
        <div style={summaryRowStyle}>
          <span style={labelStyle}>{t('saved')}:</span>
          <strong style={{...valueStyle, color: netIncome >= 0 ? '#10b981' : '#ef4444'}}>
            {formatCurrency(netIncome)}
          </strong>
        </div>
        <div style={summaryRowStyle}>
          <span style={labelStyle}>{t('expenses')}:</span>
          <strong style={valueStyle}>{formatCurrency(totalExpenses)}</strong>
        </div>
        <TopExpensesList expenses={topExpenses} />
      </div>
    </div>
  );
}

function ExpenseBar({data, index, isHovered, onHover, onLeave }) {

  const { label, totalExpensePercentage, totalExpenseGoal, totalExpenses, totalRevenue, netIncome, topExpenses } = data;
  const isOverGoal = totalExpensePercentage > totalExpenseGoal;
  
  const barItemStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    position: 'relative',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    zIndex: isHovered ? 20 : 1
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  };

  const yearStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827'
  };

  const statusBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: isOverGoal ? '#fee2e2' : '#d1fae5',
    color: isOverGoal ? '#dc2626' : '#059669'
  };

  const progressContainerStyle = {
    marginBottom: '16px'
  };

  const progressLabelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const progressBarStyle = {
    width: '100%',
    height: '14px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative'
  };

  const progressFillStyle = {
    height: '100%',
    width: `${Math.min(totalExpensePercentage, 100)}%`,
    background: isOverGoal 
      ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
      : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    borderRadius: '6px',
    transition: 'width 0.6s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const goalLineStyle = {
    position: 'absolute',
    left: `${totalExpenseGoal}%`,
    top: '0',
    height: '100%',
    width: '2px',
    backgroundColor: '#6b7280',
    zIndex: 2
  };

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  };

  const metricCardStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center'
  };

  const metricIconStyle = {
    marginBottom: '4px'
  };

  const metricValueStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#111827'
  };

  const metricLabelStyle = {
    fontSize: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '2px'
  };

  const tooltipStyle = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '8px',
    zIndex: 99,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    fontSize: '12px'
  };

  return (
    <div 
      style={barItemStyle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onMouseMove={(e) => {
        if (isHovered) {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={yearStyle}>{label.toUpperCase()}</div>
        <div style={statusBadgeStyle}>
          {isOverGoal ? <TrendingDownIcon /> : <TrendingUpIcon />}
          <span>{isOverGoal ? t('overGoal') : t('onTrack')}</span>
        </div>
      </div>

      {/* Progress Section */}
      <div style={progressContainerStyle}>
        <div style={progressLabelStyle}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            {t('expenseRatio')}
          </span>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: isOverGoal ? '#ef4444' : '#10b981'
          }}>
            {totalExpensePercentage.toFixed(1)}%
          </span>
        </div>
        
        <div style={progressBarStyle}>
          <div style={progressFillStyle}>
            <span style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          {totalExpenseGoal <= 100 && (
            <div style={goalLineStyle}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: '#6b7280',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {t('goal')}: {totalExpenseGoal}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={metricsGridStyle}>
        <div style={metricCardStyle}>
          <div style={metricIconStyle}><MoneyIcon /></div>
          <div style={metricValueStyle}>{formatCurrency(totalRevenue)}</div>
          <div style={metricLabelStyle}>{t('revenue')}</div>
        </div>
        
        <div style={metricCardStyle}>
          <div style={metricIconStyle}><ExpenseIcon /></div>
          <div style={metricValueStyle}>{formatCurrency(totalExpenses)}</div>
         <div style={metricLabelStyle}>{t('expenses')}</div>
        </div>
        
        <div style={metricCardStyle}>
          <div style={metricIconStyle}><SavingsIcon /></div>
          <div style={{...metricValueStyle, color: netIncome >= 0 ? '#10b981' : '#ef4444'}}>
            {formatCurrency(netIncome)}
          </div>
           <div style={metricLabelStyle}>{t('netIncome')}</div>
        </div>
      </div>

      {/* Tooltip */}
      {isHovered && (
        <Tooltip
          totalExpenses={totalExpenses}
          totalRevenue={totalRevenue}
          netIncome={netIncome}
          topExpenses={topExpenses}
          style={tooltipStyle}
        />
      )}
    </div>
  );
}

export function ExpenseTimeline({ d = expensesDataSummary.default, date = null, onlyYtd = false }) {
  const [data, setData]     = useState(d);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setError(null);
    if (!date) {
      setData(d);
      return;
    }
    setLoading(true)

    loadProfitLoss(date)
      .then(raw => {
        const filtered = raw.filter(item =>
          item.Account !== 'Goal Net Worth' && item.Account !== 'Total'
        );
        setData(filtered);
      })
      .catch(err => {
        console.error(err);
        // 2) Fallback to the default "d" that you imported
        setData(d);
        setError(err);
      })
      .finally(() => {
        // 3) Always clear loading flag
        setLoading(false);
      });
  }, [date, d]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    const handler = (e) => setCanHover(e.matches);
  
    // set initial value
    setCanHover(mq.matches);
  
    // preferred modern API
    mq.addEventListener('change', handler);
  
    // cleanup
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, []);


  if (loading) return <div>Loading…</div>;
  if (!data || data.length === 0) return <div>No data to display</div>;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const containerStyle = {
    //backgroundColor: 'white',
    borderRadius: '16px',
    //boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    //border: '1px solid #f3f4f6',
    paddingTop: '24px',
    paddingRight: '0px',
    paddingLeft: '8px',
    //maxWidth: '800px',
    minWidth: '300px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0'
  };

  const timelineStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  return (
    <div style={containerStyle}>
       {/* Header */}
      <div style={headerStyle}>
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CalendarIcon />
        </div>
        <div>
          <h2 style={titleStyle}>{t('annualExpenses')}</h2>
          <p style={subtitleStyle}>{t('expenseTimeline')}{" "}{prettyDateLT(date)}</p>
        </div>
      </div>

      {/* Timeline */}
      <div style={timelineStyle}>
        {(onlyYtd ? data.filter(d => d.label === 'ytd') : data).map((yearData, index) => (
          <ExpenseBar
            key={yearData.label}
            data={yearData}
            index={index}
            isHovered={canHover && hoveredIndex === index}
            onHover={canHover ? () => setHoveredIndex(index) : undefined}
            onLeave={canHover ? () => setHoveredIndex(null) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default ExpenseTimeline;