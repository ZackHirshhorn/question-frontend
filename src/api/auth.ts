import axiosClient from './axiosClient';

interface UserRegistrationData {
  name: string;
  email: string;
  password?: string;
}

interface UserLoginData {
  email: string;
  password?: string;
}

export const register = (data: UserRegistrationData) => {
  return axiosClient.post('/auth', data);
};

export const login = (data: UserLoginData) => {
  return axiosClient.post('/auth/login', data);
};

export const logout = () => {
  return axiosClient.post('/auth/logout');
};
