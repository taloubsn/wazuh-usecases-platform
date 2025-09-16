import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Divider,
  Typography,
  Row,
  Col,
  InputNumber,
  message,
  Alert
} from 'antd';
import {
  SettingOutlined,
  SecurityScanOutlined,
  ApiOutlined,
  BellOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Settings: React.FC = () => {
  const [generalForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [wazuhForm] = Form.useForm();
  const [notificationsForm] = Form.useForm();
  const { themeMode, toggleTheme } = useTheme();

  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      theme: themeMode,
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      itemsPerPage: 20,
      autoRefresh: true,
      refreshInterval: 30
    },
    security: {
      sessionTimeout: 60,
      requireMFA: false,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      auditLogs: true
    },
    wazuh: {
      apiUrl: 'https://wazuh.company.com:55000',
      username: 'wazuh-user',
      password: '********',
      timeout: 10,
      retryAttempts: 3,
      useSSL: true
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: false,
      alertSeverity: 'medium',
      dailyReport: true,
      weeklyReport: false
    }
  });

  const handleSave = (section: string, values: any) => {
    if (section === 'general' && values.theme && values.theme !== themeMode) {
      // Si le thème change, appliquer le changement immédiatement
      toggleTheme();
    }

    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...values }
    }));
    message.success(`Paramètres ${section} sauvegardés`);
  };

  // Synchroniser le thème avec les settings
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, theme: themeMode }
    }));
    generalForm.setFieldsValue({ theme: themeMode });
  }, [themeMode, generalForm]);

  const testWazuhConnection = () => {
    message.loading('Test de connexion...', 2);
    setTimeout(() => {
      message.success('Connexion réussie !');
    }, 2000);
  };

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <SettingOutlined />
          Général
        </span>
      ),
      children: (
        <Card>
          <Form
            form={generalForm}
            layout="vertical"
            initialValues={settings.general}
            onFinish={(values) => handleSave('general', values)}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Thème" name="theme">
                  <Select>
                    <Option value="light">Clair</Option>
                    <Option value="dark">Sombre</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Langue" name="language">
                  <Select>
                    <Option value="fr">Français</Option>
                    <Option value="en">English</Option>
                    <Option value="es">Español</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Fuseau horaire" name="timezone">
                  <Select>
                    <Option value="Europe/Paris">Europe/Paris</Option>
                    <Option value="UTC">UTC</Option>
                    <Option value="America/New_York">America/New_York</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Format de date" name="dateFormat">
                  <Select>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Éléments par page" name="itemsPerPage">
                  <InputNumber min={10} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Intervalle de rafraîchissement (secondes)" name="refreshInterval">
                  <InputNumber min={5} max={300} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="autoRefresh" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Rafraîchissement automatique</span>
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Sauvegarder
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined />
          Sécurité
        </span>
      ),
      children: (
        <Card>
          <Alert
            message="Paramètres de sécurité"
            description="Ces paramètres affectent la sécurité de votre compte et de la plateforme."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={securityForm}
            layout="vertical"
            initialValues={settings.security}
            onFinish={(values) => handleSave('security', values)}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Timeout de session (minutes)" name="sessionTimeout">
                  <InputNumber min={15} max={480} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Tentatives de connexion max" name="maxLoginAttempts">
                  <InputNumber min={3} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Expiration du mot de passe (jours)" name="passwordExpiry">
              <InputNumber min={0} max={365} style={{ width: '100%' }} />
              <Text type="secondary">0 = jamais</Text>
            </Form.Item>

            <Form.Item name="requireMFA" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Authentification multifacteur obligatoire</span>
            </Form.Item>

            <Form.Item name="auditLogs" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Logs d'audit détaillés</span>
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Sauvegarder
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'wazuh',
      label: (
        <span>
          <ApiOutlined />
          API Wazuh
        </span>
      ),
      children: (
        <Card>
          <Form
            form={wazuhForm}
            layout="vertical"
            initialValues={settings.wazuh}
            onFinish={(values) => handleSave('wazuh', values)}
          >
            <Form.Item
              label="URL de l'API Wazuh"
              name="apiUrl"
              rules={[{ required: true, message: "L'URL est requise" }]}
            >
              <Input placeholder="https://wazuh.company.com:55000" />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Nom d'utilisateur"
                  name="username"
                  rules={[{ required: true, message: "Le nom d'utilisateur est requis" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Mot de passe"
                  name="password"
                  rules={[{ required: true, message: "Le mot de passe est requis" }]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Timeout (secondes)" name="timeout">
                  <InputNumber min={5} max={60} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Tentatives de retry" name="retryAttempts">
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="useSSL" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Utiliser SSL/TLS</span>
            </Form.Item>

            <Divider />

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="default"
                onClick={testWazuhConnection}
                style={{ marginRight: 8 }}
              >
                Tester la connexion
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Sauvegarder
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card>
          <Form
            form={notificationsForm}
            layout="vertical"
            initialValues={settings.notifications}
            onFinish={(values) => handleSave('notifications', values)}
          >
            <Title level={5}>Alertes</Title>

            <Form.Item name="emailAlerts" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Alertes par email</span>
            </Form.Item>

            <Form.Item name="pushNotifications" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Notifications push</span>
            </Form.Item>

            <Form.Item label="Seuil de sévérité minimum" name="alertSeverity">
              <Select>
                <Option value="low">Faible</Option>
                <Option value="medium">Moyen</Option>
                <Option value="high">Élevé</Option>
                <Option value="critical">Critique</Option>
              </Select>
            </Form.Item>

            <Divider />

            <Title level={5}>Rapports</Title>

            <Form.Item name="dailyReport" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Rapport quotidien</span>
            </Form.Item>

            <Form.Item name="weeklyReport" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              <span style={{ marginLeft: 8 }}>Rapport hebdomadaire</span>
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Sauvegarder
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Paramètres
      </Title>

      <Tabs
        defaultActiveKey="general"
        items={tabItems}
        size="large"
        style={{ minHeight: 500 }}
      />
    </div>
  );
};

export default Settings;