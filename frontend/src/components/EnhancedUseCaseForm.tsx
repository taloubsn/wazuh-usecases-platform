import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  message,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Shield, Target, Activity, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCasesApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface EnhancedUseCaseFormProps {
  initialValues?: any;
  isEditing?: boolean;
  useCaseId?: string;
  onCancel?: () => void;
}

const EnhancedUseCaseForm: React.FC<EnhancedUseCaseFormProps> = ({
  initialValues,
  isEditing = false,
  useCaseId,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form submission mutation
  const submitMutation = useMutation({
    mutationFn: (values: any) => {
      const formData = {
        name: values.name,
        description: values.description,
        author: values.author || 'Anonymous',
        version: values.version || '1.0.0',
        tags: values.tags || [],
        platform: values.platform || [],
        severity: values.severity || 'medium',
        maturity: values.maturity || 'draft',
        mitre_tactics: values.mitre_tactics || [],
        mitre_techniques: values.mitre_techniques || [],
        wazuh_rule_id: values.wazuh_rule_id || '',
        cve: values.cve || [],
        cvss_score: values.cvss_score || null,
        false_positive_rate: values.false_positive_rate || 'low',
        rules_xml: values.rules_xml || '',
        decoders_xml: values.decoders_xml || '',
        agent_config_xml: values.agent_config_xml || '',
        response_actions: values.response_actions || '',
        automation_script: values.automation_script || '',
        escalation_contact: values.escalation_contact || '',
        response_priority: values.response_priority || 'medium',
      };

      if (isEditing && useCaseId) {
        return useCasesApi.updateSimple(useCaseId, formData);
      } else {
        return useCasesApi.createSimple(formData);
      }
    },
    onSuccess: () => {
      message.success(`Use case ${isEditing ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['usecases'] });
      queryClient.invalidateQueries({ queryKey: ['usecases-count'] }); // Update navigation count
      navigate('/usecases');
    },
    onError: (error: any) => {
      console.error('Form submission error:', error);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} use case. Please try again.`);
    },
  });

  const onFinish = (values: any) => {
    submitMutation.mutate(values);
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/usecases');
    }
  };

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: '24px',
      minHeight: 'calc(100vh - 64px)',
      overflow: 'visible'
    }}>
      {/* Enhanced Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 24 
        }}>
          <div>
            <Title level={1} style={{ 
              margin: 0,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '32px',
              fontWeight: 700
            }}>
              {isEditing ? 'Edit Use Case' : 'Create New Use Case'}
            </Title>
            <Text style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
              {isEditing ? 
                'Modify your Wazuh detection use case and response playbook' : 
                'Build a comprehensive detection rule with automated response capabilities'
              }
            </Text>
          </div>
          <Space>
            <Button 
              icon={<SaveOutlined />} 
              onClick={() => form.submit()}
              loading={submitMutation.isPending}
              type="primary"
              size="large"
            >
              {isEditing ? 'Update' : 'Create'} Use Case
            </Button>
            <Button 
              icon={<CloseOutlined />} 
              onClick={handleCancel}
              size="large"
            >
              Cancel
            </Button>
          </Space>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        scrollToFirstError
        style={{ overflow: 'visible' }}
      >
        {/* Basic Information */}
        <Card 
          title={
            <Space>
              <Shield size={20} color="var(--primary)" />
              <span>Basic Information</span>
            </Space>
          }
          style={{ marginBottom: 24, overflow: 'visible' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Use Case Name"
                name="name"
                rules={[{ required: true, message: 'Use case name is required' }]}
                tooltip="A clear, descriptive name for your detection use case"
              >
                <Input 
                  placeholder="e.g., Suspicious PowerShell Execution" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Author"
                name="author"
                rules={[{ required: true, message: 'Author is required' }]}
                tooltip="Your name or team responsible for this use case"
              >
                <Input 
                  placeholder="e.g., SOC Team Alpha" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Description is required' }]}
            tooltip="Detailed explanation of what this use case detects and its importance"
          >
            <TextArea
              rows={4}
              placeholder="Describe the threat this use case detects, why it's important, and what attackers might be trying to achieve..."
              style={{ fontSize: '14px', lineHeight: '1.6' }}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item 
                label="Version" 
                name="version"
                tooltip="Semantic versioning (e.g., 1.0.0)"
              >
                <Input placeholder="1.0.0" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item 
                label="Tags" 
                name="tags"
                tooltip="Keywords to help categorize and search for this use case"
              >
                <Select
                  mode="tags"
                  placeholder="Add tags (e.g., powershell, lateral-movement, persistence)"
                  style={{ width: '100%' }}
                  size="large"
                  tokenSeparators={[',', ' ']}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Classification & Platforms */}
        <Card 
          title={
            <Space>
              <Target size={20} color="var(--warning)" />
              <span>Classification & Platforms</span>
            </Space>
          }
          style={{ marginBottom: 24, overflow: 'visible' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Severity Level"
                name="severity"
                rules={[{ required: true, message: 'Severity is required' }]}
                tooltip="Impact level of the threat this use case detects"
              >
                <Select placeholder="Select severity" size="large">
                  <Select.Option value="low">
                    <Space>
                      <Shield size={14} color="var(--info)" />
                      Low - Informational
                    </Space>
                  </Select.Option>
                  <Select.Option value="medium">
                    <Space>
                      <Activity size={14} color="#ffd700" />
                      Medium - Suspicious
                    </Space>
                  </Select.Option>
                  <Select.Option value="high">
                    <Space>
                      <Target size={14} color="var(--warning)" />
                      High - Likely Threat
                    </Space>
                  </Select.Option>
                  <Select.Option value="critical">
                    <Space>
                      <Target size={14} color="var(--danger)" />
                      Critical - Active Attack
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Maturity Status"
                name="maturity"
                rules={[{ required: true, message: 'Maturity status is required' }]}
                tooltip="Development and testing status of this use case"
              >
                <Select placeholder="Select maturity" size="large">
                  <Select.Option value="draft">Draft - In Development</Select.Option>
                  <Select.Option value="testing">Testing - Under Review</Select.Option>
                  <Select.Option value="production">Production - Ready to Deploy</Select.Option>
                  <Select.Option value="deprecated">Deprecated - Retired</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="False Positive Rate"
                name="false_positive_rate"
                tooltip="Expected rate of false positive alerts"
              >
                <Select placeholder="Select FP rate" size="large">
                  <Select.Option value="very_low">Very Low (&lt;1%)</Select.Option>
                  <Select.Option value="low">Low (1-5%)</Select.Option>
                  <Select.Option value="medium">Medium (5-15%)</Select.Option>
                  <Select.Option value="high">High (&gt;15%)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24}>
              <Form.Item
                label="Target Platforms"
                name="platform"
                tooltip="Select all platforms this use case applies to"
              >
                <Select
                  mode="multiple"
                  placeholder="Select platforms"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Select.OptGroup label="Windows">
                    <Select.Option value="windows_workstation">🖥️ Windows Workstation</Select.Option>
                    <Select.Option value="windows_server">🏢 Windows Server</Select.Option>
                  </Select.OptGroup>
                  <Select.OptGroup label="Unix/Linux">
                    <Select.Option value="linux">🐧 Linux</Select.Option>
                    <Select.Option value="macos">🍎 macOS</Select.Option>
                  </Select.OptGroup>
                  <Select.OptGroup label="Infrastructure">
                    <Select.Option value="network_devices">🔧 Network Devices</Select.Option>
                    <Select.Option value="containers">📦 Containers</Select.Option>
                    <Select.Option value="cloud">☁️ Cloud</Select.Option>
                  </Select.OptGroup>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* MITRE ATT&CK Mapping */}
        <Card
          title={
            <Space>
              <Target size={20} color="var(--danger)" />
              <span>MITRE ATT&CK Mapping</span>
            </Space>
          }
          style={{ marginBottom: 24, overflow: 'visible' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="MITRE ATT&CK Tactics"
                name="mitre_tactics"
                tooltip="Select applicable MITRE ATT&CK tactics"
              >
                <Select
                  mode="multiple"
                  placeholder="Select MITRE tactics"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Select.Option value="TA0001">TA0001 - Initial Access</Select.Option>
                  <Select.Option value="TA0002">TA0002 - Execution</Select.Option>
                  <Select.Option value="TA0003">TA0003 - Persistence</Select.Option>
                  <Select.Option value="TA0004">TA0004 - Privilege Escalation</Select.Option>
                  <Select.Option value="TA0005">TA0005 - Defense Evasion</Select.Option>
                  <Select.Option value="TA0006">TA0006 - Credential Access</Select.Option>
                  <Select.Option value="TA0007">TA0007 - Discovery</Select.Option>
                  <Select.Option value="TA0008">TA0008 - Lateral Movement</Select.Option>
                  <Select.Option value="TA0009">TA0009 - Collection</Select.Option>
                  <Select.Option value="TA0010">TA0010 - Exfiltration</Select.Option>
                  <Select.Option value="TA0011">TA0011 - Command and Control</Select.Option>
                  <Select.Option value="TA0040">TA0040 - Impact</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="MITRE ATT&CK Techniques"
                name="mitre_techniques"
                tooltip="Enter MITRE technique IDs (e.g., T1059.001)"
              >
                <Select
                  mode="tags"
                  placeholder="Enter technique IDs (e.g., T1059.001, T1078.004)"
                  size="large"
                  style={{ width: '100%' }}
                  tokenSeparators={[',', ' ']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Wazuh Rule ID"
                name="wazuh_rule_id"
                tooltip="Format: [PLATFORM]-[TACTIC]-[NUMBER] (e.g., LIN-CRED-001, WIN-EXEC-042)"
              >
                <Input
                  placeholder="e.g., WIN-EXEC-001, LIN-CRED-005, NET-DISC-003"
                  size="large"
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="CVE References"
                name="cve"
                tooltip="Associated CVE identifiers if applicable"
              >
                <Select
                  mode="tags"
                  placeholder="Enter CVE IDs (e.g., CVE-2023-1234)"
                  size="large"
                  style={{ width: '100%' }}
                  tokenSeparators={[',', ' ']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="CVSS Score"
                name="cvss_score"
                tooltip="Common Vulnerability Scoring System score (0.0 - 10.0)"
              >
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  placeholder="e.g., 7.5"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <div style={{ padding: '8px 0' }}>
                <Text strong>Rule ID Format Guide:</Text><br/>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • WIN: Windows (WS=Workstation, SRV=Server)<br/>
                  • LIN: Linux • MAC: macOS • NET: Network<br/>
                  • CON: Container • CLD: Cloud<br/>
                  • EXEC: Execution • CRED: Credential Access<br/>
                  • PERS: Persistence • PRIV: Privilege Escalation
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Detection Logic */}
        <Card 
          title={
            <Space>
              <Settings size={20} color="var(--success)" />
              <span>Detection Logic (Optional)</span>
            </Space>
          }
          style={{ marginBottom: 24, overflow: 'visible' }}
        >
          <Form.Item
            label="Wazuh Rules (XML)"
            name="rules_xml"
            tooltip="XML format Wazuh detection rules"
          >
            <TextArea
              rows={6}
              placeholder={`<rule id="12345" level="10" frequency="6" timeframe="120">
  <if_matched_sid>5716</if_matched_sid>
  <description>Suspicious activity detected</description>
</rule>`}
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Form.Item>

          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Custom Decoders (XML)"
                name="decoders_xml"
                tooltip="XML format custom decoders for log parsing"
              >
                <TextArea
                  rows={4}
                  placeholder={`<decoder name="custom-decoder">
  <parent>ossec</parent>
  <regex>^(\\S+) (\\S+)</regex>
  <order>srcip,user</order>
</decoder>`}
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Agent Configuration (XML)"
                name="agent_config_xml"
                tooltip="Agent-specific configuration"
              >
                <TextArea
                  rows={4}
                  placeholder={`<agent_config os="windows">
  <localfile>
    <location>Security</location>
    <log_format>eventchannel</log_format>
  </localfile>
</agent_config>`}
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Response Playbook */}
        <Card 
          title={
            <Space>
              <Activity size={20} color="var(--secondary)" />
              <span>Response Playbook (Optional)</span>
            </Space>
          }
          style={{ marginBottom: 24, overflow: 'visible' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Response Priority"
                name="response_priority"
                tooltip="How urgently should this trigger be responded to"
              >
                <Select placeholder="Select priority" size="large">
                  <Select.Option value="low">Low - Monitor</Select.Option>
                  <Select.Option value="medium">Medium - Investigate</Select.Option>
                  <Select.Option value="high">High - Immediate Action</Select.Option>
                  <Select.Option value="critical">Critical - Emergency Response</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Escalation Contact"
                name="escalation_contact"
                tooltip="Who should be notified for this type of incident"
              >
                <Input 
                  placeholder="e.g., soc-team@company.com" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Response Actions"
            name="response_actions"
            tooltip="Step-by-step actions to take when this use case triggers"
          >
            <TextArea
              rows={6}
              placeholder={`1. Isolate affected endpoint
2. Collect forensic artifacts
3. Analyze suspicious files
4. Document findings
5. Report to management`}
              style={{ fontSize: '14px', lineHeight: '1.6' }}
              showCount
              maxLength={2000}
            />
          </Form.Item>
          
          <Form.Item
            label="Automated Script (Optional)"
            name="automation_script"
            tooltip="PowerShell, Python, or bash script for automated response"
          >
            <TextArea
              rows={6}
              placeholder={`# Example PowerShell script
# Stop-Process -Name suspicious_process
# Get-WinEvent -LogName Security | Where-Object {$_.Id -eq 4624}`}
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Form.Item>
        </Card>

        {/* Form Actions */}
        <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 32 }}>
          <Space size="large">
            <Button onClick={handleCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitMutation.isPending}
              icon={<SaveOutlined />}
              size="large"
              style={{ minWidth: '160px' }}
            >
              {isEditing ? 'Update Use Case' : 'Create Use Case'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default EnhancedUseCaseForm;