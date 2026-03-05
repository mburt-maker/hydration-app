import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(64);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await api.completeOnboarding({
        name: name.trim() || null,
        hydration_goal_oz: goal
      });
      updateUser(userData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-icon">👋</div>
        <h1>Welcome!</h1>
        <p className="onboarding-subtitle">Let's set up your hydration goals</p>

        <form onSubmit={handleSubmit}>
          <div className="onboarding-field">
            <label>Your name (optional)</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="onboarding-input"
              disabled={loading}
            />
          </div>

          <div className="onboarding-field">
            <label>Daily hydration goal</label>
            <div className="goal-selector">
              <input
                type="range"
                min="32"
                max="150"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="goal-slider"
                disabled={loading}
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
                  disabled={loading}
                >
                  {preset}oz
                </button>
              ))}
            </div>
          </div>

          {error && <p className="onboarding-error">{error}</p>}

          <button
            type="submit"
            className="onboarding-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Start Tracking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
