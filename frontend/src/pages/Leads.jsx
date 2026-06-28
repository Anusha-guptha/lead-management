import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { createLead, getLeads } from '../api/leads.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
};

const EMPTY_FORM = { name: '', email: '', phone: '', company: '' };

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeads = async (next = {}) => {
    setLoading(true);
    setError('');
    const query = {
      search: next.search ?? search,
      status: next.status ?? status,
    };

    Object.keys(query).forEach((key) => {
      if (!query[key]) delete query[key];
    });

    try {
      const response = await getLeads(query);
      setLeads(response.data.results || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads({ search: '', status: '' });
  }, []);

  const counts = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.total += 1;
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      { total: 0 },
    );
  }, [leads]);

  const handleStatusChange = (value) => {
    setStatus(value);
    fetchLeads({ status: value });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchLeads({ search });
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createLead(form);
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
      await fetchLeads();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Unable to create lead.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="Lead Management"
      subtitle="Manage pipeline records and intake."
      actions={<button className="btn primary" type="button" onClick={() => setIsModalOpen(true)}>+ Add Lead</button>}
    >
      <section className="toolbar-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads"
            aria-label="Search leads"
          />
          <button className="btn primary" type="submit">Search</button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setSearch('');
              fetchLeads({ search: '' });
            }}
          >
            Clear
          </button>
        </form>

        <div className="status-tabs" aria-label="Lead status filters">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value || 'all'}
              className={status === option.value ? 'active' : ''}
              type="button"
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="notice error">{error}</div>}

      <section className="lead-layout list-only">
        <div className="panel lead-table-panel">
          <div className="panel-heading split">
            <div>
              <h2>Leads</h2>
              <p>{loading ? 'Loading leads...' : `${leads.length} visible records`}</p>
            </div>
            <span className="count-pill">{counts.total} total</span>
          </div>

          <div className="lead-table" role="table" aria-label="Leads table">
            <div className="lead-table-head" role="row">
              <span>Name</span>
              <span>Company</span>
              <span>Contact</span>
              <span>Status</span>
              <span>Notes</span>
            </div>
            {leads.map((lead) => (
              <button className="lead-table-row clickable" role="row" key={lead.id} type="button" onClick={() => navigate(`/leads/${lead.id}`)}>
                <div>
                  <strong>{lead.name}</strong>
                  <small>Owner: {lead.owner_name || 'Unassigned'}</small>
                </div>
                <span>{lead.company || '-'}</span>
                <div>
                  <span>{lead.email}</span>
                  <small>{lead.phone || 'No phone'}</small>
                </div>
                <span className={`status-badge ${lead.status}`}>{STATUS_LABELS[lead.status] || lead.status}</span>
                <span>{lead.notes?.length || 0}</span>
              </button>
            ))}
            {!loading && leads.length === 0 && <div className="empty-state">No leads match this view.</div>}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-lead-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="section-label">New record</p>
                <h2 id="add-lead-title">Add Lead</h2>
              </div>
              <button className="icon-button" type="button" onClick={closeModal} aria-label="Close add lead form">×</button>
            </div>
            <form className="stacked-form modal-form" onSubmit={handleCreate}>
              <label>
                Name
                <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} autoFocus required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
              </label>
              <label>
                Company
                <input value={form.company} onChange={(event) => updateForm('company', event.target.value)} />
              </label>
              <div className="modal-actions">
                <button className="btn ghost" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add lead'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AppLayout>
  );
}



