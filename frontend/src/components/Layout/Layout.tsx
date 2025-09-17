import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Input, Badge, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import {
  DashboardOutlined,
  FileTextOutlined,
  SearchOutlined,
  GlobalOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  BellOutlined,
  SafetyOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { Shield, Activity, Eye } from 'lucide-react';
import { useCasesApi } from '@/services/api';
import type { MenuProps } from 'antd';

const { Search } = Input;

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme, isDark } = useTheme();

  // Fetch use cases count for navigation badge
  const { data: useCases } = useQuery({
    queryKey: ['usecases-count'],
    queryFn: () => useCasesApi.getAll({ limit: 1000 }), // Get all to count
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const useCasesCount = useCases?.length || 0;

  // Enhanced menu items with categories
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      type: 'divider',
    },
    {
      key: 'detection',
      label: !collapsed ? 'Detection & Response' : '',
      type: 'group',
      children: [
        {
          key: '/usecases',
          icon: <FileTextOutlined />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Use Cases</span>
              <Badge count={useCasesCount} size="small" style={{ backgroundColor: 'var(--primary)' }} />
            </div>
          ),
          onClick: () => navigate('/usecases'),
        },
        {
          key: '/search',
          icon: <SearchOutlined />,
          label: 'Advanced Search',
          onClick: () => navigate('/search'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'management',
      label: !collapsed ? 'Management' : '',
      type: 'group',
      children: [
        {
          key: '/wazuh',
          icon: <SettingOutlined />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Wazuh Status</span>
              <Eye size={12} color="var(--info)" />
            </div>
          ),
          onClick: () => navigate('/wazuh'),
        },
        {
          key: '/enrichment',
          icon: <SafetyOutlined />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Enrichment Settings</span>
              <Shield size={12} color="var(--secondary)" />
            </div>
          ),
          onClick: () => navigate('/enrichment'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/community',
      icon: <GlobalOutlined />,
      label: 'Community Hub',
      onClick: () => navigate('/community'),
    },
  ];

  // User dropdown menu
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        message.success('Déconnexion réussie');
        navigate('/login');
      },
    },
  ];

  // Get the current selected menu key based on location
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/usecases')) return '/usecases';
    if (path.startsWith('/search')) return '/search';
    if (path.startsWith('/community')) return '/community';
    if (path.startsWith('/wazuh')) return '/wazuh';
    if (path.startsWith('/enrichment')) return '/enrichment';
    return '/';
  };

  return (
    <AntLayout className="app-layout">
      <Sider
        className="app-sidebar"
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        theme="dark"
      >
        {/* Enhanced Sidebar Header */}
        <div
          style={{
            height: 64,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderBottom: '1px solid var(--border)',
            color: 'white',
          }}
        >
          <Shield size={24} color="white" />
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                Wazuh SOC
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 400 }}>
                Use Cases Manager
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        {!collapsed && (
          <div style={{ padding: '15px', background: 'var(--bg-light)', borderBottom: '1px solid var(--border)' }}>
            <Search
              placeholder="Search use cases..."
              size="small"
              style={{
                background: 'var(--bg-dark)',
                borderRadius: '6px',
              }}
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{
              borderRight: 0,
              background: 'transparent',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-light)',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Version 2.1.0</span>
              <span style={{ color: 'var(--success)' }}>●</span>
            </div>
            <div>Last sync: 2 min ago</div>
          </div>
        )}
      </Sider>

      <AntLayout>
        <Header
          className="app-header"
          style={{
            padding: '0 24px',
            background: 'var(--bg-darker)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                color: 'var(--text)',
                borderRadius: '8px',
              }}
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              <Activity size={16} color="var(--success)" />
              <span>System Online</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Quick Action Buttons */}
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => navigate('/usecases/new')}
              style={{
                color: 'var(--primary)',
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              New Use Case
            </Button>

            {/* Theme Toggle Button */}
            <Button
              type="text"
              onClick={() => {
                console.log('Clic sur bouton thème, mode actuel:', themeMode);
                toggleTheme();
              }}
              style={{
                color: 'var(--text)',
                borderRadius: '8px',
                fontSize: '18px',
              }}
              title={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
            >
              {isDark ? '🌞' : '🌙'}
            </Button>

            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                color: 'var(--text)',
                borderRadius: '8px',
              }}
            >
              <Badge count={3} size="small" offset={[2, -2]} />
            </Button>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 8,
                  transition: 'background-color 0.3s',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{
                    marginRight: 8,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                  }}
                />
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                  {user?.fullName || 'Admin User'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="app-content">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;