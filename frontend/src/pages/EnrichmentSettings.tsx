import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Divider,
  message,
  Tabs,
  Select,
  InputNumber,
  Tag,
  Tooltip,
  Spin,
  Checkbox,
} from 'antd';
import {
  SafetyOutlined,
  ApiOutlined,
  GlobalOutlined,
  BugOutlined,
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Shield, Activity, Globe, Bug, Database, Key } from 'lucide-react';
import { enrichmentApi } from '@/services/api';
import IOCEnrichmentModal from '@/components/IOCEnrichmentModal';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Default settings fallback - moved outside component to prevent re-renders
const defaultSettings = {
  virustotal: {
    enabled: false,
    api_key: '',
    rate_limit: 4,
    timeout: 30,
    enrich_files: true,
    enrich_urls: true,
    enrich_domains: true,
    enrich_ips: true,
  },
  abuseipdb: {
    enabled: false,
    api_key: '',
    rate_limit: 1000,
    timeout: 15,
    confidence_threshold: 75,
  },
  misp: {
    enabled: false,
    url: '',
    api_key: '',
    verify_ssl: true,
    timeout: 30,
  },
  otx: {
    enabled: false,
    api_key: '',
    timeout: 30,
  },
  urlvoid: {
    enabled: false,
    api_key: '',
    timeout: 30,
  },
  shodan: {
    enabled: false,
    api_key: '',
    timeout: 30,
  },
  cache_ttl: 3600,
  max_cache_size: 1000,
  concurrent_requests: 5,
  retry_attempts: 2,
  enable_cache_compression: true,
  enable_auto_throttling: true,
};

const EnrichmentSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [iocModalVisible, setIocModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // Fetch enrichment settings with proper error handling
  const { data: settings, isLoading, error: settingsError } = useQuery({
    queryKey: ['enrichment-settings'],
    queryFn: enrichmentApi.getSettings,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch statistics with proper error handling
  const { data: statistics, error: statsError } = useQuery({
    queryKey: ['enrichment-stats'],
    queryFn: enrichmentApi.getStatistics,
    refetchInterval: settingsError ? false : 30000, // Only refresh if no error
    retry: 1,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Initialize form with appropriate data - fixed to prevent infinite re-renders
  useEffect(() => {
    const formData = settings || defaultSettings;
    form.setFieldsValue(formData);
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: enrichmentApi.updateSettings,
    onSuccess: () => {
      message.success('Enrichment settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['enrichment-settings'] });
    },
    onError: (error: any) => {
      console.error('Save settings error:', error);
      message.error('Failed to save settings. Please try again.');
    },
  });

  const handleSave = (values: any) => {
    saveSettingsMutation.mutate(values);
  };

  const testConnection = async (service: string) => {
    setTestingConnection(service);
    try {
      const result = await enrichmentApi.testService(service);
      if (result.success) {
        message.success(`${service} connection test successful! Response time: ${result.response_time}s`);
      } else {
        message.error(`${service} connection test failed: ${result.error_message}`);
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        message.error(`Cannot connect to backend server. Please ensure the API is running.`);
      } else {
        message.error(`${service} connection test failed: ${error.message}`);
      }
    } finally {
      setTestingConnection(null);
    }
  };

  const enrichmentServices = [
    {
      key: 'virustotal',
      name: 'VirusTotal',
      icon: <Shield size={24} color="var(--primary)" />,
      description: 'Analyze files, URLs, domains and IP addresses for malicious content',
      website: 'https://www.virustotal.com/gui/join-us',
      capabilities: ['File Hash Analysis', 'URL Scanning', 'Domain Reputation', 'IP Analysis'],
    },
    {
      key: 'abuseipdb',
      name: 'AbuseIPDB',
      icon: <Activity size={24} color="var(--warning)" />,
      description: 'IP address abuse and reputation database',
      website: 'https://www.abuseipdb.com/',
      capabilities: ['IP Reputation', 'Abuse Reports', 'Country Analysis', 'ISP Information'],
    },
    {
      key: 'misp',
      name: 'MISP',
      icon: <Database size={24} color="var(--info)" />,
      description: 'Malware Information Sharing Platform for threat intelligence',
      website: 'https://www.misp-project.org/',
      capabilities: ['Threat Intelligence', 'IOC Sharing', 'Event Correlation', 'Custom Feeds'],
    },
    {
      key: 'otx',
      name: 'AlienVault OTX',
      icon: <Globe size={24} color="var(--success)" />,
      description: 'Open Threat Exchange for collaborative threat intelligence',
      website: 'https://otx.alienvault.com/',
      capabilities: ['Threat Pulses', 'IOC Analysis', 'Malware Samples', 'Community Intelligence'],
    },
    {
      key: 'urlvoid',
      name: 'URLVoid',
      icon: <Bug size={24} color="var(--danger)" />,
      description: 'Website reputation and malware scanner',
      website: 'https://www.urlvoid.com/',
      capabilities: ['URL Scanning', 'Website Reputation', 'Malware Detection', 'Phishing Detection'],
    },
    {
      key: 'shodan',
      name: 'Shodan',
      icon: <Key size={24} color="#FF6B35" />,
      description: 'Search engine for Internet-connected devices',
      website: 'https://www.shodan.io/',
      capabilities: ['Device Scanning', 'Port Analysis', 'Service Detection', 'Vulnerability Assessment'],
    },
  ];

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <Spin size="large">
          <div style={{ padding: '50px' }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{
          margin: 0,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '32px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <SafetyOutlined style={{ color: 'var(--primary)' }} />
          Enrichment Settings
        </Title>
        <Paragraph style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Configure threat intelligence and IOC enrichment services to automatically enhance your security data with contextual information.
        </Paragraph>
      </div>

      <Alert
        message="Security Notice"
        description="API keys are stored securely and encrypted. Never share your API keys or commit them to version control."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {(settingsError || statsError) && (
        <Alert
          message="Backend Connection Issue"
          description="Unable to connect to the enrichment API. Using default configuration. Please ensure the backend server is running."
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs defaultActiveKey="services" size="large">
        <Tabs.TabPane
          tab={
            <span>
              <ApiOutlined />
              Services Configuration
            </span>
          }
          key="services"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={settings || defaultSettings}
          >
            <Row gutter={[24, 24]}>
              {enrichmentServices.map((service) => (
                <Col xs={24} xl={12} key={service.key}>
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {service.icon}
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 600 }}>{service.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            {service.description}
                          </div>
                        </div>
                      </div>
                    }
                    extra={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Form.Item name={[service.key, 'enabled']} valuePropName="checked" style={{ margin: 0 }}>
                          <Switch />
                        </Form.Item>
                      </div>
                    }
                    style={{ height: '100%' }}
                  >
                    <Form.Item
                      label="API Key"
                      name={[service.key, 'api_key']}
                      rules={[
                        { required: (settings || defaultSettings)?.[service.key]?.enabled, message: 'API key is required when service is enabled' }
                      ]}
                    >
                      <Input.Password
                        placeholder={`Enter your ${service.name} API key`}
                        addonAfter={
                          <Tooltip title="Test connection">
                            <Button
                              size="small"
                              icon={<ApiOutlined />}
                              loading={testingConnection === service.key}
                              onClick={() => testConnection(service.name)}
                              disabled={!(settings || defaultSettings)?.[service.key]?.enabled}
                            >
                              Test
                            </Button>
                          </Tooltip>
                        }
                      />
                    </Form.Item>

                    {/* Service-specific configurations */}
                    {service.key === 'virustotal' && (
                      <>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Rate Limit (req/min)" name={[service.key, 'rate_limit']}>
                              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Timeout (seconds)" name={[service.key, 'timeout']}>
                              <InputNumber min={5} max={300} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item label="Enrichment Options">
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Form.Item name={[service.key, 'enrich_files']} valuePropName="checked" style={{ margin: 0 }}>
                              <Checkbox>File Hash Analysis</Checkbox>
                            </Form.Item>
                            <Form.Item name={[service.key, 'enrich_urls']} valuePropName="checked" style={{ margin: 0 }}>
                              <Checkbox>URL Scanning</Checkbox>
                            </Form.Item>
                            <Form.Item name={[service.key, 'enrich_domains']} valuePropName="checked" style={{ margin: 0 }}>
                              <Checkbox>Domain Reputation</Checkbox>
                            </Form.Item>
                            <Form.Item name={[service.key, 'enrich_ips']} valuePropName="checked" style={{ margin: 0 }}>
                              <Checkbox>IP Analysis</Checkbox>
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </>
                    )}

                    {service.key === 'abuseipdb' && (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Confidence Threshold (%)" name={[service.key, 'confidence_threshold']}>
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Daily Rate Limit" name={[service.key, 'rate_limit']}>
                            <InputNumber min={1} max={10000} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}

                    {service.key === 'misp' && (
                      <>
                        <Form.Item
                          label="MISP URL"
                          name={[service.key, 'url']}
                          rules={[
                            { required: (settings || defaultSettings)[service.key]?.enabled, message: 'MISP URL is required' },
                            { type: 'url', message: 'Please enter a valid URL' }
                          ]}
                        >
                          <Input placeholder="https://your-misp-instance.com" />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name={[service.key, 'verify_ssl']} valuePropName="checked">
                              <Checkbox>Verify SSL Certificate</Checkbox>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Timeout (seconds)" name={[service.key, 'timeout']}>
                              <InputNumber min={5} max={300} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    )}

                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <strong>Capabilities:</strong> {service.capabilities.join(', ')}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <strong>Get API Key:</strong> <a href={service.website} target="_blank" rel="noopener noreferrer">{service.website}</a>
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Space size="large">
                <Button onClick={() => form.resetFields()} icon={<ReloadOutlined />}>
                  Reset to Default
                </Button>
                <Button
                  onClick={() => setIocModalVisible(true)}
                  icon={<SearchOutlined />}
                  size="large"
                >
                  Test IOC Enrichment
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saveSettingsMutation.isPending}
                  icon={<SaveOutlined />}
                  size="large"
                  style={{ minWidth: '160px' }}
                >
                  Save Configuration
                </Button>
              </Space>
            </div>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <SettingOutlined />
              Global Settings
            </span>
          }
          key="global"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Cache Configuration">
                <Form layout="vertical">
                  <Form.Item label="Cache TTL (Time To Live)">
                    <InputNumber
                      min={300}
                      max={86400}
                      defaultValue={3600}
                      addonAfter="seconds"
                      style={{ width: '100%' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      How long enrichment data is cached before refresh
                    </Text>
                  </Form.Item>

                  <Form.Item label="Max Cache Size">
                    <InputNumber
                      min={100}
                      max={10000}
                      defaultValue={1000}
                      addonAfter="entries"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Checkbox defaultChecked>Enable Cache Compression</Checkbox>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Rate Limiting & Performance">
                <Form layout="vertical">
                  <Form.Item label="Concurrent Requests">
                    <InputNumber
                      min={1}
                      max={20}
                      defaultValue={5}
                      style={{ width: '100%' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Maximum concurrent enrichment requests
                    </Text>
                  </Form.Item>

                  <Form.Item label="Retry Attempts">
                    <InputNumber
                      min={0}
                      max={5}
                      defaultValue={2}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item label="Request Timeout (seconds)">
                    <InputNumber
                      min={5}
                      max={300}
                      defaultValue={30}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Checkbox defaultChecked>Enable Automatic Throttling</Checkbox>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="IOC Extraction Rules">
                <Form layout="vertical">
                  <Form.Item label="Custom IOC Patterns (Regular Expressions)">
                    <TextArea
                      rows={6}
                      placeholder={`# Custom IOC patterns (one per line)
# IPv4 addresses
\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b

# Domain names
\\b[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}\\b

# File hashes (MD5)
\\b[a-fA-F0-9]{32}\\b`}
                      style={{ fontFamily: 'monospace' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Define custom patterns to extract IOCs from log data
                    </Text>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              Usage & Statistics
            </span>
          }
          key="stats"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {statistics?.total_enrichments || 0}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>Total Enrichments</div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>
                    Today
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success)' }}>
                    {statistics?.cache_hit_rate || 0}%
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>Cache Hit Rate</div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>
                    Excellent performance
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--warning)' }}>
                    {statistics?.avg_response_time || 0}s
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>Avg Response Time</div>
                  <div style={{ fontSize: '12px', color: 'var(--info)', marginTop: '4px' }}>
                    All services
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="Service Usage Statistics">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {enrichmentServices.map((service) => {
                    const serviceStats = statistics?.services?.[service.key] || {
                      enabled: false,
                      requests_today: 0,
                      success_rate: 0,
                      avg_response_time: 0
                    };

                    return (
                      <div key={service.key} style={{
                        flex: '1',
                        minWidth: '200px',
                        padding: '16px',
                        background: 'var(--bg-light)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          {service.icon}
                          <strong>{service.name}</strong>
                          <Tag color={serviceStats.enabled ? 'green' : 'default'}>
                            {serviceStats.enabled ? 'Active' : 'Disabled'}
                          </Tag>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          <div>Requests today: {serviceStats.requests_today}</div>
                          <div>Success rate: {serviceStats.success_rate}%</div>
                          <div>Avg response: {serviceStats.avg_response_time}s</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      <IOCEnrichmentModal
        visible={iocModalVisible}
        onCancel={() => setIocModalVisible(false)}
      />
    </div>
  );
};

export default EnrichmentSettings;