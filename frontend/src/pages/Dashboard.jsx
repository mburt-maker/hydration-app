import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getTimezone } from '../api/client';
import Header from '../components/Header';
import HydrationRing from '../components/HydrationRing';
import BeverageLogger from '../components/BeverageLogger';
import BeverageList from '../components/BeverageList';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const result = await api.getTodayLogs(getTimezone());
      setData(result);
      setError('');
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLog = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Header userName={user?.name} />
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header userName={user?.name} />

      <main className="dashboard-content">
        {error && <div className="dashboard-error">{error}</div>}

        <div className="ring-container">
          <HydrationRing
            percentage={data?.percentage || 0}
            totalOz={data?.totalOz || 0}
            goal={data?.goal || user?.hydration_goal_oz || 64}
          />
        </div>

        <button
          className="add-drink-button"
          onClick={() => setShowLogger(true)}
        >
          <span className="add-icon">+</span>
          Add Drink
        </button>

        <BeverageList logs={data?.logs} onUpdate={loadData} />
      </main>

      {showLogger && (
        <BeverageLogger
          onClose={() => setShowLogger(false)}
          onLog={handleLog}
        />
      )}
    </div>
  );
};

export default Dashboard;
