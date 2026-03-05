import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getTimezone } from '../api/client';
import Header from '../components/Header';
import './History.css';

const History = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [period]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await api.getHistory(period, getTimezone());
      setData(result);
    } catch (err) {
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStreak = () => {
    if (!data || data.stats.length === 0) return 0;
    let streak = 0;
    const sorted = [...data.stats].reverse();
    for (const day of sorted) {
      if (day.goalMet) streak++;
      else break;
    }
    return streak;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)';
    if (percentage >= 75) return 'linear-gradient(90deg, #A8E6CF 0%, #88D8B0 100%)';
    if (percentage >= 50) return 'linear-gradient(90deg, #FFD54F 0%, #FFC107 100%)';
    return 'linear-gradient(90deg, #FFB4B4 0%, #FF8A80 100%)';
  };

  return (
    <div className="history-page">
      <Header userName={user?.name} />

      <main className="history-content">
        <div className="period-tabs">
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              className={`period-tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="history-loading">
            <div className="loading-spinner"></div>
            <p>Loading history...</p>
          </div>
        ) : data ? (
          <>
            <div className="summary-cards">
              <div className="summary-card highlight">
                <div className="card-icon">💧</div>
                <span className="stat-value">{data.summary.averageOz}</span>
                <span className="stat-label">avg oz/day</span>
              </div>
              <div className="summary-card">
                <div className="card-icon">🎯</div>
                <span className="stat-value">{data.summary.daysGoalMet}/{data.summary.totalDays}</span>
                <span className="stat-label">goals met</span>
              </div>
              <div className="summary-card">
                <div className="card-icon">🔥</div>
                <span className="stat-value">{getStreak()}</span>
                <span className="stat-label">day streak</span>
              </div>
            </div>

            {data.summary.daysGoalMet > 0 && (
              <div className="motivation-banner">
                {data.summary.daysGoalMet === data.summary.totalDays ? (
                  <>🏆 Perfect record! You've hit your goal every day!</>
                ) : getStreak() >= 3 ? (
                  <>🔥 You're on fire! {getStreak()} day streak!</>
                ) : (
                  <>💪 Keep it up! You're building healthy habits!</>
                )}
              </div>
            )}

            <h3 className="section-title">Daily Breakdown</h3>

            <div className="history-list">
              {data.stats.length === 0 ? (
                <div className="history-empty">
                  <div className="empty-icon">📊</div>
                  <p>No data for this period</p>
                  <span>Start logging drinks to see your history</span>
                </div>
              ) : (
                data.stats.slice().reverse().map((day, index) => (
                  <div
                    key={day.date}
                    className={`history-day ${day.goalMet ? 'goal-met' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="day-header">
                      <div className="day-info">
                        <span className="day-date">{formatDate(day.date)}</span>
                        <span className="day-drinks">
                          {day.logs.length} drink{day.logs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="day-status">
                        {day.goalMet ? (
                          <span className="status-badge success">✓ Goal Met</span>
                        ) : (
                          <span className="status-badge">{day.percentage}%</span>
                        )}
                      </div>
                    </div>

                    <div className="day-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, day.percentage)}%`,
                            background: getProgressColor(day.percentage)
                          }}
                        />
                      </div>
                      <span className={`day-total ${day.goalMet ? 'met' : ''}`}>
                        {day.totalOz} oz
                      </span>
                    </div>

                    {Object.keys(day.byCategory).length > 0 && (
                      <div className="day-categories">
                        {Object.entries(day.byCategory).map(([cat, oz]) => (
                          <span key={cat} className="category-tag">
                            {getCategoryIcon(cat)} {oz}oz
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

const getCategoryIcon = (type) => {
  const icons = {
    water: '💧',
    coffee: '☕',
    tea: '🍵',
    soda: '🥤',
    energy: '⚡',
    milk: '🥛',
    juice: '🧃'
  };
  return icons[type] || '🥤';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export default History;
