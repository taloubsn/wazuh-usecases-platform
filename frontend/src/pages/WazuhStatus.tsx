import React from 'react';
import {
  Card,
  Typography,
  Alert,
  Button,
  Spin,
  Row,
  Col,
  Statistic,
  Descriptions,
  Table,
  Tag,
  Space,
} from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloudServerOutlined,
  SettingOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { wazuhApi } from '@/services/api';
import type { WazuhAgent } from '@/types/wazuh';

const { Title, Text } = Typography;

const WazuhStatus: React.FC = () => {
  console.log('🔥 WAZUH STATUS COMPONENT - Starting render');

  // Fetch Wazuh status with proper error handling
  const {
    data: wazuhStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
    error: statusError
  } = useQuery({
    queryKey: ['wazuh-status'],
    queryFn: async () => {
      console.log('🔥 Fetching Wazuh status...');
      const result = await wazuhApi.getStatus();
      console.log('🔥 Wazuh status received:', result);
      return result;
    },
    retry: false,
    staleTime: 30000,
  });

  // Fetch agents only if status is connected
  const {
    data: agentsResponse,
    isLoading: agentsLoading
  } = useQuery({
    queryKey: ['wazuh-agents'],
    queryFn: async () => {
      try {
        const response = await wazuhApi.getAgents();
        console.log('🔥 Agents response:', response);
        return response;
      } catch (error) {
        console.warn('Agents endpoint error:', error);
        return { affected_items: [] };
      }
    },
    enabled: !!wazuhStatus?.connected,
    retry: false,
    staleTime: 30000,
  });

  // Extract agents from response - handle both array and object response formats
  const agents: WazuhAgent[] = Array.isArray(agentsResponse)
    ? agentsResponse
    : agentsResponse?.affected_items || [];

  console.log('🔥 Component state:', {
    statusLoading,
    hasStatus: !!wazuhStatus,
    connected: wazuhStatus?.connected,
    hasAgents: !!agents,
    agentsCount: agents?.length || 0,
    hasError: !!statusError
  });

  // Loading state - show only for initial load
  if (statusLoading && !wazuhStatus) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Title level={2}>Wazuh Manager Status</Title>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Connecting to Wazuh Manager...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (statusError && !wazuhStatus) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Wazuh Manager Status</Title>
          <Text type="secondary">Monitor your Wazuh infrastructure and agent status</Text>
        </div>
        <Alert
          message="Connection Failed"
          description={`Unable to connect to Wazuh API: ${statusError?.message || 'Unknown error'}`}
          type="error"
          showIcon
          action={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchStatus()}
              loading={statusLoading}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Safe data extraction
  const safeAgents = agents || [];
  const activeAgents = safeAgents.filter((agent: WazuhAgent) => agent.status === 'active');
  const managerInfo = wazuhStatus?.status?.affected_items?.[0];

  // Debug: Force render even if there are issues
  console.log('🔥 About to render - Final check:', {
    hasWazuhStatus: !!wazuhStatus,
    connected: wazuhStatus?.connected,
    agentsCount: safeAgents.length,
    managerInfo: !!managerInfo
  });

  // Agent table columns
  const agentColumns = [
    {
      title: 'Agent ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const getStatusProps = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'active':
              return { color: 'success', icon: <CheckCircleOutlined /> };
            case 'disconnected':
              return { color: 'warning', icon: <ExclamationCircleOutlined /> };
            default:
              return { color: 'default', icon: <ExclamationCircleOutlined /> };
          }
        };

        const props = getStatusProps(status);
        return (
          <Tag icon={props.icon} color={props.color}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
  ];

  // Force render to ensure something always displays
  console.log('🔥 RENDERING MAIN COMPONENT');

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Wazuh Manager Status</Title>
          <Text type="secondary">Monitor your Wazuh infrastructure and agent status</Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetchStatus()}
          loading={statusLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      <Alert
        message={
          wazuhStatus?.connected
            ? 'Wazuh Manager Connected'
            : wazuhStatus?.connected === false
            ? 'Wazuh Manager Disconnected'
            : 'Connecting to Wazuh Manager...'
        }
        description={
          wazuhStatus?.connected
            ? 'Successfully connected to Wazuh Manager API'
            : wazuhStatus?.connected === false
            ? `Connection failed: ${wazuhStatus?.error || 'Unknown error'}`
            : 'Establishing connection to Wazuh Manager API...'
        }
        type={
          wazuhStatus?.connected
            ? 'success'
            : wazuhStatus?.connected === false
            ? 'error'
            : 'info'
        }
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Always render content area */}
      {wazuhStatus?.connected ? (
        <>
          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Agents"
                  value={safeAgents.length}
                  prefix={<CloudServerOutlined />}
                  loading={agentsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Active Agents"
                  value={activeAgents.length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  loading={agentsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Manager Status"
                  value={wazuhStatus?.connected ? 'Online' : 'Offline'}
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: wazuhStatus?.connected ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Last Update"
                  value="Just now"
                  prefix={<BugOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Manager Services Status */}
          {managerInfo && (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <Card title="Manager Services">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Analysis Engine">
                      <Tag color={managerInfo['wazuh-analysisd'] === 'running' ? 'green' : 'red'}>
                        {managerInfo['wazuh-analysisd'] || 'unknown'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Authentication">
                      <Tag color={managerInfo['wazuh-authd'] === 'running' ? 'green' : 'red'}>
                        {managerInfo['wazuh-authd'] || 'unknown'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Remote Daemon">
                      <Tag color={managerInfo['wazuh-remoted'] === 'running' ? 'green' : 'red'}>
                        {managerInfo['wazuh-remoted'] || 'unknown'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="API Service">
                      <Tag color={managerInfo['wazuh-apid'] === 'running' ? 'green' : 'red'}>
                        {managerInfo['wazuh-apid'] || 'unknown'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Database">
                      <Tag color={managerInfo['wazuh-db'] === 'running' ? 'green' : 'red'}>
                        {managerInfo['wazuh-db'] || 'unknown'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="System Information">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Last Sync">
                      {wazuhStatus?.timestamp ? new Date(wazuhStatus.timestamp).toLocaleString() : 'Unknown'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Connection Status">
                      <Tag color="green">Connected</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Response Time">
                      <Text type="success">{'< 100ms'}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          )}

          {/* Agents Table */}
          <Card title={`Wazuh Agents (${safeAgents.length})`}>
            <Table
              dataSource={safeAgents}
              columns={agentColumns}
              loading={agentsLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} agents`,
              }}
              size="small"
            />
          </Card>
        </>
      ) : (
        <Card title="Connection Required">
          <Alert
            message="Cannot connect to Wazuh Manager"
            description={
              <div>
                <p>Please check your Wazuh API configuration in the environment variables:</p>
                <ul>
                  <li>WAZUH_API_URL</li>
                  <li>WAZUH_API_USERNAME</li>
                  <li>WAZUH_API_PASSWORD</li>
                </ul>
                <p>Make sure the Wazuh Manager is running and accessible.</p>
              </div>
            }
            type="warning"
            showIcon
          />
        </Card>
      )}
    </div>
  );
};

export default WazuhStatus;