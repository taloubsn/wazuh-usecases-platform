import React from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Timeline,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  PlayCircleOutlined,
  RollbackOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { deploymentApi, useCasesApi } from '@/services/api';
import type { UseCaseResponse, DeploymentLog } from '@/types/wazuh';

const { Title, Text } = Typography;

const Deployment: React.FC = () => {
  // Fetch use cases
  const { data: useCases, isLoading: useCasesLoading } = useQuery({
    queryKey: ['usecases'],
    queryFn: () => useCasesApi.getAll({ limit: 100 }),
  });

  // Fetch deployment logs
  const { data: deploymentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['deployment-logs'],
    queryFn: () => deploymentApi.getLogs(20, 0),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'pending': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'failed': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'success';
      case 'pending': return 'processing';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const deployedCount = useCases?.filter(uc => uc.deployment_status === 'deployed').length || 0;
  const pendingCount = useCases?.filter(uc => uc.deployment_status === 'pending').length || 0;
  const failedCount = useCases?.filter(uc => uc.deployment_status === 'failed').length || 0;
  const draftCount = useCases?.filter(uc => uc.deployment_status === 'draft').length || 0;

  const columns = [
    {
      title: 'Use Case',
      key: 'name',
      render: (record: UseCaseResponse) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            v{record.version} by {record.author}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'deployment_status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors = {
          low: 'success',
          medium: 'warning',
          high: 'error',
          critical: 'purple',
        };
        return (
          <Tag color={colors[severity as keyof typeof colors] || 'default'}>
            {severity.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Maturity',
      dataIndex: 'maturity',
      key: 'maturity',
      render: (maturity: string) => (
        <Tag color={maturity === 'production' ? 'success' : 'default'}>
          {maturity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: UseCaseResponse) => (
        <Space size="small">
          {record.deployment_status === 'draft' && (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => console.log('Deploy:', record.id)}
            >
              Deploy
            </Button>
          )}
          {record.deployment_status === 'deployed' && (
            <Button
              size="small"
              icon={<RollbackOutlined />}
              onClick={() => console.log('Rollback:', record.id)}
            >
              Rollback
            </Button>
          )}
          <Button
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => console.log('Test:', record.id)}
          >
            Test
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Deployment Manager</Title>
        <Text type="secondary">Deploy, test, and manage your Wazuh use cases</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Deployed"
              value={deployedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Failed"
              value={failedCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Draft"
              value={draftCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Use Cases" loading={useCasesLoading}>
            <Table
              dataSource={useCases}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} use cases`,
              }}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Recent Activity" loading={logsLoading}>
            <Timeline size="small" style={{ maxHeight: 400, overflow: 'auto' }}>
              {deploymentLogs?.map((log) => {
                const getTimelineColor = (status: string) => {
                  switch (status) {
                    case 'success': return 'green';
                    case 'failed': return 'red';
                    default: return 'blue';
                  }
                };

                return (
                  <Timeline.Item
                    key={log.id}
                    color={getTimelineColor(log.status)}
                    dot={
                      log.action === 'deploy' ? <PlayCircleOutlined /> :
                      log.action === 'rollback' ? <RollbackOutlined /> :
                      <ExperimentOutlined />
                    }
                  >
                    <div>
                      <Text strong>{log.action.toUpperCase()}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(log.created_at).toLocaleString()}
                      </Text>
                      <br />
                      <Text style={{ fontSize: 12 }}>
                        {log.message}
                      </Text>
                      {log.status === 'failed' && (
                        <Tag color="error" size="small" style={{ marginTop: 4, display: 'block', width: 'fit-content' }}>
                          FAILED
                        </Tag>
                      )}
                    </div>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>

          <Alert
            message="Deployment Tips"
            description={
              <div style={{ fontSize: 12 }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>Test use cases before deploying to production</li>
                  <li>Monitor deployment logs for any issues</li>
                  <li>Use rollback for quick recovery</li>
                  <li>Deploy during maintenance windows</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Deployment;