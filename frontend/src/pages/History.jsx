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
          <div className="history-loading">Loading...</div>
        ) : data ? (
          <>
            <div className="summary-card">
              <div className="summary-stat">
                <span className="stat-value">{data.summary.averageOz}</span>
                <span className="stat-label">avg oz/day</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">{data.summary.daysGoalMet}</span>
                <span className="stat-label">goals met</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">{data.summary.totalDays}</span>
                <span className="stat-label">days tracked</span>
              </div>
            </div>

            <div className="history-list">
              {data.stats.length === 0 ? (
                <div className="history-empty">
                  No data for this period
                </div>
              ) : (
                data.stats.slice().reverse().map((day) => (
                  <div key={day.date} className="history-day">
                    <div className="day-info">
                      <span className="day-date">{formatDate(day.date)}</span>
                      <span className="day-drinks">
                        {day.logs.length} drink{day.logs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="day-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(100, day.percentage)}%` }}
                        />
                      </div>
                      <span className={`day-total ${day.goalMet ? 'met' : ''}`}>
                        {day.totalOz}oz
                      </span>
                    </div>
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
