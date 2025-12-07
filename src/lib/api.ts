// API Base URL
const API_BASE = 'http://localhost:8080/api';

// API Service
export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>)
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const text = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const error = JSON.parse(text);
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (!text || text.trim() === '') {
        return {};
      }
      
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      throw error;
    }
  },

  uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (user && user.id) {
      formData.append('userId', user.id);
    }
    
    const token = localStorage.getItem('token');
    
    return fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(async r => {
      const text = await r.text();
      if (!r.ok) throw new Error('Upload failed');
      if (!text) return null;
      return JSON.parse(text);
    });
  },

  getResumes() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const url = user?.id ? `/resume/list?userId=${user.id}` : '/resume/list';
    return this.request(url).then((data: { resumes?: unknown[] }) => data.resumes || []);
  },

  startInterview(jobTitle: string, jobDescription: string) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const body = { jobTitle, jobDescription };
    const url = user?.id ? `/interview/start?userId=${user.id}` : '/interview/start';
    
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  submitAnswer(questionId: string | number, answer: string) {
    return this.request(`/interview/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer })
    });
  },

  getInterviewHistory() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const url = user?.id ? `/interview/history?userId=${user.id}` : '/interview/history';
    return this.request(url);
  }
};
