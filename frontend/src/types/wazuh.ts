// Types for Wazuh Use Cases & Playbooks Platform

export interface UseCaseMetadata {
  name: string;
  description: string;
  author: string;
  version: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type MaturityStatus = 'draft' | 'testing' | 'production' | 'deprecated';
export type DeploymentStatus = 'draft' | 'pending' | 'deployed' | 'failed';

export interface Classification {
  platform: string[];
  severity: SeverityLevel;
  confidence: SeverityLevel;
  false_positive_rate: SeverityLevel;
  maturity: MaturityStatus;
  compliance: string[];
}

export interface MitreAttack {
  tactics: string[];
  techniques: string[];
  sub_techniques: string[];
}

export interface ThreatIntel {
  mitre_attack: MitreAttack;
  kill_chain: string[];
  cve_references: string[];
  threat_actors: string[];
  campaigns: string[];
}

export interface ResourceRequirements {
  cpu: string;
  memory: string;
  storage: string;
}

export interface TechnicalSpecs {
  wazuh_version: string;
  dependencies: string[];
  supported_log_sources: string[];
  performance_impact: SeverityLevel;
  resource_requirements: ResourceRequirements;
}

export interface WazuhRule {
  id: string;
  level: number;
  xml_content: string;
  description: string;
}

export interface WazuhDecoder {
  name: string;
  xml_content: string;
}

export interface AgentConfiguration {
  xml_content: string;
  target_os: string[];
  modules: string[];
}

export interface DetectionLogic {
  rules: WazuhRule[];
  decoders: WazuhDecoder[];
  agent_configuration?: AgentConfiguration;
}

export interface ActiveResponse {
  linux_script?: string;
  windows_script?: string;
}

export interface ResponsePlaybook {
  immediate_actions: string[];
  investigation_steps: string[];
  containment: string[];
  active_response?: ActiveResponse;
}

export interface ThreatIntelligence {
  virustotal_integration: boolean;
  abuseipdb_lookup: boolean;
  custom_feeds: string[];
}

export interface ContextData {
  geolocation: boolean;
  asn_lookup: boolean;
  domain_reputation: boolean;
}

export interface Enrichment {
  threat_intelligence: ThreatIntelligence;
  context_data: ContextData;
}

export interface TestCase {
  name: string;
  input_log: string;
  expected_alert: boolean;
  alert_level?: number;
}

export interface Testing {
  test_cases: TestCase[];
  validation_status: string;
  last_tested?: string;
}

export interface Deployment {
  target_groups: string[];
  deployment_status: DeploymentStatus;
  deployment_date?: string;
  rollback_available: boolean;
}

export interface Metrics {
  alerts_generated: number;
  true_positives: number;
  false_positives: number;
  precision: number;
  last_triggered?: string;
}

export interface Community {
  source_url?: string;
  license: string;
  contributors: string[];
  download_count: number;
  rating: number;
}

export interface UseCase {
  id: string;
  metadata: UseCaseMetadata;
  classification: Classification;
  threat_intel: ThreatIntel;
  technical_specs: TechnicalSpecs;
  detection_logic: DetectionLogic;
  response_playbook: ResponsePlaybook;
  enrichment: Enrichment;
  testing: Testing;
  deployment: Deployment;
  metrics: Metrics;
  community: Community;
}

export interface UseCaseResponse {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  severity: SeverityLevel;
  maturity: MaturityStatus;
  deployment_status: DeploymentStatus;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface SearchFilters {
  severity?: SeverityLevel;
  maturity?: MaturityStatus;
  platform?: string;
  mitre_tactic?: string;
  mitre_technique?: string;
  deployment_status?: DeploymentStatus;
}

export interface SearchRequest {
  query?: string;
  filters: SearchFilters;
  page: number;
  size: number;
  sort?: string;
}

export interface SearchResponse {
  items: UseCaseResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Wazuh API Types
export interface WazuhAgent {
  id: string;
  name: string;
  ip: string;
  status: string;
  os: {
    platform: string;
    name: string;
    version: string;
  };
  version: string;
  lastKeepAlive: string;
}

export interface WazuhAlert {
  id: string;
  timestamp: string;
  rule: {
    id: string;
    level: number;
    description: string;
    groups: string[];
  };
  agent: {
    id: string;
    name: string;
    ip: string;
  };
  decoder: {
    name: string;
  };
  data: Record<string, any>;
}

export interface DeploymentLog {
  id: string;
  use_case_id: string;
  action: 'deploy' | 'rollback' | 'test';
  status: 'success' | 'failed' | 'pending';
  message: string;
  created_at: string;
  created_by: string;
}