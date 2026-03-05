import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Login.css';

const VerifyAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid link');
      setVerifying(false);
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token) => {
    try {
      const { token: sessionToken, user, isNewUser } = await api.verifyToken(token);
      login(sessionToken, user, isNewUser);

      if (isNewUser) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Link expired or invalid');
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">⏳</div>
          <h1>Signing you in...</h1>
          <p className="login-subtitle">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">❌</div>
        <h1>Link Invalid</h1>
        <p className="login-subtitle">{error}</p>
        <p className="login-hint">
          This link may have expired or already been used.
        </p>
        <button
          className="login-button"
          onClick={() => navigate('/login', { replace: true })}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyAuth;
