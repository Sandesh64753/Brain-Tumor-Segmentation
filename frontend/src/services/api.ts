import { AuthState, User, AnalysisPredictionResponse, AnalysisListItem, ModelMetadata, ContactForm, MriValidationResult } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('neuroscan_token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (e) {
      errorMsg = response.statusText;
    }
    throw new ApiError(errorMsg, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Authentication API
export const authApi = {
  async register(full_name: string, email: string, password: string) {
    return request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password })
    });
  },

  async login(email: string, password: string) {
    return request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  async getCurrentUser() {
    return request<User>('/auth/me');
  },

  async updateProfile(full_name?: string, email?: string, old_password?: string, new_password?: string) {
    return request<User>('/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, old_password, new_password })
    });
  }
};

// MRI Analysis API
export const analysisApi = {
  async validateMri(file: File): Promise<MriValidationResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('neuroscan_token');
    const response = await fetch(`${API_BASE}/analysis/validate`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      let errorMsg = 'Failed to validate MRI file.';
      try {
        const errData = await response.json();
        if (errData.detail) errorMsg = errData.detail;
      } catch (e) {
        errorMsg = response.statusText;
      }
      throw new ApiError(errorMsg, response.status);
    }

    return response.json();
  },

  async predictMri(file: File): Promise<AnalysisPredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('neuroscan_token');
    const response = await fetch(`${API_BASE}/analysis/predict`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      let errorMsg = 'Unable to process MRI analysis.';
      try {
        const errData = await response.json();
        if (errData.detail) errorMsg = errData.detail;
      } catch (e) {
        errorMsg = response.statusText;
      }
      throw new ApiError(errorMsg, response.status);
    }

    return response.json();
  },

  async getHistory(search?: string, classification?: string): Promise<AnalysisListItem[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (classification && classification !== 'all') params.append('classification_filter', classification);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request<AnalysisListItem[]>(`/analysis/history${queryStr}`);
  },

  async getAnalysisById(id: string): Promise<AnalysisPredictionResponse> {
    return request<AnalysisPredictionResponse>(`/analysis/${id}`);
  },

  async deleteAnalysis(id: string): Promise<void> {
    return request<void>(`/analysis/${id}`, { method: 'DELETE' });
  }
};

// Models & Meta API
export const modelsApi = {
  async getModels(): Promise<ModelMetadata[]> {
    return request<ModelMetadata[]>('/models');
  }
};

// Contact API
export const contactApi = {
  async submitContact(data: ContactForm) {
    return request<{ id: string }>('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};

// Reports API
export const reportsApi = {
  async downloadReport(analysisId: string): Promise<void> {
    const token = localStorage.getItem('neuroscan_token');
    const url = `${API_BASE}/reports/${analysisId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let errorMsg = 'Failed to download report PDF.';
      try {
        const errData = await response.json();
        if (errData.detail) errorMsg = errData.detail;
      } catch (e) {
        errorMsg = response.statusText;
      }
      throw new ApiError(errorMsg, response.status);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `NeuroScan_Report_${analysisId.substring(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }
};
