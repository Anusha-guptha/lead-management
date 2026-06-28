import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { getDashboard } from '../api/leads.js';

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_ORDER = ['new', 'contacted', 'won', 'lost'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDashboard()
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.detail || 'Unable to load dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
    data?.by_status?.forEach((item) => {
      counts[item.status] = item.count;
    });
    return counts;
  }, [data]);

  const won = statusCounts.won || 0;
  const lost = statusCounts.lost || 0;
  const activePipeline = (data?.total_leads || 0) - won - lost;

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Pipeline summary and recent movement."
    >
      {error && <div className="notice error">{error}</div>}

      <section className="kpi-strip" aria-label="Pipeline summary">
        <article className="kpi-card total">
          <span>Total leads</span>
          <strong>{loading ? '-' : data?.total_leads || 0}</strong>
        </article>
        <article className="kpi-card blue">
          <span>Active pipeline</span>
          <strong>{loading ? '-' : activePipeline}</strong>
        </article>
        <article className="kpi-card green">
          <span>Won</span>
          <strong>{loading ? '-' : won}</strong>
        </article>
        <article className="kpi-card red">
          <span>Lost</span>
          <strong>{loading ? '-' : lost}</strong>
        </article>
      </section>

      <section className="overview-grid">
        <div className="panel status-panel">
          <div className="panel-heading">
            <h2>Status Overview</h2>
            <p>Lead distribution across the sales process.</p>
          </div>
          <div className="status-list">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] || 0;
              const percent = data?.total_leads ? Math.round((count / data.total_leads) * 100) : 0;
              return (
                <div className="status-row" key={status}>
                  <div>
                    <span className={`status-dot ${status}`}></span>
                    <strong>{STATUS_LABELS[status]}</strong>
                  </div>
                  <div className="status-meter" aria-label={`${STATUS_LABELS[status]} ${percent}%`}>
                    <span style={{ width: `${percent}%` }}></span>
                  </div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel recent-panel">
          <div className="panel-heading split">
            <div>
              <h2>Recent Leads</h2>
              <p>Latest records added to the CRM.</p>
            </div>
            <Link to="/leads">View all</Link>
          </div>
          <div className="compact-table">
            {loading && <p className="muted">Loading recent leads...</p>}
            {!loading && data?.recent_leads?.length === 0 && <p className="muted">No leads yet.</p>}
            {data?.recent_leads?.map((lead) => (
              <div className="compact-row" key={lead.id}>
                <div>
                  <strong>{lead.name}</strong>
                  <span>{lead.company || lead.email}</span>
                </div>
                <span className={`status-badge ${lead.status}`}>{STATUS_LABELS[lead.status] || lead.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}




