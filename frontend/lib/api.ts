import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface NGO {
  id: number;
  name: string;
  mission: string;
  description: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  verified: boolean;
  transparency_score: number;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface VolunteerPost {
  id: number;
  ngo_id: number;
  ngo_name: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  deadline?: string;
  active: boolean;
}

export interface Event {
  id: number;
  ngo_id: number;
  ngo_name: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  registration_link?: string;
}

export interface Stats {
  total_ngos: number;
  verified_ngos: number;
  total_volunteers: number;
  upcoming_events: number;
  categories: { name: string; count: number }[];
  states: { name: string; count: number }[];
}

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
};

// NGOs
export const ngoAPI = {
  getAll: (params?: any) => api.get<{ ngos: NGO[]; total: number; pages: number }>('/ngos', { params }),
  getById: (id: number) => api.get<NGO>(`/ngos/${id}`),
  create: (data: any) => api.post<NGO>('/ngos', data),
  update: (id: number, data: any) => api.put<NGO>(`/ngos/${id}`, data),
  verify: (id: number) => api.post(`/ngos/${id}/verify`),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
};

// Volunteer Posts
export const volunteerAPI = {
  getAll: (params?: any) => api.get<VolunteerPost[]>('/volunteer-posts', { params }),
  create: (data: any) => api.post<VolunteerPost>('/volunteer-posts', data),
};

// Events
export const eventAPI = {
  getAll: (params?: any) => api.get<Event[]>('/events', { params }),
  create: (data: any) => api.post<Event>('/events', data),
};

// Stats
export const statsAPI = {
  get: () => api.get<Stats>('/stats'),
};

// Search
export const searchAPI = {
  search: (query: string) => api.get<{ results: NGO[] }>('/search', { params: { q: query } }),
};

export default api;