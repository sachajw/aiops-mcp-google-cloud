# MCP Resource Implementation Improvements

This document outlines planned improvements to our Google Cloud MCP server's resource implementation to better align with the Model Context Protocol specification.

## Current Implementation

Our server currently implements resources for Google Cloud services:

- **Logging**: Query and filter log entries
- **Spanner**: Explore database schema and table data
- **Monitoring**: Retrieve and analyse metrics

These resources are implemented using the `ResourceTemplate` class and follow the basic MCP resource structure.

## Planned Improvements

### 1. Resource Discovery ✅

Implement proper resource discovery through a dedicated resource endpoint:

```typescript
// In src/utils/resource-discovery.ts
server.resource(
  'resource-list',
  'resources://list',
  async (uri) => {
    return {
      contents: [{
        uri: uri.href,
        text: `# Available Resources\n\n## Logging Resources\n\n* **Recent Logs** - \`gcp-logs://${projectId}/recent\`\n  Recent log entries from Google Cloud Logging\n\n* **Filtered Logs** - \`gcp-logs://{projectId}/filter/{filter}\`\n  Log entries matching a specific filter\n\n## Spanner Resources\n\n* **Spanner Schema** - \`gcp-spanner://{projectId}/{instanceId}/{databaseId}/schema\`\n  Database schema for a Google Cloud Spanner database\n\n* **Table Preview** - \`gcp-spanner://{projectId}/{instanceId}/{databaseId}/tables/{tableName}/preview\`\n  Preview of data in a Spanner table\n\n## Monitoring Resources\n\n* **Recent Metrics** - \`gcp-monitoring://${projectId}/recent\`\n  Recent metrics from Google Cloud Monitoring\n\n* **Filtered Metrics** - \`gcp-monitoring://{projectId}/filter/{filter}\`\n  Metrics matching a specific filter\n`
      }]
    };
  }
);
```

This implementation creates a dedicated resource at `resources://list` that provides a formatted markdown document listing all available resources with their URIs and descriptions.

### 2. MIME Types

Add explicit MIME types to all resource responses:

```typescript
return {
  contents: [{
    uri: uri.href,
    text: `# Recent Logs for Project: ${actualProjectId}\n\n${formattedLogs}`,
    mimeType: "text/markdown"
  }]
};
```

### 3. Resource Subscriptions

Implement subscription support for resources that change frequently:

```typescript
// In src/services/logging.ts
server.setRequestHandler(SubscribeResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  // Add subscription logic here
  // Store subscription in a map
  
  return { success: true };
});

server.setRequestHandler(UnsubscribeResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  // Remove subscription
  
  return { success: true };
});

// When logs change
server.sendNotification({
  type: "notifications/resources/updated",
  params: {
    uri: "gcp-logs://recent"
  }
});
```

### 4. Pagination

Add pagination support for large resources:

```typescript
server.resource(
  'paginated-logs',
  new ResourceTemplate('gcp-logs://{projectId}/page/{page}/size/{pageSize}', { list: undefined }),
  async (uri, { projectId, page, pageSize }, _extra) => {
    // Implement pagination logic
    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 50;
    
    // Fetch logs with pagination
    // ...
    
    return {
      contents: [{
        uri: uri.href,
        text: `# Logs (Page ${pageNum})\n\n${formattedLogs}`,
        mimeType: "text/markdown"
      }]
    };
  }
);
```

### 5. Enhanced Security

Improve security for resource access:

```typescript
// Validate URI parameters
function validateResourceUri(uri: string): boolean {
  // Implement validation logic
  // Check for injection attacks, etc.
  return true;
}

// In resource handlers
if (!validateResourceUri(uri.href)) {
  throw new GcpMcpError('Invalid resource URI', 'INVALID_ARGUMENT', 400);
}
```

### 6. Binary Resources

Add support for binary resources (e.g., charts or visualisations):

```typescript
// Generate a chart image
const chartBuffer = await generateMetricsChart(timeSeries);
const base64Image = chartBuffer.toString('base64');

return {
  contents: [{
    uri: uri.href,
    blob: base64Image,
    mimeType: "image/png"
  }]
};
```

## Implementation Timeline

1. Resource Discovery - High Priority
2. MIME Types - High Priority
3. Pagination - Medium Priority
4. Enhanced Security - Medium Priority
5. Subscriptions - Low Priority
6. Binary Resources - Low Priority

## References

- [MCP Resource Documentation](https://modelcontextprotocol.io/docs/concepts/resources/)
- [MCP Resource Examples](https://github.com/modelcontextprotocol/servers/blob/main/src/postgres/)
