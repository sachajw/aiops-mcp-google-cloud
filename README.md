# Google Cloud MCP Server

A Model Context Protocol server that connects to Google Cloud services to provide context and tools for interacting with your Google Cloud resources.

## Services

Supported services:

- [x] Google Cloud Logging
- [x] Google Cloud Monitoring
- [x] Google Cloud Spanner

Servers in development:

- [ ] Google Cloud Trace
- [ ] Google IAM
- [ ] Google Cloud Compute
- [ ] Google Cloud Run
- [ ] Google Cloud Storage

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


## Installation

```bash
# Clone the repository
git clone https://github.com/krzko/google-cloud-mcp.git
cd google-cloud-mcp

# Install dependencies
pnpm install

# Build
pnpm build
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
              "/Users/foo/code/google-cloud-mcp/dist/index.js"
          ],
          "env": {
              "GOOGLE_APPLICATION_CREDENTIALS": "/Users/foo/.config/gcloud/application_default_credentials.json"
          }
      }
  }
}
```

## Development

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

### Using with Smithery (soon)

This server can be deployed and used with Smithery. The server implements lazy loading of authentication, which means it will start immediately and defer authentication until it's actually needed. Authentication is still required for operation, but this approach prevents timeouts during server initialization.

NOTE: Smithery local server support is currently in development and may not yet available.

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

