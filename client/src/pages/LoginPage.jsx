import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <section className="login-hero">
        <p className="eyebrow">Neram workstation</p>
        <h1>Admin and user portals for Panchapakshi scheduling.</h1>
        <p>
          Add users from the admin portal, let them sign in securely, then generate sunrise-based
          day and night tables for any place in the world.
        </p>

        <div className="login-points">
          <div>
            <strong>No axios</strong>
            <span>All network calls use `fetch`.</span>
          </div>
          <div>
            <strong>Live location search</strong>
            <span>Places come from Open-Meteo geocoding.</span>
          </div>
          <div>
            <strong>Sun + moon aware</strong>
            <span>Sunrise/sunset and paksha are computed per day.</span>
          </div>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-top">
          <p className="eyebrow">Sign in</p>
          <h2>Access your portal</h2>
          <p>Default admin credentials are `admin` / `admin123` until you create your own users.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              className="text-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="text-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Enter portal'}
          </button>
        </form>
      </section>
    </div>
  );
}

