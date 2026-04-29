const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Dashboard API
export const dashboardApi = {
  getStats: async (query = '') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats?${query}`);
    return response.json();
  },
  getActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/activity`);
    return response.json();
  },
  getCourseStats: async (query = '') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/courses?${query}`);
    return response.json();
  },
  getRevenueTimeline: async (query = '') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/revenue-timeline?${query}`);
    return response.json();
  },
  getRegistrations: async (query = '') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/registrations?${query}`);
    return response.json();
  },
  getReclamations: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/reclamations`);
    return response.json();
  },
  getRecentCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent`);
    return response.json();
  },
};


// Motards API
export const motardsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/motards`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/motards/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  create: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/motards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data
    });
    return response.json();
  },
  update: async (id: string, data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/motards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data
    });
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/motards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },
  toggle: async (id: string, field: 'statut_bloque' | 'is_online') => {
    const response = await fetch(`${API_BASE_URL}/motards/${id}/toggle`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ field }),
    });
    return response.json();
  },
};

// Motos API
export const motosApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/motos`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  create: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/motos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data
    });
    return response.json();
  },
  update: async (id: string, data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/motos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data
    });
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/motos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Clients API
export const clientsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Courses API
export const coursesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  getByMotard: async (numtel: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/motard/${encodeURIComponent(numtel)}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Admins API
export const adminsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/admins`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};