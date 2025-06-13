import { h } from 'preact';
import { useState } from 'preact/hooks';
import { formatCurrency } from '../../utils';
import currency from 'currency.js';

const translations = {
  en: {
    portfolio: 'Investment Portfolio',
    totalValue: 'Total Value',
    totalGainLoss: 'Total Gain/Loss',
    totalROI: 'Total ROI',
    liquidity: 'Liquidity',
    unusedFunds: 'Unused Funds',
    shares: 'Shares',
    currentPrice: 'Current Price',
    costBasis: 'Cost Basis',
    positionValue: 'Position Value',
    totalGain: 'Total Gain/Loss'
  },
  lt: {
    portfolio: 'Investicijų portfelis',
    totalValue: 'Bendra vertė',
    totalGainLoss: 'Visas pelnas/nuostolis',
    totalROI: 'Visas ROI',
    liquidity: 'Likvidumas',
    unusedFunds: 'Nepanaudotos lėšos',
    shares: 'Akcijos',
    currentPrice: 'Dabartinė kaina',
    costBasis: 'Pirkimo kaina',
    positionValue: 'Pozicijos vertė',
    totalGain: 'Visas pelnas/nuostolis'
  }
};

const t = (key, lang = 'lt') => translations[lang][key] || key;

const TrendingUpIcon = () => (
  <span style={{ 
    fontSize: '18px', 
    color: '#10b981',
    fontWeight: 'bold',
    transform: 'rotate(-45deg)',
    display: 'inline-block'
  }}>↗</span>
);

const TrendingDownIcon = () => (
  <span style={{ 
    fontSize: '18px', 
    color: '#ef4444',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
    display: 'inline-block'
  }}>↘</span>
);

const DollarIcon = () => (
  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>$</span>
);

const WalletIcon = () => (
  <span style={{ fontSize: '20px' }}>💰</span>
);

const ChartIcon = () => (
  <span style={{ fontSize: '24px' }}>📊</span>
);

const getStockIcon = (symbol) => {
  const colors = {
    'NOVd': '#4b5563',         // Gray
    'AAPL': '#1f2937',         // Dark gray (Apple, as requested)
    'AMZN': '#f59e0b',         // Amber
    'BRK B': '#10b981',        // Emerald green
    'GOOG': '#2563eb',         // Blue (as requested)
    'INTC': '#6366f1',         // Indigo
    'TSLA': '#dc2626',         // Red (as requested)
    'UNH': '#0e7490',          // Cyan
    '4GLDd': '#8b5cf6',        // Violet
    'VWCE': '#16a34a',         // Green
    'WDEF': '#eab308',         // Yellow
    '00B3L1057': '#000000'     // Black (as requested)
  };
  
  const iconStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: colors[symbol] || '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
  };
  
  return (
    <div style={iconStyle}>
      {symbol.slice(0, 2)}
    </div>
  );
};

