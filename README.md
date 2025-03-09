# Google Cloud MCP Server

A Model Context Protocol server that connects to Google Cloud services (Logging, Spanner, Monitoring, and Trace) to provide context and tools for interacting with your Google Cloud resources.

## Features

- Query Google Cloud Logging for log entries
- Execute SQL queries against Google Cloud Spanner databases
- Retrieve metrics from Google Cloud Monitoring
- Analyse distributed traces from Google Cloud Trace
- Correlate traces with logs for better debugging
- Natural language support for all services
- Authentication via environment variables or service accounts

## Installation

```bash
# Clone the repository
git clone https://github.com/krzko/google-cloud-mcp.git
cd google-cloud-mcp

# Install dependencies
pnpm install

# Build
pnpm build

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Google Cloud settings
```

Authenticate to Google Cloud:

```bash
gcloud auth application-default login
```

Configure the `mcpServers` in your client:

```json
{
  "mcpServers": {
      "google-cloud-mcp": {
          "command": "node",
          "args": [
              "/Users/foo/Downloads/google-cloud-mcp/dist/index.js"
          ],
          "env": {
              "GOOGLE_APPLICATION_CREDENTIALS": "/Users/foo/.config/gcloud/application_default_credentials.json",
          }
      }
  }
}
```

## Usage

### Starting the server

```bash
# Build the project
pnpm build

# Start the server
pnpm start
```

### Development mode

```bash
# Build the project
pnpm build

# Start the server and inspector
npx -y @modelcontextprotocol/inspector node dist/index.js
```

### Using with Smithery

This server can be deployed and used with Smithery. The server implements lazy loading of authentication, which means it will start immediately and defer authentication until it's actually needed. Authentication is still required for operation, but this approach prevents timeouts during server initialization.

#### Smithery Configuration

You can configure the server in your Smithery configuration with the following options:

```json
{
  "projectId": "your-google-cloud-project-id",  // Optional
  "debug": true,  // Enable debug logging
  "lazyAuth": true,  // Enable lazy loading of authentication (recommended for Smithery)
  "credentials": {
    "keyFilePath": "/path/to/your/credentials.json"  // Method 1: Path to credentials file
  }
}
```

Alternatively, you can provide credentials as environment variables:

```json
{
  "projectId": "your-google-cloud-project-id",
  "credentials": {
    "clientEmail": "your-service-account@project.iam.gserviceaccount.com",
    "privateKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  }
}
```

#### Claude Desktop Integration

To use this server with Claude Desktop, add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "@krzko-google-cloud-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@krzko/google-cloud-mcp",
        "--config",
        "{\"projectId\":\"your-project-id\",\"debug\":true,\"lazyAuth\":true,\"credentials\":\"/path/to/credentials.json\"}"
      ]
    }
  }
}
```

**Note:** For Claude Desktop, you can pass the credentials path directly as a string.

## Troubleshooting

### Server Timeout Issues

If you encounter timeout issues when running the server with Smithery, try the following:

1. Enable debug logging by setting `debug: true` in your configuration
2. Ensure `lazyAuth: true` is set to defer authentication until it's actually needed
3. Ensure your credentials file is accessible and valid
4. Check the logs for any error messages

**Important**: Authentication is still required for operation, but with lazy loading enabled, the server will start immediately and authenticate when needed rather than during initialization.

### Authentication Issues

The server supports two methods of authentication:

1. **Service Account Key File**: Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key file
2. **Environment Variables**: Set `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` environment variables

If you're having authentication issues, make sure:

- Your service account has the necessary permissions
- The key file is properly formatted and accessible
- Environment variables are correctly set

## Services

### Google Cloud Logging

Query and filter log entries from Google Cloud Logging:

- Query logs with custom filters
- Search logs within specific time ranges
- Format and display log entries in a readable format

### Google Cloud Spanner

Interact with Google Cloud Spanner databases:

- Execute SQL queries against Spanner databases
- List available databases and tables
- Explore database schema

### Google Cloud Monitoring

Retrieve and analyse metrics from Google Cloud Monitoring:

- Query metrics with custom filters
- Visualise metric data over time
- List available metric types

### Google Cloud Trace

Analyse distributed traces from Google Cloud Trace:

- Retrieve traces by ID
- List recent traces with filtering options
- Find traces associated with logs
- Identify failed traces
- Use natural language to query traces (e.g., "Show me failed traces from the last hour")

## Authentication

This server supports two methods of authentication with Google Cloud:

1. **Service Account Key File** (Recommended): Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key file. This is the standard Google Cloud authentication method.

2. **Environment Variables**: Set `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` environment variables directly. This is useful for environments where storing a key file is not practical.

The server will also use the `GOOGLE_CLOUD_PROJECT` environment variable if set, otherwise it will attempt to determine the project ID from the authentication credentials.

### Lazy Authentication

The server implements lazy loading for authentication, which means:

- The server will start successfully even if Google Cloud credentials are not available
- Authentication will only be attempted when a tool or resource requiring Google Cloud access is used
- Clear error messages will be provided if authentication fails when a Google Cloud operation is attempted

This makes the server more flexible for deployment in environments where credentials might not be immediately available.

## Deployment

### Smithery Deployment

This server includes configuration for deployment with Smithery. The included `smithery.yaml` file supports both authentication methods:

```yaml
# Example Smithery configuration
startCommand:
  type: stdio
  configSchema:
    # Configuration options
    properties:
      projectId:
        type: string
        description: "Google Cloud Project ID (optional)"
      credentials:
        # Two authentication options
        oneOf:
          # Option 1: Using environment variables
          - properties:
              clientEmail:
                type: string
              privateKey:
                type: string
          # Option 2: Using a key file (standard approach)
          - properties:
              keyFilePath:
                type: string
```

To deploy with Smithery:

1. Build the Docker image using the included Dockerfile
2. Configure authentication in your Smithery configuration
3. Deploy the server using Smithery's deployment tools
