import React from 'react';
import {
  Card,
  Button,
  Tag,
  Descriptions,
  Tabs,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Divider,
  Spin,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  EditOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  DeploymentUnitOutlined,
  DownloadOutlined,
  SecurityScanOutlined,
  CodeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Shield, Target, Activity, Code, Play, User, Clock } from 'lucide-react';
import { useCasesApi } from '@/services/api';

const { Title, Text, Paragraph } = Typography;

const EnhancedUseCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch use case details using simple API
  const { data: useCase, isLoading, error } = useQuery({
    queryKey: ['usecase-simple', id],
    queryFn: () => useCasesApi.getById(id!),
    enabled: !!id,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'var(--info)';
      case 'medium': return '#ffd700';
      case 'high': return 'var(--warning)';
      case 'critical': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return <Shield size={16} />;
      case 'medium': return <Activity size={16} />;
      case 'high': return <Target size={16} />;
      case 'critical': return <Target size={16} />;
      default: return <Shield size={16} />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'windows_workstation': return '🖥️';
      case 'windows_server': return '🏢';
      case 'linux': return '🐧';
      case 'macos': return '🍎';
      case 'network_devices': return '🔧';
      case 'containers': return '📦';
      case 'cloud': return '☁️';
      default: return '💻';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'windows_workstation': return 'Windows Workstation';
      case 'windows_server': return 'Windows Server';
      case 'linux': return 'Linux';
      case 'macos': return 'macOS';
      case 'network_devices': return 'Network Devices';
      case 'containers': return 'Containers';
      case 'cloud': return 'Cloud';
      default: return platform;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>Loading use case details...</Text>
      </div>
    );
  }

  if (error || !useCase) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error"
          description="Failed to load use case details. Please try again."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/usecases')}>
              Back to Use Cases
            </Button>
          }
        />
      </div>
    );
  }

  // useCase now contains simplified flat structure from enhanced API

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/usecases')}
          >
            Back
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/usecases/${id}/edit`)}
          >
            Edit
          </Button>
          <Button icon={<PlayCircleOutlined />}>
            Test
          </Button>
          <Button icon={<DeploymentUnitOutlined />}>
            Deploy
          </Button>
          <Button icon={<DownloadOutlined />}>
            Export
          </Button>
        </Space>

        <Title level={1} style={{ margin: 0, color: 'var(--text)' }}>
          {useCase.name || 'Unnamed Use Case'}
        </Title>

        <div style={{ margin: '16px 0' }}>
          <Space wrap>
            <div className={`severity-badge ${useCase.severity || 'medium'}`}>
              {getSeverityIcon(useCase.severity)}
              {useCase.severity || 'medium'}
            </div>
            <div className={`status-badge ${useCase.maturity || 'draft'}`}>
              {useCase.maturity || 'draft'}
            </div>
            {useCase.response_priority && (
              <div className={`severity-badge ${useCase.response_priority || 'medium'}`}>
                Priority: {useCase.response_priority}
              </div>
            )}
          </Space>
        </div>

        <Paragraph style={{ fontSize: 16, color: 'var(--text-muted)' }}>
          {useCase.description || 'No description provided.'}
        </Paragraph>
      </div>

      {/* Content Tabs */}
      <Tabs defaultActiveKey="overview" size="large">
        <Tabs.TabPane
          tab={
            <span>
              <SecurityScanOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          <Row gutter={[24, 24]}>
            {/* Basic Information */}
            <Col xs={24} lg={12}>
              <Card title={
                <Space>
                  <User size={20} />
                  <span>Basic Information</span>
                </Space>
              }>
                <Descriptions column={1} size="middle">
                  <Descriptions.Item label="Author">
                    <Text strong>{useCase.author || 'Unknown'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Version">
                    <Tag>{useCase.version || '1.0.0'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {useCase.created_at ? new Date(useCase.created_at).toLocaleDateString() : 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated">
                    {useCase.updated_at ? new Date(useCase.updated_at).toLocaleDateString() : 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="False Positive Rate">
                    <div className={`severity-badge ${useCase.false_positive_rate || 'low'}`}>
                      {useCase.false_positive_rate || 'low'}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Platform Information */}
              <Card
                title={
                  <Space>
                    <Target size={20} />
                    <span>Target Platforms</span>
                  </Space>
                }
                style={{ marginTop: 16 }}
              >
                <div className="platform-badges">
                  {useCase.platform && useCase.platform.length > 0 ?
                    useCase.platform.map(platform => (
                      <div key={platform} className={`platform-badge ${platform.toLowerCase()}`}>
                        {getPlatformIcon(platform)} {getPlatformLabel(platform)}
                      </div>
                    )) :
                    <Text type="secondary">No platforms specified</Text>
                  }
                </div>
              </Card>

              {/* Wazuh Rule ID */}
              {useCase.wazuh_rule_id && (
                <Card
                  title={
                    <Space>
                      <Code size={20} />
                      <span>Wazuh Rule ID</span>
                    </Space>
                  }
                  style={{ marginTop: 16 }}
                >
                  <Tag color="blue" style={{ fontSize: '14px', padding: '8px 16px' }}>
                    {useCase.wazuh_rule_id}
                  </Tag>
                </Card>
              )}
            </Col>

            {/* MITRE ATT&CK Information */}
            <Col xs={24} lg={12}>
              <Card title={
                <Space>
                  <Target size={20} color="var(--danger)" />
                  <span>MITRE ATT&CK Mapping</span>
                </Space>
              }>
                <Descriptions column={1} size="middle">
                  <Descriptions.Item label="Tactics">
                    {useCase.mitre_tactics && useCase.mitre_tactics.length > 0 ? (
                      <Space wrap>
                        {useCase.mitre_tactics.map(tactic => (
                          <Tag key={tactic} color="red">{tactic}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No tactics specified</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Techniques">
                    {useCase.mitre_techniques && useCase.mitre_techniques.length > 0 ? (
                      <div className="mitre-tags">
                        {useCase.mitre_techniques.map(technique => (
                          <div key={technique} className="mitre-tag">{technique}</div>
                        ))}
                      </div>
                    ) : (
                      <Text type="secondary">No techniques specified</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="CVE References">
                    {useCase.cve && useCase.cve.length > 0 ? (
                      <Space wrap>
                        {useCase.cve.map(cve => (
                          <Tag key={cve} color="orange">{cve}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No CVE references</Text>
                    )}
                  </Descriptions.Item>
                  {useCase.cvss_score && (
                    <Descriptions.Item label="CVSS Score">
                      <div className={`severity-badge ${
                        useCase.cvss_score >= 9 ? 'critical' :
                        useCase.cvss_score >= 7 ? 'high' :
                        useCase.cvss_score >= 4 ? 'medium' : 'low'
                      }`}>
                        {useCase.cvss_score}/10.0
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Tags */}
              {useCase.tags && useCase.tags.length > 0 && (
                <Card
                  title={
                    <Space>
                      <SettingOutlined />
                      <span>Tags</span>
                    </Space>
                  }
                  style={{ marginTop: 16 }}
                >
                  <Space wrap>
                    {useCase.tags.map(tag => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                </Card>
              )}
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <CodeOutlined />
              Detection Logic
            </span>
          }
          key="detection"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card title="Wazuh Rules (XML)">
                {useCase.rules_xml ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.rules_xml}
                  </div>
                ) : (
                  <Alert
                    message="No Detection Rules"
                    description="No Wazuh detection rules have been configured for this use case."
                    type="info"
                    showIcon
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Custom Decoders">
                {useCase.decoders_xml ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.decoders_xml}
                  </div>
                ) : (
                  <Text type="secondary">No custom decoders configured</Text>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Agent Configuration">
                {useCase.agent_config_xml ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.agent_config_xml}
                  </div>
                ) : (
                  <Text type="secondary">No agent configuration specified</Text>
                )}
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <PlayCircleOutlined />
              Response Playbook
            </span>
          }
          key="playbook"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              {/* Response Priority & Contact */}
              <Card title="Response Information">
                <Descriptions column={1} size="middle">
                  {useCase.response_priority && (
                    <Descriptions.Item label="Priority">
                      <div className={`severity-badge ${useCase.response_priority}`}>
                        {useCase.response_priority}
                      </div>
                    </Descriptions.Item>
                  )}
                  {useCase.escalation_contact && (
                    <Descriptions.Item label="Escalation Contact">
                      <Text strong>{useCase.escalation_contact}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Response Actions */}
              <Card title="Response Actions" style={{ marginTop: 16 }}>
                {useCase.response_actions ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}>
                    {useCase.response_actions}
                  </div>
                ) : (
                  <Text type="secondary">No response actions defined</Text>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              {/* Legacy playbook support for immediate actions */}
              {useCase.immediate_actions && useCase.immediate_actions.length > 0 && (
                <Card title="Immediate Actions">
                  <ol>
                    {useCase.immediate_actions.map((action, index) => (
                      <li key={index} style={{ marginBottom: 8 }}>
                        <Text>{action}</Text>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Legacy playbook support for investigation steps */}
              {useCase.investigation_steps && useCase.investigation_steps.length > 0 && (
                <Card title="Investigation Steps" style={{ marginTop: 16 }}>
                  <ol>
                    {useCase.investigation_steps.map((step, index) => (
                      <li key={index} style={{ marginBottom: 8 }}>
                        <Text>{step}</Text>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Legacy playbook support for containment */}
              {useCase.containment_steps && useCase.containment_steps.length > 0 && (
                <Card title="Containment Actions" style={{ marginTop: 16 }}>
                  <ol>
                    {useCase.containment_steps.map((action, index) => (
                      <li key={index} style={{ marginBottom: 8 }}>
                        <Text>{action}</Text>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Automation Script */}
              <Card title="Automation Script" style={{ marginTop: 16 }}>
                {useCase.automation_script ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.automation_script}
                  </div>
                ) : (
                  <Text type="secondary">No automation script configured</Text>
                )}
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default EnhancedUseCaseDetail;