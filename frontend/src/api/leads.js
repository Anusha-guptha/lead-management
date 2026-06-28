import client from './client';

export const getDashboard = () => client.get('/leads/dashboard/');
export const getLeads = (params = {}) => client.get('/leads/', { params });
export const createLead = (data) => client.post('/leads/', data);
export const getLead = (id) => client.get(`/leads/${id}/`);
export const updateLead = (id, data) => client.patch(`/leads/${id}/`, data);
export const deleteLead = (id) => client.delete(`/leads/${id}/`);

export const getNotes = (leadId) => client.get('/notes/', { params: { lead: leadId } });
export const addNote = (leadId, content) => client.post('/notes/', { lead: leadId, content });
export const updateNote = (id, content) => client.patch(`/notes/${id}/`, { content });
export const deleteNote = (id) => client.delete(`/notes/${id}/`);