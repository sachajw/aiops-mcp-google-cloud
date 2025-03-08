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

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Google Cloud settings
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
pnpm dev
```

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

1. **Service Account Key File**: Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key file.

2. **Environment Variables**: Set `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` environment variables directly.

The server will also use the `GOOGLE_CLOUD_PROJECT` environment variable if set, otherwise it will attempt to determine the project ID from the authentication credentials.
