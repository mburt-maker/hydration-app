import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Header from '../components/Header';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [goal, setGoal] = useState(user?.hydration_goal_oz || 64);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const updatedUser = await api.updateMe({
        name: name.trim() || null,
        hydration_goal_oz: goal
      });
      updateUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="settings-page">
      <Header userName={user?.name} />

      <main className="settings-content">
        <h2>Settings</h2>

        <div className="settings-section">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="settings-input"
          />
        </div>

        <div className="settings-section">
          <label>Daily Hydration Goal</label>
          <div className="goal-editor">
            <input
              type="range"
              min="32"
              max="150"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="goal-slider"
            />
            <div className="goal-display">
              <span className="goal-value">{goal}</span>
              <span className="goal-unit">oz</span>
            </div>
          </div>
          <div className="goal-presets">
            {[48, 64, 80, 100, 128].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`goal-preset ${goal === preset ? 'active' : ''}`}
                onClick={() => setGoal(preset)}
              >
                {preset}oz
              </button>
            ))}
          </div>
        </div>

        {error && <div className="settings-error">{error}</div>}

        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>

        <hr className="settings-divider" />

        <div className="settings-section">
          <label>Account</label>
          <p className="account-email">{user?.email}</p>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
