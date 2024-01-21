import { atom } from 'recoil';

const getInitialState = () => {
  const storedToken = localStorage.getItem('authToken');
  return {
    isAuthenticated: Boolean(storedToken),
    token: storedToken || null,
  };
};

export const authState = atom({
  key: 'authState',
  default: getInitialState(),
});