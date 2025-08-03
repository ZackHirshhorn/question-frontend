import axiosClient from './axiosClient';

export const register = (data: any) => {
  return axiosClient.post('/auth', data);
};

export const login = (data: any) => {
  return axiosClient.post('/auth/login', data);
};

export const logout = () => {
  return axiosClient.post('/auth/logout');
};
