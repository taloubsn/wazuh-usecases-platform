import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Checkbox,
  Alert,
  Spin,
  Card,
  Tag,
  Descriptions,
  Typography,
  Space,
  message,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { enrichmentApi } from '@/services/api';

const { Text, Title } = Typography;
const { Option } = Select;

interface IOCEnrichmentModalProps {
  visible: boolean;
  onCancel: () => void;
}

const IOCEnrichmentModal: React.FC<IOCEnrichmentModalProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState<any>(null);

  const handleEnrich = async (values: any) => {
    setLoading(true);
    try {
      const result = await enrichmentApi.enrichIOC(
        values.ioc,
        values.ioc_type,
        values.services
      );
      setEnrichmentResult(result);
      message.success('IOC enriched successfully!');
    } catch (error: any) {
      message.error(`Enrichment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEnrichmentResult(null);
    form.resetFields();
    onCancel();
  };

  const getReputationColor = (reputation: string) => {
    switch (reputation?.toLowerCase()) {
      case 'clean':
      case 'safe':
        return 'green';
      case 'malicious':
      case 'malware':
        return 'red';
      case 'suspicious':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 90) return { color: 'green', text: 'High' };
    if (confidence >= 70) return { color: 'orange', text: 'Medium' };
    if (confidence >= 50) return { color: 'gold', text: 'Low' };
    return { color: 'red', text: 'Very Low' };
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SearchOutlined />
          <span>IOC Enrichment</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      <div style={{ marginBottom: 24 }}>
        <Alert
          message="IOC Enrichment"
          description="Analyze Indicators of Compromise (IOCs) using configured threat intelligence services to get reputation, context and additional security information."
          type="info"
          showIcon
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleEnrich}
      >
        <Form.Item
          label="IOC Value"
          name="ioc"
          rules={[{ required: true, message: 'Please enter an IOC to analyze' }]}
        >
          <Input
            placeholder="Enter IP address, domain, URL, or file hash"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="IOC Type"
          name="ioc_type"
          rules={[{ required: true, message: 'Please select IOC type' }]}
        >
          <Select placeholder="Select IOC type" size="large">
            <Option value="ip">IP Address</Option>
            <Option value="domain">Domain</Option>
            <Option value="url">URL</Option>
            <Option value="hash">File Hash</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Enrichment Services"
          name="services"
        >
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="virustotal">VirusTotal</Checkbox>
              <Checkbox value="abuseipdb">AbuseIPDB</Checkbox>
              <Checkbox value="misp">MISP</Checkbox>
              <Checkbox value="otx">AlienVault OTX</Checkbox>
              <Checkbox value="urlvoid">URLVoid</Checkbox>
              <Checkbox value="shodan">Shodan</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>

        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SearchOutlined />}
            >
              Enrich IOC
            </Button>
          </Space>
        </div>
      </Form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Analyzing IOC with threat intelligence services...</Text>
          </div>
        </div>
      )}

      {enrichmentResult && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Enrichment Results</Title>

          <Card style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="IOC">{enrichmentResult.ioc}</Descriptions.Item>
              <Descriptions.Item label="Type">{enrichmentResult.ioc_type}</Descriptions.Item>
              <Descriptions.Item label="Analyzed at">{enrichmentResult.timestamp}</Descriptions.Item>
              <Descriptions.Item label="Services">
                {Object.keys(enrichmentResult.enrichment_results || {}).length}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Tabs defaultActiveKey="summary" size="small">
            <Tabs.TabPane tab="Summary" key="summary">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {Object.entries(enrichmentResult.enrichment_results || {}).map(([service, result]: [string, any]) => (
                  <Card key={service} size="small" style={{ minWidth: '300px', flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Title level={5} style={{ margin: 0, textTransform: 'capitalize' }}>
                        {service}
                      </Title>
                      <Tag color={result.status === 'success' ? 'green' : 'red'}>
                        {result.status}
                      </Tag>
                    </div>

                    {result.status === 'success' && result.data && (
                      <>
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>Reputation: </Text>
                          <Tag color={getReputationColor(result.data.reputation)}>
                            {result.data.reputation}
                          </Tag>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>Confidence: </Text>
                          <Tag color={getConfidenceLevel(result.data.confidence).color}>
                            {getConfidenceLevel(result.data.confidence).text} ({result.data.confidence}%)
                          </Tag>
                        </div>

                        {result.data.last_seen && (
                          <div style={{ marginBottom: '8px' }}>
                            <Text strong>Last Seen: </Text>
                            <Text type="secondary">{result.data.last_seen}</Text>
                          </div>
                        )}

                        {result.data.additional_info && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {result.data.additional_info}
                            </Text>
                          </div>
                        )}
                      </>
                    )}

                    {result.status !== 'success' && (
                      <Alert
                        message="Analysis Failed"
                        description={result.error || 'Service unavailable'}
                        type="error"
                        showIcon
                      />
                    )}
                  </Card>
                ))}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Raw Data" key="raw">
              <pre style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(enrichmentResult, null, 2)}
              </pre>
            </Tabs.TabPane>
          </Tabs>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="primary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default IOCEnrichmentModal;