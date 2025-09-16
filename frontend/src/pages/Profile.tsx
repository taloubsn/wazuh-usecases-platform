import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Typography,
  Divider,
  Row,
  Col,
  Switch,
  Timeline,
  message
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);

  // Mock user data - simple static data
  const [userProfile, setUserProfile] = useState({
    id: 'admin001',
    username: 'admin',
    email: 'admin@company.com',
    fullName: 'Administrateur Système',
    role: 'Super Admin',
    department: 'Cybersécurité',
    location: 'Paris, France',
    phone: '+33 1 23 45 67 89',
    joinDate: '2023-01-15',
    lastLogin: new Date().toLocaleString(),
    preferences: {
      emailNotifications: true,
      darkMode: true,
      language: 'fr'
    }
  });

  const handleSave = (values: any) => {
    setUserProfile({ ...userProfile, ...values });
    setEditing(false);
    message.success('Profil mis à jour avec succès');
  };

  const handleCancel = () => {
    form.setFieldsValue(userProfile);
    setEditing(false);
  };

  const activityData = [
    { time: '2 minutes ago', action: 'Login successful' },
    { time: '1 hour ago', action: 'Updated use case "SSH Brute Force"' },
    { time: '3 hours ago', action: 'Deployed 2 use cases' },
    { time: '1 day ago', action: 'Created new use case "Malware Detection"' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Profil Utilisateur
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          {/* Profile Card */}
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#1890ff',
                  marginBottom: 16
                }}
              />
              <Upload
                showUploadList={false}
                beforeUpload={() => {
                  message.info('Fonctionnalité upload à venir');
                  return false;
                }}
              >
                <Button icon={<CameraOutlined />} size="small">
                  Changer la photo
                </Button>
              </Upload>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                {userProfile.fullName}
              </Title>
              <Text type="secondary">{userProfile.role}</Text>
              <br />
              <Text type="secondary">{userProfile.department}</Text>
            </div>

            <Divider />

            <div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Email:</Text>
                <br />
                <Text>{userProfile.email}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Téléphone:</Text>
                <br />
                <Text>{userProfile.phone}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Localisation:</Text>
                <br />
                <Text>{userProfile.location}</Text>
              </div>
              <div>
                <Text strong>Membre depuis:</Text>
                <br />
                <Text>{new Date(userProfile.joinDate).toLocaleDateString()}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Edit Profile Card */}
          <Card
            title="Informations Personnelles"
            extra={
              !editing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditing(true);
                    form.setFieldsValue(userProfile);
                  }}
                >
                  Modifier
                </Button>
              ) : null
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={userProfile}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nom complet"
                    name="fullName"
                    rules={[{ required: true, message: 'Le nom est requis' }]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nom d'utilisateur"
                    name="username"
                    rules={[{ required: true, message: "Le nom d'utilisateur est requis" }]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'L\'email est requis' },
                      { type: 'email', message: 'Email invalide' }
                    ]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Téléphone"
                    name="phone"
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Département"
                    name="department"
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Localisation"
                    name="location"
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                  <Button
                    onClick={handleCancel}
                    style={{ marginRight: 8 }}
                    icon={<CloseOutlined />}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                  >
                    Sauvegarder
                  </Button>
                </div>
              )}
            </Form>
          </Card>

          {/* Recent Activity */}
          <Card title="Activité Récente" style={{ marginTop: 24 }}>
            <Timeline>
              {activityData.map((item, index) => (
                <Timeline.Item key={index}>
                  <div>
                    <Text strong>{item.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.time}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;