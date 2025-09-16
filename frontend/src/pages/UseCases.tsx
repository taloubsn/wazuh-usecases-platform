import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Pagination,
  Spin,
  Empty,
  Tooltip,
  Badge,
  Statistic,
  Divider,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  EyeOutlined,
  ExportOutlined,
  ImportOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Shield, Activity, Target, Zap, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCasesApi } from '@/services/api';
import type { UseCaseResponse, SeverityLevel, MaturityStatus } from '@/types/wazuh';

const { Title, Text } = Typography;
const { Search } = Input;

const UseCases: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | undefined>();
  const [maturityFilter, setMaturityFilter] = useState<MaturityStatus | undefined>();
  const [platformFilter, setPlatformFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // Fetch use cases
  const { data: useCases, isLoading } = useQuery({
    queryKey: ['usecases', searchTerm, severityFilter, maturityFilter, platformFilter, page],
    queryFn: () =>
      useCasesApi.getAll({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        severity: severityFilter,
        maturity: maturityFilter,
        platform: platformFilter,
      }),
  });

  // Filter use cases and add platform data
  const filteredUseCases = useCases?.filter(
    (useCase) => {
      const matchesSearch = !searchTerm ||
        useCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        useCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        useCase.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPlatform = !platformFilter || 
        (useCase.platform && useCase.platform.includes(platformFilter));
      
      return matchesSearch && matchesPlatform;
    }
  ) || [];

  // Add sample platform data to use cases if missing
  const enrichedUseCases = filteredUseCases.map((useCase, index) => ({
    ...useCase,
    platform: useCase.platform || [
      index % 3 === 0 ? 'windows' : index % 3 === 1 ? 'linux' : 'network',
      index % 2 === 0 ? 'cloud' : 'macos'
    ] // Sample platforms for demo
  }));

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'windows': return '🪟';
      case 'linux': return '🐧';
      case 'macos': return '🍎';
      case 'network': return '🌐';
      case 'cloud': return '☁️';
      default: return '💻';
    }
  };

  // Enhanced color functions with modern theme colors
  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low': return 'var(--info)';
      case 'medium': return '#ffd700';
      case 'high': return 'var(--warning)';
      case 'critical': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low': return <Shield size={12} />;
      case 'medium': return <Activity size={12} />;
      case 'high': return <Target size={12} />;
      case 'critical': return <Zap size={12} />;
      default: return <Shield size={12} />;
    }
  };

  const getMaturityColor = (maturity: MaturityStatus) => {
    switch (maturity) {
      case 'draft': return 'var(--text-muted)';
      case 'testing': return 'var(--warning)';
      case 'production': return 'var(--success)';
      case 'deprecated': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'var(--success)';
      case 'pending': return 'var(--primary)';
      case 'failed': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  // Calculate stats for the dashboard overview
  const stats = {
    total: enrichedUseCases.length,
    critical: enrichedUseCases.filter(uc => uc.severity === 'critical').length,
    production: enrichedUseCases.filter(uc => uc.maturity === 'production').length,
    deployed: enrichedUseCases.filter(uc => uc.deployment_status === 'deployed').length,
  };

  return (
    <div>
      {/* Enhanced Header with Stats */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <Title level={2} style={{ margin: 0, color: 'var(--text)' }}>Detection Use Cases</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Comprehensive library of Wazuh detection rules and response playbooks
            </Text>
          </div>
          <Space wrap>
            <Button
              icon={<ImportOutlined />}
              onClick={() => {}}
            >
              Import
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={() => {}}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/usecases/new')}
              size="large"
              style={{ minWidth: 'fit-content' }}
            >
              Create Use Case
            </Button>
          </Space>
        </div>
        
        {/* Stats Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="dashboard-card" size="small">
              <Statistic
                title="Total Use Cases"
                value={stats.total}
                prefix={<Shield size={20} color="var(--primary)" />}
                valueStyle={{ color: 'var(--primary)', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="dashboard-card" size="small">
              <Statistic
                title="Critical Priority"
                value={stats.critical}
                prefix={<Zap size={20} color="var(--danger)" />}
                valueStyle={{ color: 'var(--danger)', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="dashboard-card" size="small">
              <Statistic
                title="Production Ready"
                value={stats.production}
                prefix={<Target size={20} color="var(--success)" />}
                valueStyle={{ color: 'var(--success)', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="dashboard-card" size="small">
              <Statistic
                title="Deployed"
                value={stats.deployed}
                prefix={<Activity size={20} color="var(--info)" />}
                valueStyle={{ color: 'var(--info)', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Enhanced Filters */}
      <Card className="search-filters">
        <div className="search-header">
          <FilterOutlined style={{ color: 'var(--primary)' }} />
          <h3>Search & Filter</h3>
        </div>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Search by name, description, tags, or MITRE techniques..."
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Severity"
              value={severityFilter}
              onChange={setSeverityFilter}
              allowClear
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="low">
                <Space>
                  <Shield size={14} color="var(--info)" />
                  Low
                </Space>
              </Select.Option>
              <Select.Option value="medium">
                <Space>
                  <Activity size={14} color="#ffd700" />
                  Medium
                </Space>
              </Select.Option>
              <Select.Option value="high">
                <Space>
                  <Target size={14} color="var(--warning)" />
                  High
                </Space>
              </Select.Option>
              <Select.Option value="critical">
                <Space>
                  <Zap size={14} color="var(--danger)" />
                  Critical
                </Space>
              </Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Status"
              value={maturityFilter}
              onChange={setMaturityFilter}
              allowClear
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="testing">Testing</Select.Option>
              <Select.Option value="production">Production</Select.Option>
              <Select.Option value="deprecated">Deprecated</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Platform"
              value={platformFilter}
              onChange={setPlatformFilter}
              allowClear
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="windows">
                <Space>
                  🪟 Windows
                </Space>
              </Select.Option>
              <Select.Option value="linux">
                <Space>
                  🐧 Linux
                </Space>
              </Select.Option>
              <Select.Option value="macos">
                <Space>
                  🍎 macOS
                </Space>
              </Select.Option>
              <Select.Option value="network">
                <Space>
                  🌐 Network
                </Space>
              </Select.Option>
              <Select.Option value="cloud">
                <Space>
                  ☁️ Cloud
                </Space>
              </Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                <BarChartOutlined style={{ marginRight: 8 }} />
                {enrichedUseCases.length} results
              </Text>
              <Button 
                type="text" 
                icon={<FilterOutlined />} 
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter(undefined);
                  setMaturityFilter(undefined);
                  setPlatformFilter(undefined);
                }}
              >
                Clear
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Use Cases Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : enrichedUseCases.length === 0 ? (
        <div className="empty-state">
          <Shield size={64} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <h3>No use cases found</h3>
          <p>Start building your detection library by creating your first use case</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/usecases/new')}
            size="large"
            style={{
              marginTop: 16,
              maxWidth: '300px',
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Create First Use Case
          </Button>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {enrichedUseCases.map((useCase) => (
              <Col key={useCase.id} xs={24} sm={12} lg={8} xl={8}>
                <div className="use-case-card fade-in-up">
                  {/* Card Header */}
                  <div className="use-case-header">
                    <div style={{ flex: 1 }}>
                      <h3 className="use-case-title">{useCase.name}</h3>
                      <div className="use-case-meta">
                        <div className="meta-item">
                          <User size={12} />
                          <span>{useCase.author}</span>
                        </div>
                        <div className="meta-item">
                          <Clock size={12} />
                          <span>v{useCase.version}</span>
                        </div>
                        <div 
                          className="criticality-dot" 
                          style={{ background: getSeverityColor(useCase.severity) }}
                          title={`${useCase.severity} severity`}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <Space>
                        <Tooltip title="View Details">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/usecases/${useCase.id}`);
                            }}
                            style={{ color: 'var(--primary)' }}
                          />
                        </Tooltip>
                        <Tooltip title="Edit">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/usecases/${useCase.id}/edit`);
                            }}
                            style={{ color: 'var(--text)' }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="use-case-description">
                    {useCase.description}
                  </div>

                  {/* Status Badges */}
                  <div style={{ marginBottom: 16 }}>
                    <Space wrap>
                      <div className={`severity-badge ${useCase.severity}`}>
                        {getSeverityIcon(useCase.severity)}
                        {useCase.severity}
                      </div>
                      <div className={`status-badge ${useCase.maturity}`}>
                        {useCase.maturity}
                      </div>
                      <div className={`status-badge ${useCase.deployment_status}`}>
                        {useCase.deployment_status}
                      </div>
                    </Space>
                  </div>

                  {/* Platform Badges */}
                  {useCase.platform && useCase.platform.length > 0 && (
                    <div className="platform-badges">
                      {useCase.platform.slice(0, 4).map((platform) => (
                        <div key={platform} className={`platform-badge ${platform.toLowerCase()}`}>
                          {getPlatformIcon(platform)} {platform}
                        </div>
                      ))}
                      {useCase.platform.length > 4 && (
                        <div className="platform-badge">
                          +{useCase.platform.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* MITRE Tags */}
                  {useCase.tags.length > 0 && (
                    <div className="mitre-tags">
                      {useCase.tags.slice(0, 3).map((tag) => (
                        <div key={tag} className="mitre-tag">
                          {tag}
                        </div>
                      ))}
                      {useCase.tags.length > 3 && (
                        <div className="mitre-tag">
                          +{useCase.tags.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {enrichedUseCases.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={enrichedUseCases.length}
                onChange={setPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} use cases`
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UseCases;