import { useState } from 'react';
import { api, getTimezone } from '../api/client';
import './BeverageList.css';

const BeverageList = ({ logs, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (deleting) return;
    setDeleting(id);

    try {
      await api.deleteLog(id, getTimezone());
      onUpdate();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="beverage-list-empty">
        <p>No drinks logged today</p>
        <p className="hint">Tap the + button to add your first drink</p>
      </div>
    );
  }

  return (
    <div className="beverage-list">
      <h3>Today's Drinks</h3>
      <div className="log-items">
        {logs.map((log) => (
          <div key={log.id} className="log-item">
            <div className="log-icon">{getCategoryIcon(log.beverage_type)}</div>
            <div className="log-details">
              <div className="log-name">{log.beverage_subtype}</div>
              <div className="log-meta">
                {log.volume_oz}oz • {formatTime(log.logged_at)}
              </div>
            </div>
            <button
              className="log-delete"
              onClick={() => handleDelete(log.id)}
              disabled={deleting === log.id}
            >
              {deleting === log.id ? '...' : '×'}
            </button>
          </div>
        ))}
      </div>
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

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default BeverageList;
