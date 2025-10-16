import Cookies from 'js-cookie';

// LOGIN: Store user data in cookies
export const login = (user) => {
  Cookies.set('auth', JSON.stringify(user), { expires: 7, secure: true });
};

// LOGOUT: Remove cookies
export const logout = () => {
  Cookies.remove('auth');
};

// LOGIN STATUS: Check if user is logged in
export const isLogin = () => {
  const authObj = JSON.parse(Cookies.get('auth') || '{}');
  return authObj.token && authObj.id ? true : false;
};

// GET LOGIN DATA: Retrieve user data from cookies
export const getLoginData = () => {
  return JSON.parse(Cookies.get('auth') || '{}');
};

/**
 * Updates the token in the cookie
 * @param {string} newToken - The new token to update.
 */
export const updateToken = (newToken) => {
  const authObj = JSON.parse(Cookies.get('auth') || '{}');
  if (authObj.token) {
    authObj.token = newToken;
    Cookies.set('auth', JSON.stringify(authObj), { expires: 7, secure: true });
  }
};
