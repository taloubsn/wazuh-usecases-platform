import axios from 'axios';
import type {
  UseCase,
  UseCaseResponse,
  SearchRequest,
  SearchResponse,
  WazuhAgent,
  WazuhAlert,
  DeploymentLog
} from '@/types/wazuh';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (if needed)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    // Handle network errors gracefully
    if (!error.response) {
      console.warn('Network error or server unavailable');
      return Promise.reject(new Error('Server unavailable'));
    }

    return Promise.reject(error);
  }
);

// Use Cases API
export const useCasesApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    tag?: string;
    severity?: string;
    maturity?: string;
  }): Promise<UseCaseResponse[]> => {
    const response = await api.get('/usecases', { params });
    return response.data;
  },

  getById: async (id: string): Promise<UseCase> => {
    const response = await api.get(`/usecases/${id}`);
    return response.data;
  },

  getSimpleById: async (id: string): Promise<any> => {
    const response = await api.get(`/usecases/simple/${id}`);
    return response.data;
  },

  create: async (useCase: Omit<UseCase, 'id'>): Promise<UseCase> => {
    const response = await api.post('/usecases', useCase);
    return response.data;
  },

  createSimple: async (useCaseData: {
    name: string;
    description: string;
    author: string;
    version?: string;
    tags?: string[];
    platform?: string[];
    severity?: string;
    confidence?: string;
    false_positive_rate?: string;
    maturity?: string;
    rules_xml?: string;
    decoders_xml?: string;
    agent_config_xml?: string;
    immediate_actions?: string[];
    investigation_steps?: string[];
    containment_steps?: string[];
  }): Promise<UseCase> => {
    const response = await api.post('/usecases/simple', useCaseData);
    return response.data;
  },

  update: async (id: string, useCase: Partial<UseCase>): Promise<UseCase> => {
    const response = await api.put(`/usecases/${id}`, useCase);
    return response.data;
  },

  updateSimple: async (id: string, useCaseData: {
    name: string;
    description: string;
    author: string;
    version?: string;
    tags?: string[];
    platform?: string[];
    severity?: string;
    confidence?: string;
    false_positive_rate?: string;
    maturity?: string;
    rules_xml?: string;
    decoders_xml?: string;
    agent_config_xml?: string;
    immediate_actions?: string[];
    investigation_steps?: string[];
    containment_steps?: string[];
  }): Promise<UseCase> => {
    const response = await api.put(`/usecases/simple/${id}`, useCaseData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/usecases/${id}`);
  },
};

// Search API
export const searchApi = {
  search: async (searchRequest: SearchRequest): Promise<SearchResponse> => {
    const response = await api.post('/search', searchRequest);
    return response.data;
  },

  getMitreTactics: async (): Promise<{ tactics: string[] }> => {
    const response = await api.get('/search/mitre-tactics');
    return response.data;
  },

  getMitreTechniques: async (): Promise<{ techniques: string[] }> => {
    const response = await api.get('/search/mitre-techniques');
    return response.data;
  },

  getTags: async (): Promise<{ tags: string[] }> => {
    const response = await api.get('/search/tags');
    return response.data;
  },

  getPlatforms: async (): Promise<{ platforms: string[] }> => {
    const response = await api.get('/search/platforms');
    return response.data;
  },
};

// Deployment API
export const deploymentApi = {
  deploy: async (useCaseId: string, targetGroups?: string[]): Promise<{
    success: boolean;
    message: string;
    deployment_id?: string;
  }> => {
    const response = await api.post(`/deployment/${useCaseId}/deploy`, {
      target_groups: targetGroups
    });
    return response.data;
  },

  rollback: async (useCaseId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.post(`/deployment/${useCaseId}/rollback`);
    return response.data;
  },

  getStatus: async (useCaseId: string): Promise<{
    use_case_id: string;
    deployment_status: string;
    deployment_date?: string;
    rollback_available: boolean;
    target_groups: string[];
    logs: DeploymentLog[];
  }> => {
    const response = await api.get(`/deployment/${useCaseId}/status`);
    return response.data;
  },

  test: async (useCaseId: string): Promise<{
    success: boolean;
    message: string;
    test_results: any[];
    tested_at: string;
  }> => {
    const response = await api.post(`/deployment/${useCaseId}/test`);
    return response.data;
  },

  getLogs: async (limit = 50, skip = 0): Promise<DeploymentLog[]> => {
    const response = await api.get('/deployment/logs', {
      params: { limit, skip }
    });
    return response.data;
  },
};

// Wazuh API
export const wazuhApi = {
  getStatus: async (): Promise<{
    connected: boolean;
    status?: any;
    error?: string;
    timestamp: string;
  }> => {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Making request to:', `${API_BASE_URL}/api/v1/wazuh/status`);
    const response = await api.get('/wazuh/status');
    return response.data;
  },

  getAgents: async (): Promise<WazuhAgent[]> => {
    const response = await api.get('/wazuh/agents');
    return response.data;
  },

  getAgent: async (agentId: string): Promise<WazuhAgent> => {
    const response = await api.get(`/wazuh/agents/${agentId}`);
    return response.data;
  },

  getRules: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<any> => {
    const response = await api.get('/wazuh/rules', { params });
    return response.data;
  },

  validateRule: async (ruleXml: string): Promise<{
    valid: boolean;
    message: string;
  }> => {
    const response = await api.post('/wazuh/rules/validate', {
      rule_xml: ruleXml
    });
    return response.data;
  },

  getDecoders: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<any> => {
    const response = await api.get('/wazuh/decoders', { params });
    return response.data;
  },

  validateDecoder: async (decoderXml: string): Promise<{
    valid: boolean;
    message: string;
  }> => {
    const response = await api.post('/wazuh/decoders/validate', {
      decoder_xml: decoderXml
    });
    return response.data;
  },

  getAlerts: async (params?: {
    limit?: number;
    offset?: number;
    timeframe?: string;
    rule_id?: string;
    agent_id?: string;
  }): Promise<WazuhAlert[]> => {
    const response = await api.get('/wazuh/alerts', { params });
    return response.data;
  },

  getRuleStats: async (): Promise<{
    most_triggered_rules: Array<{
      rule_id: string;
      count: number;
      description: string;
    }>;
    timeframe: string;
    total_alerts: number;
  }> => {
    const response = await api.get('/wazuh/stats/rules');
    return response.data;
  },

  testRule: async (ruleXml: string, testLog: string): Promise<{
    matched: boolean;
    rule_id?: string;
    level?: number;
    description?: string;
    groups?: string[];
    decoded_fields?: Record<string, any>;
    error?: string;
  }> => {
    const response = await api.post('/wazuh/test-rule', {
      rule_xml: ruleXml,
      test_log: testLog
    });
    return response.data;
  },
};

// Community API
export const communityApi = {
  importFromJson: async (file: File): Promise<{
    imported_count: number;
    total_count: number;
    errors: Array<{ use_case: string; error: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/community/import/json', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportToJson: async (useCaseIds: string[]): Promise<{
    use_cases: any[];
    export_count: number;
    exported_at: string;
  }> => {
    const response = await api.post('/community/export/json', {
      use_case_ids: useCaseIds
    });
    return response.data;
  },

  searchGithub: async (query: string, language = 'wazuh', limit = 20): Promise<{
    repositories: Array<{
      name: string;
      full_name: string;
      description: string;
      stars: number;
      url: string;
      language: string;
      updated_at: string;
    }>;
    total_count: number;
  }> => {
    const response = await api.get('/community/github/search', {
      params: { query, language, limit }
    });
    return response.data;
  },

  getMarketplace: async (params?: {
    category?: string;
    sort_by?: string;
    limit?: number;
  }): Promise<Array<{
    id: string;
    name: string;
    description: string;
    author: string;
    rating: number;
    download_count: number;
    tags: string[];
    source_url?: string;
    license: string;
  }>> => {
    const response = await api.get('/community/marketplace', { params });
    return response.data;
  },
};

// Enrichment API
export const enrichmentApi = {
  getSettings: async (): Promise<any> => {
    const response = await api.get('/enrichment/settings');
    return response.data;
  },

  updateSettings: async (settings: any): Promise<any> => {
    const response = await api.post('/enrichment/settings', settings);
    return response.data;
  },

  testService: async (serviceName: string): Promise<any> => {
    const response = await api.post(`/enrichment/test/${serviceName}`);
    return response.data;
  },

  getStatistics: async (): Promise<any> => {
    const response = await api.get('/enrichment/stats');
    return response.data;
  },

  enrichIOC: async (ioc: string, iocType: string, services?: string[]): Promise<any> => {
    const response = await api.post('/enrichment/enrich', {
      ioc,
      ioc_type: iocType,
      services,
    });
    return response.data;
  },
};

export default api;