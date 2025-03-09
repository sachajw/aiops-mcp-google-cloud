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
 * Custom logger that writes to stderr (won't interfere with stdio protocol)
 */
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.error(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.error(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  // Set up unhandled error handlers to prevent silent crashes
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`, error.stack);
    // Don't exit, just log the error
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    // Don't exit, just log the error
  });

  try {
    logger.info('Starting Google Cloud MCP server...');
    
    // Initialize Google Cloud authentication in non-blocking mode
    // This allows the server to start even if credentials aren't available yet
    logger.info('Initializing Google Cloud authentication in non-blocking mode');
    initGoogleAuth(false).then(auth => {
      if (auth) {
        logger.info('Google Cloud authentication initialized successfully');
      } else {
        logger.warn('Google Cloud authentication not available - will attempt lazy loading when needed');
      }
    }).catch((err) => {
      logger.warn(`Auth initialization warning: ${err.message}`);
    });

    // Create the MCP server
    logger.info('Creating MCP server instance');
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
    logger.info('Registering Google Cloud Logging services');
    registerLoggingResources(server);
    registerLoggingTools(server);
    
    logger.info('Registering Google Cloud Spanner services');
    registerSpannerResources(server);
    registerSpannerTools(server);
    
    logger.info('Registering Google Cloud Monitoring services');
    registerMonitoringResources(server);
    await registerMonitoringTools(server);
    
    // Register Google Cloud Trace service
    logger.info('Registering Google Cloud Trace services');
    await registerTraceService(server);
    
    // Register additional tools
    logger.info('Registering additional tools');
    registerSpannerQueryCountTool(server);
    registerProjectTools(server);
    
    // Register prompts
    logger.info('Registering prompts');
    registerPrompts(server);
    
    // Register resource discovery endpoints
    logger.info('Registering resource discovery');
    await registerResourceDiscovery(server);

    // For now, only support stdio transport
    // SSE transport requires an HTTP server which is beyond the scope of this implementation
    logger.info('Starting stdio transport');
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
    logger.info('Connecting server to transport');
    await server.connect(transport);
    
    logger.info('Server started successfully and ready to handle requests');
    
    // Keep the process alive
    setInterval(() => {
      // Heartbeat to keep the process alive
      logger.debug('Server heartbeat');
    }, 30000);
    
  } catch (error) {
    // Log the error to stderr (won't interfere with stdio protocol)
    logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
    logger.error(error instanceof Error ? error.stack || 'No stack trace available' : 'No stack trace available');
    
    // Don't exit immediately, give time for logs to be seen
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Start the server
main();
