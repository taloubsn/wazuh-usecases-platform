import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Tag,
  Input,
  Space,
  Row,
  Col,
  Statistic,
  Rate,
  message,
  Modal,
  List,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  GithubOutlined,
  StarOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, useCasesApi } from '@/services/api';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;

const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch marketplace use cases
  const { data: marketplaceUseCases, isLoading: marketplaceLoading } = useQuery({
    queryKey: ['marketplace'],
    queryFn: () => communityApi.getMarketplace({ limit: 20 }),
  });

  // Fetch user's use cases for export
  const { data: userUseCases } = useQuery({
    queryKey: ['user-usecases'],
    queryFn: () => useCasesApi.getAll({ limit: 100 }),
  });

  // GitHub search query
  const { data: githubResults, isLoading: githubLoading } = useQuery({
    queryKey: ['github-search', searchQuery],
    queryFn: () => communityApi.searchGithub(searchQuery, 'wazuh', 10),
    enabled: !!searchQuery,
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (file: File) => communityApi.importFromJson(file),
    onSuccess: (data) => {
      message.success(`Imported ${data.imported_count} use cases successfully`);
      if (data.errors.length > 0) {
        message.warning(`${data.errors.length} use cases had errors`);
      }
      queryClient.invalidateQueries({ queryKey: ['usecases'] });
    },
    onError: () => {
      message.error('Failed to import use cases');
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (useCaseIds: string[]) => communityApi.exportToJson(useCaseIds),
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wazuh-usecases-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`Exported ${data.export_count} use cases`);
      setExportModalVisible(false);
      setSelectedUseCases([]);
    },
    onError: () => {
      message.error('Failed to export use cases');
    },
  });

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.json,.yml,.yaml',
    showUploadList: false,
    beforeUpload: (file) => {
      if (file.name.endsWith('.json')) {
        importMutation.mutate(file);
      } else {
        message.error('Please upload a JSON file');
      }
      return false; // Prevent automatic upload
    },
  };

  const handleExport = () => {
    if (selectedUseCases.length === 0) {
      message.warning('Please select use cases to export');
      return;
    }
    exportMutation.mutate(selectedUseCases);
  };

  const marketplaceColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: any) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            by {record.author}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Space>
          <Rate disabled value={rating} allowHalf style={{ fontSize: 12 }} />
          <Text style={{ fontSize: 12 }}>({rating.toFixed(1)})</Text>
        </Space>
      ),
    },
    {
      title: 'Downloads',
      dataIndex: 'download_count',
      key: 'downloads',
      render: (count: number) => (
        <Text>{count.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 3).map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
          {tags.length > 3 && (
            <Tag size="small">+{tags.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => console.log('Download:', record.id)}
          >
            Download
          </Button>
          {record.source_url && (
            <Button
              size="small"
              icon={<GithubOutlined />}
              onClick={() => window.open(record.source_url, '_blank')}
            >
              View Source
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const exportColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Community Hub</Title>
        <Text type="secondary">
          Discover, share, and import use cases from the security community
        </Text>
      </div>

      {/* Import/Export Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card>
            <Statistic
              title="Community Use Cases"
              value={marketplaceUseCases?.length || 0}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Import Use Cases</Text>
              <Upload {...uploadProps}>
                <Button
                  icon={<ImportOutlined />}
                  loading={importMutation.isPending}
                  block
                >
                  Import JSON File
                </Button>
              </Upload>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Export Use Cases</Text>
              <Button
                icon={<ExportOutlined />}
                onClick={() => setExportModalVisible(true)}
                block
              >
                Export to JSON
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* GitHub Search */}
      <Card title="GitHub Repository Search" style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search GitHub repositories for Wazuh rules..."
          onSearch={setSearchQuery}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          enterButton={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          allowClear
        />
        
        {githubResults && (
          <List
            loading={githubLoading}
            dataSource={githubResults.repositories}
            renderItem={(repo) => (
              <List.Item
                actions={[
                  <Button
                    icon={<GithubOutlined />}
                    onClick={() => window.open(repo.url, '_blank')}
                  >
                    View on GitHub
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{repo.name}</Text>
                      <Tag color="blue">{repo.language}</Tag>
                      <Space size={4}>
                        <StarOutlined />
                        <Text>{repo.stars}</Text>
                      </Space>
                    </Space>
                  }
                  description={repo.description}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Community Marketplace */}
      <Card title="Community Marketplace">
        <Table
          dataSource={marketplaceUseCases}
          columns={marketplaceColumns}
          loading={marketplaceLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} use cases`,
          }}
        />
      </Card>

      {/* Export Modal */}
      <Modal
        title="Export Use Cases"
        open={exportModalVisible}
        onOk={handleExport}
        onCancel={() => {
          setExportModalVisible(false);
          setSelectedUseCases([]);
        }}
        confirmLoading={exportMutation.isPending}
        width={800}
      >
        <Text>Select the use cases you want to export:</Text>
        <Table
          dataSource={userUseCases}
          columns={exportColumns}
          rowKey="id"
          size="small"
          style={{ marginTop: 16 }}
          rowSelection={{
            selectedRowKeys: selectedUseCases,
            onChange: setSelectedUseCases,
            type: 'checkbox',
          }}
          pagination={{
            pageSize: 8,
            size: 'small',
          }}
        />
      </Modal>
    </div>
  );
};

export default Community;