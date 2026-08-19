import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api',
  withCredentials: true,
});

const req = (config) => api(config).then(res => res.data);

export const authRegister = (data)       => req({ method: 'post',  url: '/auth/register',   data });
export const authLogin    = (data)       => req({ method: 'post',  url: '/auth/login',       data });
export const authLogout   = ()           => req({ method: 'post',  url: '/auth/logout' });
export const authMe       = ()           => req({ url: '/auth/me' });
export const authOnboard  = (data)       => req({ method: 'post',  url: '/auth/onboarding', data });
export const authSettings = (data)       => req({ method: 'patch', url: '/auth/settings',   data });

export const expList   = (params)       => req({ url: '/expenses', params });
export const expParse      = (text)         => req({ method: 'post', url: '/expenses/parse',       data: { text } });
export const expParseImage = (image_base64, mime_type) => req({ method: 'post', url: '/expenses/parse-image', data: { image_base64, mime_type } });
export const expCreate = (data)         => req({ method: 'post',   url: '/expenses',        data });
export const expUpdate = (id, data)     => req({ method: 'put',    url: `/expenses/${id}`,   data });
export const expDelete = (id)           => api.delete(`/expenses/${id}`);

export const budgetList   = ()           => req({ url: '/budgets' });
export const budgetSet    = (category, monthly_limit) => req({ method: 'put', url: '/budgets', data: { category, monthly_limit } });
export const budgetDelete = (category)   => api.delete(`/budgets/${category}`);

export const summaryMonthly       = (month, year) => req({ url: '/summary/monthly',        params: { month, year } });
export const summaryInsights      = (month, year) => req({ url: '/summary/insights',        params: { month, year } });
export const summaryBudgetProgress = (month, year) => req({ url: '/summary/budget-progress', params: { month, year } });
