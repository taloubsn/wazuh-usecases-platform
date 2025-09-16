import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCasesApi } from '@/services/api';
import { Spin, Alert } from 'antd';
import EnhancedUseCaseForm from '@/components/EnhancedUseCaseForm';

const UseCaseEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Load existing use case if editing
  const { data: existingUseCase, isLoading, error } = useQuery({
    queryKey: ['usecase', id],
    queryFn: () => useCasesApi.getById(id!),
    enabled: isEditing,
  });

  if (isEditing && isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading use case...</p>
      </div>
    );
  }

  if (isEditing && error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description="Failed to load use case. Please try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Convert existing use case to form values if editing
  const initialValues = isEditing && existingUseCase ? {
    name: existingUseCase.metadata.name,
    description: existingUseCase.metadata.description,
    author: existingUseCase.metadata.author,
    version: existingUseCase.metadata.version,
    tags: existingUseCase.metadata.tags,
    platform: existingUseCase.classification?.platform || [],
    severity: existingUseCase.classification?.severity || 'medium',
    confidence: existingUseCase.classification?.confidence || 'medium',
    false_positive_rate: existingUseCase.classification?.false_positive_rate || 'low',
    maturity: existingUseCase.classification?.maturity || 'draft',
    rules_xml: existingUseCase.detection_logic?.rules?.[0]?.xml_content || '',
    decoders_xml: existingUseCase.detection_logic?.decoders?.[0]?.xml_content || '',
    agent_config_xml: existingUseCase.detection_logic?.agent_configuration?.xml_content || '',
    immediate_actions: existingUseCase.response_playbook?.immediate_actions || [],
    investigation_steps: existingUseCase.response_playbook?.investigation_steps || [],
    containment_steps: existingUseCase.response_playbook?.containment || [],
  } : undefined;

  return (
    <EnhancedUseCaseForm
      initialValues={initialValues}
      isEditing={isEditing}
      useCaseId={id}
    />
  );
};

export default UseCaseEditor;