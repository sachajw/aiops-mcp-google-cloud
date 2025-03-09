/**
 * Google Cloud MCP Server
 * 
 * This server provides Model Context Protocol resources and tools for interacting
 * with Google Cloud services (Logging, Spanner, and Monitoring).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

// Import service modules
import { registerLoggingResources, registerLoggingTools } from './services/logging/index.js';
import { registerSpannerResources, registerSpannerTools, registerSpannerQueryCountTool } from './services/spanner/index.js';
import { registerMonitoringResources, registerMonitoringTools } from './services/monitoring/index.js';
import { registerTraceService } from './services/trace/index.js';
import { registerPrompts } from './prompts/index.js';
import { initGoogleAuth } from './utils/auth.js';
import { registerResourceDiscovery } from './utils/resource-discovery.js';
import { registerProjectTools } from './utils/project-tools.js';

// Load environment variables
dotenv.config();

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  try {
    // Initialize Google Cloud authentication in non-blocking mode
    // This allows the server to start even if credentials aren't available yet
    initGoogleAuth(false).catch(() => {
      // Silently continue if auth fails - we'll handle this in each tool/resource
    });

    // Create the MCP server
    const server = new McpServer({
      name: 'Google Cloud MCP',
      version: '0.1.0',
      description: 'Model Context Protocol server for Google Cloud services'
    }, {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {}
      }
    });

    // Register resources and tools for each Google Cloud service
    registerLoggingResources(server);
    registerLoggingTools(server);
    
    registerSpannerResources(server);
    registerSpannerTools(server);
    
    registerMonitoringResources(server);
    await registerMonitoringTools(server);
    
    // Register Google Cloud Trace service
    await registerTraceService(server);
    
    // Register additional tools
    registerSpannerQueryCountTool(server);
    registerProjectTools(server);
    
    // Register prompts
    registerPrompts(server);
    
    // Register resource discovery endpoints
    await registerResourceDiscovery(server);

    // For now, only support stdio transport
    // SSE transport requires an HTTP server which is beyond the scope of this implementation
    const transport = new StdioServerTransport();
    // Starting stdio server
    await server.connect(transport);
  } catch (error) {
    // Failed to start MCP server - writing error to stderr would interfere with MCP protocol
    // Instead, exit with error code
    process.exit(1);
  }
}

// Start the server
main();
