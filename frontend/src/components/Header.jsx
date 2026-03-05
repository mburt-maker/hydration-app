import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>💧 Hydration</h1>
          {userName && <span className="header-greeting">Hi, {userName}</span>}
        </div>
        <nav className="header-nav">
          <button
            className={`nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Today
          </button>
          <button
            className={`nav-button ${location.pathname === '/history' ? 'active' : ''}`}
            onClick={() => navigate('/history')}
          >
            History
          </button>
          <button
            className={`nav-button ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            ⚙️
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
