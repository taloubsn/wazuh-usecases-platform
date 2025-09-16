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
  Timeline,
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
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { useCasesApi } from '@/services/api';
import type { SeverityLevel, MaturityStatus } from '@/types/wazuh';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const UseCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch use case details
  const { data: useCase, isLoading, error } = useQuery({
    queryKey: ['usecase', id],
    queryFn: () => useCasesApi.getById(id!),
    enabled: !!id,
  });

  // Also fetch simplified data for enhanced fields
  const { data: enhancedData } = useQuery({
    queryKey: ['usecase-simple', id],
    queryFn: () => useCasesApi.getSimpleById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !useCase) {
    return (
      <Alert
        message="Error"
        description="Failed to load use case details"
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'purple';
      default: return 'default';
    }
  };

  const getMaturityColor = (maturity: MaturityStatus) => {
    switch (maturity) {
      case 'draft': return 'default';
      case 'testing': return 'warning';
      case 'production': return 'success';
      case 'deprecated': return 'error';
      default: return 'default';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/usecases')}
          >
            Back to Use Cases
          </Button>
          <Button
            icon={<EditOutlined />}
            type="primary"
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

        <Title level={2} style={{ margin: 0 }}>
          {useCase.metadata.name}
        </Title>
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <Space wrap>
            <Tag color={getSeverityColor(useCase.classification.severity)}>
              {useCase.classification.severity.toUpperCase()}
            </Tag>
            <Tag color={getMaturityColor(useCase.classification.maturity)}>
              {useCase.classification.maturity.toUpperCase()}
            </Tag>
            <Tag color={useCase.deployment.deployment_status === 'deployed' ? 'success' : 'default'}>
              {useCase.deployment.deployment_status.toUpperCase()}
            </Tag>
          </Space>
        </div>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          {useCase.metadata.description}
        </Paragraph>
      </div>

      {/* Content Tabs */}
      <Tabs defaultActiveKey="overview" size="large">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Basic Information" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Author">
                    {useCase.metadata.author}
                  </Descriptions.Item>
                  <Descriptions.Item label="Version">
                    {useCase.metadata.version}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {new Date(useCase.metadata.created_at).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated">
                    {new Date(useCase.metadata.updated_at).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="License">
                    {useCase.community.license}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Classification" size="small" style={{ marginTop: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Platforms">
                    <Space wrap>
                      {useCase.classification.platform.map(platform => (
                        <Tag key={platform}>{platform}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Confidence">
                    <Tag color={getSeverityColor(useCase.classification.confidence)}>
                      {useCase.classification.confidence}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="False Positive Rate">
                    <Tag color={getSeverityColor(useCase.classification.false_positive_rate)}>
                      {useCase.classification.false_positive_rate}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Compliance">
                    <Space wrap>
                      {useCase.classification.compliance.map(comp => (
                        <Tag key={comp}>{comp}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="MITRE ATT&CK Mapping" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tactics">
                    <Space wrap>
                      {useCase.threat_intel.mitre_attack.tactics.map(tactic => (
                        <Tag key={tactic} color="blue">{tactic}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Techniques">
                    <Space wrap>
                      {useCase.threat_intel.mitre_attack.techniques.map(technique => (
                        <Tag key={technique} color="cyan">{technique}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                  {enhancedData?.wazuh_rule_id && (
                    <Descriptions.Item label="Wazuh Rule ID">
                      <Tag color="green" style={{ fontFamily: 'monospace' }}>
                        {enhancedData.wazuh_rule_id}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  {enhancedData?.cve && enhancedData.cve.length > 0 && (
                    <Descriptions.Item label="CVE References">
                      <Space wrap>
                        {enhancedData.cve.map(cve => (
                          <Tag key={cve} color="orange">{cve}</Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}
                  {enhancedData?.cvss_score && (
                    <Descriptions.Item label="CVSS Score">
                      <Tag color={
                        enhancedData.cvss_score >= 9 ? 'red' :
                        enhancedData.cvss_score >= 7 ? 'orange' :
                        enhancedData.cvss_score >= 4 ? 'gold' : 'green'
                      }>
                        {enhancedData.cvss_score}/10.0
                      </Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              <Card title="Technical Specifications" size="small" style={{ marginTop: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Wazuh Version">
                    <Tag>{useCase.technical_specs.wazuh_version}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Performance Impact">
                    <Tag color={getSeverityColor(useCase.technical_specs.performance_impact)}>
                      {useCase.technical_specs.performance_impact}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Log Sources">
                    <Space wrap>
                      {useCase.technical_specs.supported_log_sources.map(source => (
                        <Tag key={source}>{source}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {useCase.metadata.tags.length > 0 && (
            <Card title="Tags" size="small" style={{ marginTop: 24 }}>
              <Space wrap>
                {useCase.metadata.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Card>
          )}
        </TabPane>

        <TabPane tab="Detection Logic" key="detection">
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card title="Wazuh Rules (XML)">
                {useCase.detection_logic.rules.length > 0 && useCase.detection_logic.rules[0].xml_content ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.detection_logic.rules[0].xml_content}
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
                {useCase.detection_logic.decoders.length > 0 && useCase.detection_logic.decoders[0].xml_content ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.detection_logic.decoders[0].xml_content}
                  </div>
                ) : (
                  <Text type="secondary">No custom decoders configured</Text>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Agent Configuration">
                {useCase.detection_logic.agent_configuration?.xml_content ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {useCase.detection_logic.agent_configuration.xml_content}
                  </div>
                ) : (
                  <Text type="secondary">No agent configuration specified</Text>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Response Playbook" key="playbook">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              {/* Response Information from Enhanced Form */}
              <Card title="Response Information">
                <Descriptions column={1} size="middle">
                  {enhancedData?.response_priority && (
                    <Descriptions.Item label="Priority">
                      <Tag color={getSeverityColor(enhancedData.response_priority)}>
                        {enhancedData.response_priority}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  {enhancedData?.escalation_contact && (
                    <Descriptions.Item label="Escalation Contact">
                      <Text strong>{enhancedData.escalation_contact}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Response Actions from Enhanced Form */}
              <Card title="Response Actions" style={{ marginTop: 16 }}>
                {enhancedData?.response_actions ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}>
                    {enhancedData.response_actions}
                  </div>
                ) : (
                  <Text type="secondary">No response actions defined</Text>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              {/* Automation Script from Enhanced Form */}
              <Card title="Automation Script">
                {enhancedData?.automation_script ? (
                  <div style={{
                    background: 'var(--bg-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {enhancedData.automation_script}
                  </div>
                ) : (
                  <Text type="secondary">No automation script configured</Text>
                )}
              </Card>

              {/* Legacy playbook support */}
              {useCase.response_playbook.immediate_actions.length > 0 && (
                <Card title="Immediate Actions (Legacy)" style={{ marginTop: 16 }}>
                  <Timeline size="small">
                    {useCase.response_playbook.immediate_actions.map((action, index) => (
                      <Timeline.Item key={index}>
                        {action}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              )}
            </Col>
          </Row>

          {/* Legacy sections if they have content */}
          {(useCase.response_playbook.investigation_steps.length > 0 || useCase.response_playbook.containment.length > 0) && (
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              {useCase.response_playbook.investigation_steps.length > 0 && (
                <Col xs={24} lg={12}>
                  <Card title="Investigation Steps (Legacy)">
                    <Timeline size="small">
                      {useCase.response_playbook.investigation_steps.map((step, index) => (
                        <Timeline.Item key={index}>
                          {step}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                </Col>
              )}

              {useCase.response_playbook.containment.length > 0 && (
                <Col xs={24} lg={12}>
                  <Card title="Containment Actions (Legacy)">
                    <Timeline size="small">
                      {useCase.response_playbook.containment.map((action, index) => (
                        <Timeline.Item key={index}>
                          {action}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </TabPane>

        <TabPane tab="Metrics & Testing" key="metrics">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Performance Metrics" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Alerts Generated">
                    {useCase.metrics.alerts_generated}
                  </Descriptions.Item>
                  <Descriptions.Item label="True Positives">
                    {useCase.metrics.true_positives}
                  </Descriptions.Item>
                  <Descriptions.Item label="False Positives">
                    {useCase.metrics.false_positives}
                  </Descriptions.Item>
                  <Descriptions.Item label="Precision">
                    {(useCase.metrics.precision * 100).toFixed(1)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Triggered">
                    {useCase.metrics.last_triggered 
                      ? new Date(useCase.metrics.last_triggered).toLocaleString()
                      : 'Never'
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Testing Status" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Validation Status">
                    <Tag color={useCase.testing.validation_status === 'passed' ? 'success' : 'warning'}>
                      {useCase.testing.validation_status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Tested">
                    {useCase.testing.last_tested 
                      ? new Date(useCase.testing.last_tested).toLocaleString()
                      : 'Never'
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="Test Cases">
                    {useCase.testing.test_cases.length}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {useCase.testing.test_cases.length > 0 && (
            <Card title="Test Cases" style={{ marginTop: 24 }}>
              {useCase.testing.test_cases.map((testCase, index) => (
                <Card key={index} type="inner" title={testCase.name} size="small">
                  <Text strong>Input Log:</Text>
                  <Paragraph code copyable>
                    {testCase.input_log}
                  </Paragraph>
                  <Text strong>Expected Alert:</Text> {testCase.expected_alert ? 'Yes' : 'No'}
                  {testCase.alert_level && (
                    <>
                      <br />
                      <Text strong>Alert Level:</Text> {testCase.alert_level}
                    </>
                  )}
                </Card>
              ))}
            </Card>
          )}
        </TabPane>

        <TabPane tab="Deployment" key="deployment">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Deployment Status" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Status">
                    <Tag color={useCase.deployment.deployment_status === 'deployed' ? 'success' : 'default'}>
                      {useCase.deployment.deployment_status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Deployment Date">
                    {useCase.deployment.deployment_date 
                      ? new Date(useCase.deployment.deployment_date).toLocaleString()
                      : 'Not deployed'
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="Rollback Available">
                    <Tag color={useCase.deployment.rollback_available ? 'success' : 'default'}>
                      {useCase.deployment.rollback_available ? 'Yes' : 'No'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Target Groups">
                    <Space wrap>
                      {useCase.deployment.target_groups.map(group => (
                        <Tag key={group}>{group}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Enrichment Settings" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="VirusTotal Integration">
                    <Tag color={useCase.enrichment.threat_intelligence.virustotal_integration ? 'success' : 'default'}>
                      {useCase.enrichment.threat_intelligence.virustotal_integration ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="AbuseIPDB Lookup">
                    <Tag color={useCase.enrichment.threat_intelligence.abuseipdb_lookup ? 'success' : 'default'}>
                      {useCase.enrichment.threat_intelligence.abuseipdb_lookup ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Geolocation">
                    <Tag color={useCase.enrichment.context_data.geolocation ? 'success' : 'default'}>
                      {useCase.enrichment.context_data.geolocation ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="ASN Lookup">
                    <Tag color={useCase.enrichment.context_data.asn_lookup ? 'success' : 'default'}>
                      {useCase.enrichment.context_data.asn_lookup ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UseCaseDetail;