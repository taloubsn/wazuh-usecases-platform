import React, { useState } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Empty,
  Pagination,
  Spin,
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/services/api';
import type { SearchFilters, UseCaseResponse } from '@/types/wazuh';

const { Title, Text } = Typography;
const { Search: SearchInput } = Input;

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [size] = useState(12);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query, filters, page, size],
    queryFn: () =>
      searchApi.search({
        query: query || undefined,
        filters,
        page,
        size,
      }),
    enabled: !!(query || Object.keys(filters).length > 0),
  });

  // Fetch filter options
  const { data: mitreTactics } = useQuery({
    queryKey: ['mitre-tactics'],
    queryFn: () => searchApi.getMitreTactics(),
  });

  const { data: mitreTechniques } = useQuery({
    queryKey: ['mitre-techniques'],
    queryFn: () => searchApi.getMitreTechniques(),
  });

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => searchApi.getPlatforms(),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => searchApi.getTags(),
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    setPage(1);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Advanced Search</Title>
        <Text type="secondary">Search and filter use cases by content, MITRE techniques, and metadata</Text>
      </div>

      {/* Search Bar */}
      <Card style={{ marginBottom: 24 }}>
        <SearchInput
          placeholder="Search use cases by name, description, IOCs, or MITRE techniques..."
          size="large"
          onSearch={handleSearch}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterButton={<SearchOutlined />}
          allowClear
        />
      </Card>

      {/* Filters */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>Filters</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
        extra={
          <Button size="small" onClick={clearFilters}>
            Clear All
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Severity</Text>
            <Select
              placeholder="Any severity"
              value={filters.severity}
              onChange={(value) => handleFilterChange('severity', value)}
              allowClear
              style={{ width: '100%', marginTop: 4 }}
            >
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="critical">Critical</Select.Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Text strong>Maturity</Text>
            <Select
              placeholder="Any maturity"
              value={filters.maturity}
              onChange={(value) => handleFilterChange('maturity', value)}
              allowClear
              style={{ width: '100%', marginTop: 4 }}
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="testing">Testing</Select.Option>
              <Select.Option value="production">Production</Select.Option>
              <Select.Option value="deprecated">Deprecated</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>Platform</Text>
            <Select
              placeholder="Any platform"
              value={filters.platform}
              onChange={(value) => handleFilterChange('platform', value)}
              allowClear
              style={{ width: '100%', marginTop: 4 }}
            >
              {platforms?.platforms.map(platform => (
                <Select.Option key={platform} value={platform}>
                  {platform}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>Deployment Status</Text>
            <Select
              placeholder="Any status"
              value={filters.deployment_status}
              onChange={(value) => handleFilterChange('deployment_status', value)}
              allowClear
              style={{ width: '100%', marginTop: 4 }}
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="deployed">Deployed</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>MITRE Tactic</Text>
            <Select
              placeholder="Any tactic"
              value={filters.mitre_tactic}
              onChange={(value) => handleFilterChange('mitre_tactic', value)}
              allowClear
              style={{ width: '100%', marginTop: 4 }}
            >
              {mitreTactics?.tactics.map(tactic => (
                <Select.Option key={tactic} value={tactic}>
                  {tactic}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>MITRE Technique</Text>
            <Select
              placeholder="Any technique"
              value={filters.mitre_technique}
              onChange={(value) => handleFilterChange('mitre_technique', value)}
              allowClear
              style={{ width: '100%', marginTop: 4 }}
            >
              {mitreTechniques?.techniques.map(technique => (
                <Select.Option key={technique} value={technique}>
                  {technique}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : searchResults && searchResults.items.length > 0 ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Found {searchResults.total} use cases
            </Text>
          </div>
          
          <Row gutter={[16, 16]}>
            {searchResults.items.map((useCase) => (
              <Col key={useCase.id} xs={24} lg={12}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  onClick={() => window.open(`/usecases/${useCase.id}`, '_blank')}
                >
                  <Card.Meta
                    title={useCase.name}
                    description={
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                          {useCase.description}
                        </Text>
                        <Space wrap>
                          <Tag color={getSeverityColor(useCase.severity)}>
                            {useCase.severity.toUpperCase()}
                          </Tag>
                          <Tag>{useCase.maturity.toUpperCase()}</Tag>
                          <Tag color={useCase.deployment_status === 'deployed' ? 'success' : 'default'}>
                            {useCase.deployment_status.toUpperCase()}
                          </Tag>
                        </Space>
                        {useCase.tags.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <Space size={2} wrap>
                              {useCase.tags.slice(0, 5).map(tag => (
                                <Tag key={tag} size="small">{tag}</Tag>
                              ))}
                              {useCase.tags.length > 5 && (
                                <Tag size="small">+{useCase.tags.length - 5} more</Tag>
                              )}
                            </Space>
                          </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                          by {useCase.author} • {new Date(useCase.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Pagination
              current={searchResults.page}
              pageSize={searchResults.size}
              total={searchResults.total}
              onChange={setPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} use cases`
              }
            />
          </div>
        </>
      ) : (query || Object.keys(filters).length > 0) ? (
        <Empty
          description="No use cases match your search criteria"
          style={{ padding: 48 }}
        />
      ) : (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <SearchOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} type="secondary">Start your search</Title>
          <Text type="secondary">
            Enter keywords or use filters to find relevant use cases
          </Text>
        </Card>
      )}
    </div>
  );
};

export default Search;