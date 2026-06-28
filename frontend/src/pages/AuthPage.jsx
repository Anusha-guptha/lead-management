import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth.js';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const getErrorMessage = (err) => {
    const data = err.response?.data;
    if (!data) return 'Backend is not reachable.';
    if (typeof data === 'string') return data;
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join(' | ');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = isLogin
        ? await login(form.username, form.password)
        : await register(form.username, form.email, form.password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username || form.username);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signin-view simple-auth">
      <form className="signin-card auth-only-card" onSubmit={handleSubmit}>
        <div className="form-title">
          <p className="kicker">Confident CRM</p>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
        </div>

        <div className="pill-switch">
          <button className={isLogin ? 'active' : ''} type="button" onClick={() => setMode('login')}>Login</button>
          <button className={!isLogin ? 'active' : ''} type="button" onClick={() => setMode('register')}>Register</button>
        </div>

        <label>
          Username
          <input value={form.username} onChange={(event) => updateField('username', event.target.value)} required />
        </label>

        {!isLogin && (
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
          </label>
        )}

        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} minLength={6} required />
        </label>

        {error && <div className="notice error">{error}</div>}

        <button className="btn primary full" type="submit" disabled={loading}>
          {loading ? 'Working...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>
    </main>
  );
}
