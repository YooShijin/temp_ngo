import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface NGO {
  id: number;
  name: string;
  darpan_id?: string;
  mission: string;
  description: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  registered_with?: string;
  registration_no?: string;
  registration_date?: string;
  act_name?: string;
  type_of_ngo?: string;
  verified: boolean;
  blacklisted: boolean;
  transparency_score: number;
  categories: Category[];
  office_bearers?: OfficeBearer[];
  blacklist_info?: BlacklistInfo;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface OfficeBearer {
  id: number;
  name: string;
  designation: string;
}

export interface BlacklistInfo {
  id: number;
  ngo_id: number;
  blacklisted_by: string;
  blacklist_date: string;
  wef_date: string;
  last_updated: string;
  reason?: string;
}

export interface MapNGO {
  id: number;
  name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  verified: boolean;
  blacklisted: boolean;
  categories: string[];
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
  blacklisted_ngos: number;
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
  getMapData: (params?: any) => api.get<MapNGO[]>('/ngos/map', { params }),
  create: (data: any) => api.post<NGO>('/ngos', data),
  update: (id: number, data: any) => api.put<NGO>(`/ngos/${id}`, data),
  verify: (id: number) => api.post(`/ngos/${id}/verify`),
  blacklist: (id: number, data: any) => api.post(`/ngos/${id}/blacklist`, data),
  unblacklist: (id: number) => api.post(`/ngos/${id}/unblacklist`),
};

// Blacklisted NGOs
export const blacklistAPI = {
  getAll: (params?: any) => api.get<{ ngos: NGO[]; total: number; pages: number }>('/blacklisted', { params }),
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