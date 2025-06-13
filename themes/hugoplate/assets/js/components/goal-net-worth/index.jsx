import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { formatCurrency } from '../../utils';

const translations = {
  en: {
    goalTitle: "Net Worth Goal",
    goalSubtitle: "Net Worth Goal Progress",
    achieved: "Achieved",
    inProgress: "In Progress",
    accumulated: "Accumulated (Current)",
    goal: "Goal",
    remaining: "Remaining",
    exceeded: "Exceeded by",
    progressToGoal: "Progress to Goal",
    complete: "Complete"
  },
  lt: {
    goalTitle: "Kapitalo Tikslas",
    goalSubtitle: "Grynojo turto tikslo progresas",
    achieved: "Pasiektas",
    inProgress: "Vykdomas",
    accumulated: "Sukaupta (Dabartinė)",
    goal: "Tikslas",
    remaining: "Liko",
    exceeded: "Viršyta",
    progressToGoal: "Progresas link tikslo",
    complete: "Užbaigta"
  }
};

const t = (key, lang = 'lt') => translations[lang][key] || key;

// Custom donut chart component using SVG
function DonutChart({ percentage, size = 160 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out'
          }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center text */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#111827',
          lineHeight: '1'
        }}>
          {percentage.toFixed(1)}%
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {t('complete')}
        </div>
      </div>
    </div>
  );
}

// Icons using CSS and Unicode
const TargetIcon = () => (
  <span style={{ 
    fontSize: '24px',
    color: '#4f46e5'
  }}>🎯</span>
);

const TrendingUpIcon = () => (
  <span style={{ 
    fontSize: '18px', 
    color: '#10b981',
    fontWeight: 'bold'
  }}>📈</span>
);

const MoneyIcon = () => (
  <span style={{ fontSize: '18px' }}>💰</span>
);

export function GoalNetWorth({ data }) {
  const goalAchievedPercentage = data.goalPerformance.goalAchievedPercentage;
  const currentValue = data.growth.currentValueMinusLiabilities;
  const goalValue = data.Goal;
  const remainingAmount = data.goalPerformance.requiredValue;
  const isGoalAchieved = goalAchievedPercentage >= 100;

  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f3f4f6',
    padding: '32px',
    transition: 'all 0.3s ease'
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

  const contentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  };

  const chartContainerStyle = {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const infoContainerStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const metricCardStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '13px',
    border: '1px solid #e5e7eb'
  };

  const metricHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'px',
    marginBottom: '8px'
  };

  const metricLabelStyle = {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  };

  const metricValueStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827'
  };

  const progressBarContainerStyle = {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  };

  const progressBarStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '12px'
  };

  const progressFillStyle = {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    borderRadius: '4px',
    width: `${Math.min(goalAchievedPercentage, 100)}%`,
    transition: 'width 1s ease-in-out'
  };

  const statusBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: isGoalAchieved ? '#d1fae5' : '#fef3c7',
    color: isGoalAchieved ? '#065f46' : '#92400e'
  };

  return (
    <div 
      style={containerStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
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
          <TargetIcon />
        </div>
        <div>
          <h2 style={titleStyle}>{t('goalTitle')}</h2>
          <p style={subtitleStyle}>{t('goalSubtitle')}</p>
        </div>
        <div style={statusBadgeStyle}>
          <span>{isGoalAchieved ? '✅' : '⏳'}</span>
          {isGoalAchieved ? t('achieved') : t('inProgress')}
        </div>
      </div>

      {/* Main content */}
      <div style={contentStyle}>
        {/* Chart */}
        <div style={chartContainerStyle}>
          <DonutChart percentage={goalAchievedPercentage} />
        </div>

        {/* Info cards */}
        <div style={infoContainerStyle}>
          <div style={metricCardStyle}>
            <div style={metricHeaderStyle}>
              <MoneyIcon />
              <span style={metricLabelStyle}>{t('accumulated')}</span>
            </div>
            <div style={metricValueStyle}>
              {formatCurrency(currentValue)}
            </div>
          </div>

          <div style={metricCardStyle}>
            <div style={metricHeaderStyle}>
              <TargetIcon />
              <span style={metricLabelStyle}>{t('goal')}</span>
            </div>
            <div style={metricValueStyle}>
              {formatCurrency(goalValue)}
            </div>
          </div>

          <div style={metricCardStyle}>
            <div style={metricHeaderStyle}>
              <TrendingUpIcon />
              <span style={metricLabelStyle}>
                {isGoalAchieved ? t('exceeded') : t('remaining')}
              </span>
            </div>
            <div style={{
              ...metricValueStyle,
              color: isGoalAchieved ? '#10b981' : '#6b7280'
            }}>
              {isGoalAchieved ? '+' : ''}{formatCurrency(Math.abs(remainingAmount))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            {t('progressToGoal')}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
            {goalAchievedPercentage.toFixed(1)}%
          </span>
        </div>
        <div style={progressBarStyle}>
          <div style={progressFillStyle}></div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>{formatCurrency(currentValue)}</span>
          <span>{formatCurrency(goalValue)}</span>
        </div>
      </div>
    </div>
  );
}

export default GoalNetWorth;