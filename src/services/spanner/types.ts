/**
 * Type definitions for Google Cloud Spanner service
 */
import { Spanner } from '@google-cloud/spanner';
import { GcpMcpError } from '../../utils/error.js';

// Type definitions for Google Cloud Spanner
export interface SpannerSchema {
  tables: SpannerTable[];
}

export interface SpannerTable {
  name: string;
  columns: SpannerColumn[];
  indexes?: SpannerIndex[];
  foreignKeys?: SpannerForeignKey[];
}

export interface SpannerForeignKey {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface SpannerColumn {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface SpannerIndex {
  name: string;
  columns: string[];
  unique?: boolean;
}

/**
 * Initialises the Google Cloud Spanner client
 * 
 * @returns A configured Spanner client
 */
export function getSpannerClient(): Spanner {
  return new Spanner({
    projectId: process.env.GOOGLE_CLOUD_PROJECT
  });
}

/**
 * Gets the Spanner instance and database from environment variables or parameters
 * 
 * @param instanceId Optional instance ID (defaults to environment variable)
 * @param databaseId Optional database ID (defaults to environment variable)
 * @returns The instance and database IDs
 */
export async function getSpannerConfig(instanceId?: string, databaseId?: string): Promise<{ instanceId: string; databaseId: string }> {
  const instance = instanceId || process.env.SPANNER_INSTANCE;
  const database = databaseId || process.env.SPANNER_DATABASE;
  
  if (!instance) {
    throw new GcpMcpError(
      'Spanner instance ID not provided. Set SPANNER_INSTANCE environment variable or provide instanceId parameter.',
      'INVALID_ARGUMENT',
      400
    );
  }
  
  if (!database) {
    throw new GcpMcpError(
      'Spanner database ID not provided. Set SPANNER_DATABASE environment variable or provide databaseId parameter.',
      'INVALID_ARGUMENT',
      400
    );
  }
  
  return { instanceId: instance, databaseId: database };
}
