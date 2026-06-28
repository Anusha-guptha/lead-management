import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.js';

export default function AppLayout({ title, subtitle, actions, children }) {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout request failed; clearing local session.', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-frame">
      <header className="global-bar">
        <div className="brand-lockup">
          <span className="brand-symbol">CG</span>
          <div>
            <strong>Confident CRM</strong>
            <small>Pipeline console</small>
          </div>
        </div>

        <nav className="top-nav" aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/leads" className={({ isActive }) => (isActive ? 'active' : '')}>Leads</NavLink>
        </nav>

        <div className="account-area">
          <div className="avatar-chip" title={username}>{username.slice(0, 1).toUpperCase()}</div>
          <button className="btn ghost" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="page-wrap">
        <section className="page-head">
          <div>
            <p className="kicker">Workspace</p>
            <h1>{title}</h1>
            {subtitle && <p className="page-copy">{subtitle}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </section>

        {children}
      </main>
    </div>
  );
}
