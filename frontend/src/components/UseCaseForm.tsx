import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  message,
  Collapse,
  Steps,
  Typography,
  Alert,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Shield, Target, Activity, BookOpen, Settings, Code, Play, User, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCasesApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import type { FormInstance } from 'antd/es/form';

const { Title, Text } = Typography;

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface UseCaseFormProps {
  initialValues?: any;
  isEditing?: boolean;
  useCaseId?: string;
  onCancel?: () => void;
}

const UseCaseForm: React.FC<UseCaseFormProps> = ({
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
      // Prepare simplified data for the backend
      const formData = {
        name: values.name,
        description: values.description,
        author: values.author || 'Anonymous',
        version: values.version || '1.0.0',
        tags: values.tags || [],
        
        // Classification
        platform: values.platform || [],
        severity: values.severity || 'medium',
        confidence: values.confidence || 'medium',
        false_positive_rate: values.false_positive_rate || 'low',
        maturity: values.maturity || 'draft',
        
        // Detection logic
        rules_xml: values.rules_xml || '',
        decoders_xml: values.decoders_xml || '',
        agent_config_xml: values.agent_config_xml || '',
        
        // Response playbook
        immediate_actions: values.immediate_actions || [],
        investigation_steps: values.investigation_steps || [],
        containment_steps: values.containment_steps || [],
      };

      if (isEditing && useCaseId) {
        // Update existing use case
        return useCasesApi.updateSimple(useCaseId, formData);
      } else {
        // Create new use case
        return useCasesApi.createSimple(formData);
      }
    },
    onSuccess: () => {
      message.success(`Use case ${isEditing ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['usecases'] });
      queryClient.invalidateQueries({ queryKey: ['usecases-count'] }); // Update navigation count
      queryClient.invalidateQueries({ queryKey: ['usecase', useCaseId] });
      navigate('/usecases');
    },
    onError: (error) => {
      console.error(`${isEditing ? 'Update' : 'Create'} error:`, error);
      message.error(`Failed to ${isEditing ? 'update' : 'create'} use case. Please try again.`);
    },
  });

  const onFinish = (values: any) => {
    submitMutation.mutate(values);
  };

  // Set initial values when they are provided
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              margin: 0,
              color: '#1890ff'
            }}>
              {isEditing ? 'Edit Use Case & Playbook' : 'Create New Use Case & Playbook'}
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666',
              fontSize: '14px'
            }}>
              {isEditing ? 
                'Modify your Wazuh detection use case and response playbook' : 
                'Create a comprehensive Wazuh detection use case with integrated response playbook'
              }
            </p>
          </div>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
          scrollToFirstError
        >
          {/* Basic Information */}
          <Card size="small" title="Basic Information" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Use Case Name"
                  name="name"
                  rules={[{ required: true, message: 'Name is required' }]}
                >
                  <Input placeholder="Enter use case name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Author"
                  name="author"
                  rules={[{ required: true, message: 'Author is required' }]}
                >
                  <Input placeholder="Your name or team" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <TextArea
                rows={3}
                placeholder="Describe what this use case detects and why it's important"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Version" name="version">
                  <Input placeholder="1.0.0" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="Tags" name="tags">
                  <Select
                    mode="tags"
                    placeholder="Add tags (e.g., malware, network, authentication)"
                    tokenSeparators={[',']}
                  >
                    <Option value="malware">Malware</Option>
                    <Option value="network">Network</Option>
                    <Option value="authentication">Authentication</Option>
                    <Option value="privilege-escalation">Privilege Escalation</Option>
                    <Option value="data-exfiltration">Data Exfiltration</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Classification */}
          <Card size="small" title="Classification" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Severity" name="severity">
                  <Select defaultValue="medium">
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                    <Option value="critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Confidence" name="confidence">
                  <Select defaultValue="medium">
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                    <Option value="critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Maturity" name="maturity">
                  <Select defaultValue="draft">
                    <Option value="draft">Draft</Option>
                    <Option value="testing">Testing</Option>
                    <Option value="production">Production</Option>
                    <Option value="deprecated">Deprecated</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Platform" name="platform">
              <Select mode="multiple" placeholder="Select target platforms">
                <Option value="windows">Windows</Option>
                <Option value="linux">Linux</Option>
                <Option value="macos">macOS</Option>
                <Option value="network">Network</Option>
                <Option value="cloud">Cloud</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Detection Logic */}
          <Collapse style={{ marginBottom: 16 }}>
            <Panel header="Detection Logic (Optional)" key="detection">
              <Form.Item
                label="Wazuh Rules XML"
                name="rules_xml"
                help="Paste your Wazuh detection rules in XML format"
              >
                <TextArea
                  rows={6}
                  placeholder="<group name='custom_rules'>
  <rule id='100001' level='5'>
    <description>Example rule description</description>
    <!-- Add your rule logic here -->
  </rule>
</group>"
                />
              </Form.Item>

              <Form.Item
                label="Decoders XML (Optional)"
                name="decoders_xml"
                help="Custom decoders for log parsing"
              >
                <TextArea
                  rows={4}
                  placeholder="<decoder name='example'>
  <!-- Add your decoder logic here -->
</decoder>"
                />
              </Form.Item>

              <Form.Item
                label="Agent Configuration (Optional)"
                name="agent_config_xml"
                help="Configuration for Wazuh agents"
              >
                <TextArea
                  rows={4}
                  placeholder="<agent_config>
  <!-- Add agent configuration here -->
</agent_config>"
                />
              </Form.Item>
            </Panel>
          </Collapse>

          {/* Response Playbook */}
          <Card size="small" title="Response Playbook" style={{ marginBottom: 16 }}>
            <Form.Item label="Immediate Actions" help="What should be done immediately when this alert triggers?">
              <Form.List name="immediate_actions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...field}
                          style={{ flex: 1, marginBottom: 0 }}
                          rules={[{ required: true, message: 'Action is required' }]}
                        >
                          <Input placeholder={`Immediate action ${index + 1}`} />
                        </Form.Item>
                        <DeleteOutlined onClick={() => remove(field.name)} />
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Immediate Action
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item label="Investigation Steps" help="How should security analysts investigate this alert?">
              <Form.List name="investigation_steps">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...field}
                          style={{ flex: 1, marginBottom: 0 }}
                          rules={[{ required: true, message: 'Step is required' }]}
                        >
                          <Input placeholder={`Investigation step ${index + 1}`} />
                        </Form.Item>
                        <DeleteOutlined onClick={() => remove(field.name)} />
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Investigation Step
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item label="Containment Actions" help="How should the threat be contained?">
              <Form.List name="containment_steps">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...field}
                          style={{ flex: 1, marginBottom: 0 }}
                          rules={[{ required: true, message: 'Action is required' }]}
                        >
                          <Input placeholder={`Containment action ${index + 1}`} />
                        </Form.Item>
                        <DeleteOutlined onClick={() => remove(field.name)} />
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Containment Action
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </Card>

          {/* Submit Buttons */}
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitMutation.isPending}
                icon={<SaveOutlined />}
              >
                {isEditing ? 'Update' : 'Create'} Use Case & Playbook
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UseCaseForm;