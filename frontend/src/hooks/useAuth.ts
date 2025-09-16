import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier l'état de connexion au chargement
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated');
        const userStr = localStorage.getItem('user');

        if (authStatus === 'true' && userStr) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userStr));
        } else {
          // Auto-login pour la démo si pas de session existante
          const demoUser = {
            id: 'admin001',
            username: 'admin',
            email: 'admin@company.com',
            fullName: 'Administrateur Système',
            role: 'Super Admin'
          };

          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(demoUser));
          setIsAuthenticated(true);
          setUser(demoUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // En cas d'erreur, faire un auto-login pour ne pas casser l'app
        const demoUser = {
          id: 'admin001',
          username: 'admin',
          email: 'admin@company.com',
          fullName: 'Administrateur Système',
          role: 'Super Admin'
        };

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(demoUser));
        setIsAuthenticated(true);
        setUser(demoUser);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (userData: User) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
};