function StockCard({ position }) {
  const roi = ((position.livePrice - position.costBasisPrice) / position.costBasisPrice) * 100;
  const isPositive = roi >= 0;
  const totalGainLoss = (position.livePrice - position.costBasisPrice) * position.position;

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f3f4f6',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  };

  const stockInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const roiStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: isPositive ? '#10b981' : '#ef4444',
    textAlign: 'right'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  };

  const metricBoxStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '12px'
  };

  const metricLabelStyle = {
    fontSize: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  };

  const metricValueStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827'
  };

  const detailRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const gainLossStyle = {
    ...detailRowStyle,
    paddingTop: '8px',
    borderTop: '1px solid #e5e7eb',
    marginBottom: '0'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        e.target.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <div style={headerStyle}>
        <div style={stockInfoStyle}>
          {getStockIcon(position.symbol)}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
              {position.symbol}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
              {position.companyName}
            </p>
          </div>
        </div>
        <div style={roiStyle}>
          {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
            {roi.toFixed(2)}%
          </span>
        </div>
      </div>

      <div style={gridStyle}>
        <div style={metricBoxStyle}>
          <p style={metricLabelStyle}>{t('shares')}</p>
          <p style={metricValueStyle}>{position.position}</p>
        </div>
        <div style={metricBoxStyle}>
          <p style={metricLabelStyle}>{t('currentPrice')}</p>
          <p style={metricValueStyle}>
            {formatCurrency(position.livePrice, position.currency)}
          </p>
        </div>
      </div>

      <div>
        <div style={detailRowStyle}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('costBasis')}</span>
          <span style={{ fontWeight: '500' }}>
            {formatCurrency(position.costBasisPrice, position.currency)}
          </span>
        </div>
        <div style={detailRowStyle}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('positionValue')}</span>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
            {formatCurrency(position.positionValue, position.currency)}
          </span>
        </div>
        <div style={gainLossStyle}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{t('totalGain')}</span>
          <span style={{ 
            fontWeight: 'bold', 
            color: isPositive ? '#10b981' : '#ef4444' 
          }}>
            {isPositive ? '+' : ''}{formatCurrency(totalGainLoss, position.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CashCard({ report }) {
  const cardStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    color: 'white'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  };

  const iconBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={iconBoxStyle}>
          <WalletIcon />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              {t('liquidity')}
            </h3>
            <p style={{ color: '#bfdbfe', fontSize: '14px', margin: '0' }}>
              {report.currency}
            </p>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
        {formatCurrency(report.endingCash, report.currency)}
      </div>
      <div style={{ color: '#bfdbfe', fontSize: '14px' }}>
        {t('unusedFunds')}
      </div>
    </div>
  );
}

function PortfolioSummary({ accData, positions }) {
  const totalPortfolio = accData.growth.currentValue;

  const summaryStyle = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    color: 'white',
    marginBottom: '32px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  };

  const iconBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px'
  };

  const metricBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px'
  };

  const metricHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  };

  return (
    <div style={summaryStyle}>
      <div style={headerStyle}>
        <div style={iconBoxStyle}>
          <ChartIcon />
        </div>
        <div>
          <p style={{ color: '#c7d2fe', margin: '0' }}>{t('portfolio')}</p>
        </div>
      </div>

      <div style={gridStyle}>
        <div style={metricBoxStyle}>
          <div style={metricHeaderStyle}>
            <DollarIcon />
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('totalValue')}
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {formatCurrency(totalPortfolio)}
          </div>
        </div>

        <div style={metricBoxStyle}>
          <div style={metricHeaderStyle}>
            {accData.growth.profit >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('totalGainLoss')}
            </span>
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: accData.growth.profit >= 0 ? '#86efac' : '#fca5a5'
          }}>
            {accData.growth.profit >= 0 ? '+' : ''}{formatCurrency(accData.growth.profit)}
          </div>
        </div>

        <div style={metricBoxStyle}>
          <div style={metricHeaderStyle}>
            <span style={{ fontSize: '20px' }}>👁</span>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('totalROI')}
            </span>
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: accData.growth.roi >= 0 ? '#86efac' : '#fca5a5'
          }}>
            {accData.growth.roi.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export function Stocks({ accData, openPositions }) {
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: 'transparent',
    paddingTop: '16px'
  };

  const maxWidthStyle = {
    maxWidth: '1280px',
    margin: '0 auto'
  };

  const stocksGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  const cashGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  };

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        <PortfolioSummary accData={accData} positions={openPositions} />
        
        <div style={stocksGridStyle}>
          {openPositions.map((position, index) => (
            <StockCard key={index} position={position} />
          ))}
        </div>

        <div style={cashGridStyle}>
          {[{ endingCash: accData.growth.accountsUnusedCashEur, currency: 'EUR' }, { endingCash: accData.growth.accountsUnusedCashUsd, currency: 'USD' }].map((report, index) => (
            <CashCard key={index} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stocks;