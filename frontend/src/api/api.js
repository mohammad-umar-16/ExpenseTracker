import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
});

const req = (config) => api(config).then(res => res.data);

export const authRegister = (data)       => req({ method: 'post',  url: '/auth/register',   data });
export const authLogin    = (data)       => req({ method: 'post',  url: '/auth/login',       data });
export const authLogout   = ()           => req({ method: 'post',  url: '/auth/logout' });
export const authMe       = ()           => req({ url: '/auth/me' });
export const authOnboard  = (data)       => req({ method: 'post',  url: '/auth/onboarding', data });
export const authSettings = (data)       => req({ method: 'patch', url: '/auth/settings',   data });

export const expList   = (params)       => req({ url: '/expenses/', params });
export const expParse  = (text)         => req({ method: 'post',   url: '/expenses/parse',  data: { text } });
export const expCreate = (data)         => req({ method: 'post',   url: '/expenses/',        data });
export const expUpdate = (id, data)     => req({ method: 'put',    url: `/expenses/${id}`,   data });
export const expDelete = (id)           => api.delete(`/expenses/${id}`);

export const summaryMonthly = (month, year) => req({ url: '/summary/monthly', params: { month, year } });