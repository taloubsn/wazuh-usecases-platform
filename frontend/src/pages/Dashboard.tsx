import React from 'react';
import { Row, Col, Card, Statistic, Alert, Typography, Button, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  FileTextOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCasesApi, wazuhApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Mock data for charts
const alertsData = [
  { name: 'Mon', alerts: 45 },
  { name: 'Tue', alerts: 52 },
  { name: 'Wed', alerts: 38 },
  { name: 'Thu', alerts: 67 },
  { name: 'Fri', alerts: 45 },
  { name: 'Sat', alerts: 23 },
  { name: 'Sun', alerts: 31 },
];

const severityData = [
  { name: 'Low', value: 45, color: '#52c41a' },
  { name: 'Medium', value: 32, color: '#faad14' },
  { name: 'High', value: 18, color: '#ff4d4f' },
  { name: 'Critical', value: 5, color: '#722ed1' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch use cases statistics
  const { data: useCases, isLoading: useCasesLoading, error: useCasesError } = useQuery({
    queryKey: ['usecases'],
    queryFn: () => useCasesApi.getAll({ limit: 100 }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: true, // Réactiver
  });

  // Fetch Wazuh status
  const { data: wazuhStatus, isLoading: wazuhLoading, error: wazuhError } = useQuery({
    queryKey: ['wazuh-status'],
    queryFn: () => wazuhApi.getStatus(),
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    enabled: true, // Réactiver
  });

  // Calculate statistics with error safety
  const totalUseCases = Array.isArray(useCases) ? useCases.length : 0;
  const deployedUseCases = Array.isArray(useCases) ? useCases.filter(uc => uc?.deployment_status === 'deployed').length : 0;
  const productionUseCases = Array.isArray(useCases) ? useCases.filter(uc => uc?.maturity === 'production').length : 0;
  const draftUseCases = Array.isArray(useCases) ? useCases.filter(uc => uc?.maturity === 'draft').length : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Overview of your Wazuh use cases and platform status</Text>
      </div>

      {/* API Connection Errors */}
      {(useCasesError || wazuhError) && (
        <Alert
          message="API Connection Issue"
          description={
            useCasesError
              ? `Failed to load use cases: ${useCasesError.message}`
              : `Failed to check Wazuh status: ${wazuhError?.message}`
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Wazuh Connection Status */}
      {wazuhStatus && (
        <Alert
          message={
            wazuhStatus.connected
              ? 'Wazuh Manager Connected'
              : 'Wazuh Manager Disconnected'
          }
          description={
            wazuhStatus.connected
              ? 'Successfully connected to Wazuh Manager API'
              : `Connection failed: ${wazuhStatus.error || 'Unknown error'}`
          }
          type={wazuhStatus.connected ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: 24 }}
          action={
            !wazuhStatus.connected && (
              <Button size="small" onClick={() => navigate('/wazuh')}>
                Check Status
              </Button>
            )
          }
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card" onClick={() => navigate('/usecases')}>
            <Statistic
              title="Total Use Cases"
              value={totalUseCases}
              prefix={<FileTextOutlined />}
              loading={useCasesLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card" onClick={() => navigate('/deployment')}>
            <Statistic
              title="Deployed"
              value={deployedUseCases}
              prefix={<CheckCircleOutlined />}
              loading={useCasesLoading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="Production Ready"
              value={productionUseCases}
              prefix={<DeploymentUnitOutlined />}
              loading={useCasesLoading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="In Draft"
              value={draftUseCases}
              prefix={<ExclamationCircleOutlined />}
              loading={useCasesLoading}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Alerts Trend (Last 7 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="alerts"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ fill: '#1890ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Alerts by Severity">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/usecases/new')}
          >
            Create New Use Case
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate('/usecases')}
          >
            View All Use Cases
          </Button>
          <Button
            icon={<DeploymentUnitOutlined />}
            onClick={() => navigate('/deployment')}
          >
            Deployment Manager
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;