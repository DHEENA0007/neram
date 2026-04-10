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
    <div className="min-h-screen flex items-center justify-center p-6 bg-yellow-50/20">
      <section className="glass-card w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="text-4xl font-black font-serif text-yellow-600 mb-6 tracking-tight">Neram</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500">Sign in to your account to manage your Pancha Pakshi schedules.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Username</span>
            <input
              className="input-field"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Password</span>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
              {error}
            </div>
          ) : null}

          <button 
            className="btn-primary w-full py-4 text-lg" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account? <span className="text-yellow-600 font-bold cursor-not-allowed">Contact Admin</span>
        </p>
      </section>
    </div>
  );
}

