import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);

    try {
      // Simuler une authentification simple
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Credentials simples pour la démo
      if (values.username === 'admin' && values.password === 'admin') {
        // Stocker l'état de connexion
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          id: 'admin001',
          username: 'admin',
          email: 'admin@company.com',
          fullName: 'Administrateur Système',
          role: 'Super Admin'
        }));

        message.success('Connexion réussie !');
        navigate('/');
      } else {
        message.error('Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #141829 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#141829',
          border: '1px solid #2a3050',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
        bodyStyle={{ padding: 32 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Shield size={32} color="#00d4ff" />
          </div>
          <Title level={3} style={{ color: '#e4e4e7', margin: 0 }}>
            Wazuh SOC Platform
          </Title>
          <Text style={{ color: '#9ca3af' }}>
            Connectez-vous à votre compte
          </Text>
        </div>

        {/* Login Form */}
        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Veuillez saisir votre nom d\'utilisateur' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Nom d'utilisateur"
              style={{
                background: '#0a0e27',
                border: '1px solid #2a3050',
                borderRadius: 8,
                color: '#e4e4e7'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Mot de passe"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{
                background: '#0a0e27',
                border: '1px solid #2a3050',
                borderRadius: 8,
                color: '#e4e4e7'
              }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox style={{ color: '#9ca3af' }}>
              Se souvenir de moi
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                border: 'none',
                borderRadius: 8,
                height: 44,
                fontWeight: 600
              }}
            >
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Info */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#0a0e27',
          borderRadius: 8,
          border: '1px solid #2a3050'
        }}>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            <strong>Démo:</strong> Utilisez "admin" / "admin" pour vous connecter
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;