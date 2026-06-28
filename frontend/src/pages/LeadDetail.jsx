import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { addNote, deleteNote, getLead, getNotes, updateLead, updateNote } from '../api/leads.js';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((item) => [item.value, item.label]));

export default function LeadDetail() {
  const { id } = useParams();
  const currentUsername = localStorage.getItem('username');
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const load = async () => {
    setError('');
    try {
      const [leadResponse, notesResponse] = await Promise.all([getLead(id), getNotes(id)]);
      setLead(leadResponse.data);
      setNotes(notesResponse.data.results || notesResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load lead details.');
    }
  };

  useEffect(() => {
    load();
  }, [id]);


  useEffect(() => {
    if (!openMenu) return undefined;

    const closeMenu = (event) => {
      if (event.target.closest('.note-menu') || event.target.closest('.note-menu-trigger')) return;
      setOpenMenu(null);
    };

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnEscape, true);

    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', closeOnEscape, true);
    };
  }, [openMenu]);
  const handleStatusChange = async (event) => {
    setSavingStatus(true);
    setError('');
    try {
      const response = await updateLead(id, { status: event.target.value });
      setLead(response.data);
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    setError('');
    try {
      await addNote(id, noteText.trim());
      setNoteText('');
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSavingNote(false);
    }
  };

  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
    setOpenMenu(null);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingContent.trim()) return;
    setError('');
    try {
      await updateNote(noteId, editingContent.trim());
      cancelEdit();
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const toggleNoteMenu = (note, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 122;
    const menuHeight = 86;
    const gap = 8;
    const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, rect.right - menuWidth));
    const hasSpaceBelow = window.innerHeight - rect.bottom > menuHeight + gap + 12;
    const top = hasSpaceBelow ? rect.bottom + gap : Math.max(12, rect.top - menuHeight - gap);
    setOpenMenu((current) => (current?.id === note.id ? null : { id: note.id, note, top, left }));
  };

  const handleDeleteNote = async (noteId) => {
    setOpenMenu(null);
    if (!window.confirm('Delete this note?')) return;
    setError('');
    try {
      await deleteNote(noteId);
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  if (!lead) {
    return (
      <AppLayout title="Lead Detail" subtitle="Loading lead record...">
        <div className="panel detail-loading">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={lead.name}
      subtitle={lead.company || lead.email}
      actions={<Link className="btn ghost" to="/leads">Back to leads</Link>}
    >
      {error && <div className="notice error">{error}</div>}

      <section className="detail-grid">
        <article className="panel detail-card">
          <div className="panel-heading split">
            <div>
              <p className="section-label">Lead record</p>
              <h2>Contact Profile</h2>
            </div>
            <span className={`status-badge ${lead.status}`}>{STATUS_LABELS[lead.status] || lead.status}</span>
          </div>

          <div className="detail-fields">
            <div><span>Email</span><strong>{lead.email}</strong></div>
            <div><span>Phone</span><strong>{lead.phone || '-'}</strong></div>
            <div><span>Company</span><strong>{lead.company || '-'}</strong></div>
            <div><span>Owner</span><strong>{lead.owner_name || 'Unassigned'}</strong></div>
          </div>
        </article>

        <aside className="panel status-card">
          <div className="panel-heading">
            <h2>Status</h2>
            <p>Update where this lead sits in the pipeline.</p>
          </div>
          <div className="status-edit">
            <label>
              Lead status
              <select value={lead.status} onChange={handleStatusChange} disabled={savingStatus}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            {savingStatus && <p className="muted">Saving status...</p>}
          </div>
        </aside>
      </section>

      <section className="panel notes-panel">
        <div className="panel-heading split">
          <div>
            <h2>Notes</h2>
            <p>{notes.length} saved notes for this lead.</p>
          </div>
        </div>

        <form className="note-form" onSubmit={handleAddNote}>
          <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Add a follow-up note..." rows={3} />
          <button className="btn primary" type="submit" disabled={savingNote || !noteText.trim()}>
            {savingNote ? 'Adding...' : 'Add note'}
          </button>
        </form>

        <div className="note-list">
          {notes.map((note) => {
            const canManage = note.author_name === currentUsername;
            const isEditing = editingNoteId === note.id;

            return (
              <article className="note-item note-card" key={note.id}>
                <div className="note-card-head">
                  <div className="note-meta">
                    <strong>{note.author_name}</strong>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  {canManage && (
                    <button
                      className="note-menu-trigger"
                      type="button"
                      aria-label="Note actions"
                      aria-expanded={openMenu?.id === note.id}
                      onClick={(event) => toggleNoteMenu(note, event)}
                    >
                      ⋮
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="note-edit-box">
                    <textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} rows={3} />
                    <div className="note-edit-actions">
                      <button className="btn ghost" type="button" onClick={cancelEdit}>Cancel</button>
                      <button className="btn primary" type="button" onClick={() => handleUpdateNote(note.id)} disabled={!editingContent.trim()}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p>{note.content}</p>
                )}
              </article>
            );
          })}
          {notes.length === 0 && <p className="empty-state">No notes yet.</p>}
        </div>
      </section>

      {openMenu && (
        <div className="note-menu floating" style={{ top: openMenu.top, left: openMenu.left }}>
          <button type="button" onClick={() => startEdit(openMenu.note)}>Edit</button>
          <button className="danger" type="button" onClick={() => handleDeleteNote(openMenu.note.id)}>Delete</button>
        </div>
      )}
    </AppLayout>
  );
}



