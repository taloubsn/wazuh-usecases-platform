import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import UseCases from '@/pages/UseCases';
import UseCaseEditor from '@/pages/UseCaseEditor';
import UseCaseDetail from '@/pages/UseCaseDetail';
import Search from '@/pages/Search';
import Community from '@/pages/Community';
import WazuhStatus from '@/pages/WazuhStatus';
import EnrichmentSettings from '@/pages/EnrichmentSettings';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import './App.css';
import './styles/theme-overrides.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ThemedApp />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const ThemedApp: React.FC = () => {
  const { getAntdTheme } = useTheme();

  return (
    <ConfigProvider theme={getAntdTheme()}>
      <AppContent />
    </ConfigProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0e27'
      }}>
        <div>Loading Wazuh Platform...</div>
      </div>
    );
  }

  // Show login page if not authenticated and not already on login
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Login />;
  }

  // Show login route or main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/usecases" element={<UseCases />} />
            <Route path="/usecases/new" element={<UseCaseEditor />} />
            <Route path="/usecases/:id" element={<UseCaseDetail />} />
            <Route path="/usecases/:id/edit" element={<UseCaseEditor />} />
            <Route path="/search" element={<Search />} />
            <Route path="/community" element={<Community />} />
            <Route path="/wazuh" element={<WazuhStatus />} />
            <Route path="/enrichment" element={<EnrichmentSettings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

export default App;