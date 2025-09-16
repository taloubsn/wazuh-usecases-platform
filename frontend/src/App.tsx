import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import UseCases from '@/pages/UseCases';
import UseCaseEditor from '@/pages/UseCaseEditor';
import UseCaseDetail from '@/pages/UseCaseDetail';
import Search from '@/pages/Search';
import Deployment from '@/pages/Deployment';
import Community from '@/pages/Community';
import WazuhStatus from '@/pages/WazuhStatus';
import EnrichmentSettings from '@/pages/EnrichmentSettings';
import './App.css';

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
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#00d4ff',
            colorBgBase: '#0a0e27',
            colorBgContainer: '#141829',
            colorBorder: '#2a3050',
            colorText: '#e4e4e7',
            colorTextSecondary: '#9ca3af',
            borderRadius: 8,
          },
        }}
      >
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/usecases" element={<UseCases />} />
              <Route path="/usecases/new" element={<UseCaseEditor />} />
              <Route path="/usecases/:id" element={<UseCaseDetail />} />
              <Route path="/usecases/:id/edit" element={<UseCaseEditor />} />
              <Route path="/search" element={<Search />} />
              <Route path="/deployment" element={<Deployment />} />
              <Route path="/community" element={<Community />} />
              <Route path="/wazuh" element={<WazuhStatus />} />
              <Route path="/enrichment" element={<EnrichmentSettings />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;