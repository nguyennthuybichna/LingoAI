const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};


export const api = {
  async register(username, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },


  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },


  async getGlossary() {
    const res = await fetch(`${API_URL}/glossary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch glossary');
    return data;
  },


  async addGlossaryTerm(sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage) {
    const res = await fetch(`${API_URL}/glossary`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add glossary term');
    return data;
  },


  async deleteGlossaryTerm(id) {
    const res = await fetch(`${API_URL}/glossary/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete glossary term');
    return data;
  },


  async updateGlossaryTerm(id, sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage, isActive) {
    const res = await fetch(`${API_URL}/glossary/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage, isActive }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update glossary term');
    return data;
  },


  async translate(text, domain, sourceLanguage, targetLanguage) {
    const res = await fetch(`${API_URL}/translate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, domain, sourceLanguage, targetLanguage }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Translation failed');
      err.status = res.status;
      err.error = data.error;
      throw err;
    }
    return data;
  },


  async getTranslationHistory() {
    const res = await fetch(`${API_URL}/translate/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch history');
    return data;
  },


  async deleteTranslation(id) {
    const res = await fetch(`${API_URL}/translate/history/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete translation');
    return data;
  },


  async getProfile() {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },


  async updateProfile(profileData) {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },
};

