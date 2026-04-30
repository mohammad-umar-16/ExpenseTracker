import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const req = (config) => api(config).then(res => res.data);

// Auth
export const authRegister = (data)       => req({ method: 'post',  url: '/auth/register',   data });
export const authLogin    = (data)       => req({ method: 'post',  url: '/auth/login',       data });
export const authMe       = ()           => req({ url: '/auth/me' });
export const authOnboard  = (data)       => req({ method: 'post',  url: '/auth/onboarding', data });
export const authSettings = (data)       => req({ method: 'patch', url: '/auth/settings',   data });

// Expenses
export const expList   = (params)       => req({ url: '/expenses/', params });
export const expCreate = (data)         => req({ method: 'post',   url: '/expenses/',        data });
export const expUpdate = (id, data)     => req({ method: 'put',    url: `/expenses/${id}`,   data });
export const expDelete = (id)           => api.delete(`/expenses/${id}`);

// Summary
export const summaryMonthly = (month, year) => req({ url: '/summary/monthly', params: { month, year } });
