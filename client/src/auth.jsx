import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest, logout as logoutRequest, me as meRequest } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('admin_lang') || 'en');

  async function refresh() {
    setLoading(true);
    try {
      const data = await meRequest();
      setUser(data.user || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_lang', language);
  }, [language]);

  async function login(username, password) {
    const data = await loginRequest(username, password);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
        language,
        setLanguage,
        requestDownloadAccess: async (service) => {
          const { requestDownloadAccess } = await import('./api.js');
          await requestDownloadAccess(service);
          await refresh();
        },
        recordDownload: async (service) => {
          const { recordDownload } = await import('./api.js');
          await recordDownload(service);
          await refresh();
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
