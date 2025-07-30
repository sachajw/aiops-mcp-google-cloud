/**
 * Test utilities and helpers
 */
import { vi } from 'vitest';

/**
 * Create a mock MCP server instance
 */
export function createMockMcpServer() {
  return {
    registerTool: vi.fn(),
    tool: vi.fn(),
    resource: vi.fn(),
    prompt: vi.fn(),
    registerPrompt: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
}

/**
 * Create mock Google Cloud clients
 */
export function createMockGoogleCloudClients() {
  return {
    logging: {
      getEntries: vi.fn(),
      getMetrics: vi.fn(),
      createSink: vi.fn(),
    },
    monitoring: {
      listTimeSeries: vi.fn(),
      createTimeSeries: vi.fn(),
      listMetricDescriptors: vi.fn(),
    },
    spanner: {
      instance: vi.fn(() => ({
        database: vi.fn(() => ({
          run: vi.fn(),
          runStream: vi.fn(),
          getSchema: vi.fn(),
        })),
      })),
    },
    resourceManager: {
      getIamPolicy: vi.fn(),
      setIamPolicy: vi.fn(),
      testIamPermissions: vi.fn(),
    },
  };
}

/**
 * Create mock authentication client
 */
export function createMockAuthClient() {
  return {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
    getProjectId: vi.fn().mockResolvedValue('test-project'),
    authorize: vi.fn(),
  };
}

/**
 * Wait for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create mock log entries
 */
export function createMockLogEntries(count: number = 5) {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date().toISOString(),
    severity: i % 2 === 0 ? 'INFO' : 'ERROR',
    textPayload: `Mock log entry ${i}`,
    resource: {
      type: 'gce_instance',
      labels: {
        instance_id: `instance-${i}`,
        zone: 'us-central1-a',
      },
    },
    labels: {
      service: 'test-service',
      version: '1.0.0',
    },
  }));
}

/**
 * Create mock IAM policy
 */
export function createMockIamPolicy() {
  return {
    bindings: [
      {
        role: 'roles/owner',
        members: ['user:test@example.com'],
      },
      {
        role: 'roles/viewer',
        members: ['serviceAccount:test@test-project.iam.gserviceaccount.com'],
      },
    ],
    etag: 'mock-etag',
    version: 1,
  };
}

/**
 * Create mock Spanner database schema
 */
export function createMockSpannerSchema() {
  return [
    {
      name: 'Users',
      columns: [
        { name: 'id', type: 'STRING(36)', nullable: false },
        { name: 'email', type: 'STRING(255)', nullable: false },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      ],
      primaryKey: ['id'],
    },
    {
      name: 'Orders',
      columns: [
        { name: 'id', type: 'STRING(36)', nullable: false },
        { name: 'user_id', type: 'STRING(36)', nullable: false },
        { name: 'total', type: 'NUMERIC', nullable: false },
      ],
      primaryKey: ['id'],
    },
  ];
}