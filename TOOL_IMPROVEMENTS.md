# MCP Tool Implementation Improvements

This document outlines our current implementation of tools in the Google Cloud MCP server and suggests improvements to better align with the Model Context Protocol specification.

## Current Implementation

Our server currently implements tools for Google Cloud services:

- **Logging Tools**:
  - `query-logs`: Query logs with a custom filter
  - `logs-time-range`: Get logs for a specific time range

- **Spanner Tools**:
  - `execute-spanner-query`: Execute SQL queries on Spanner databases
  - `list-spanner-tables`: List tables in a Spanner database

- **Monitoring Tools**:
  - `query-metrics`: Query metrics with a custom filter and time range
  - `list-metric-types`: List available metric types

These tools are implemented using the `server.tool()` method from the MCP SDK, which handles parameter validation using Zod schemas.

## Alignment with MCP Specification

### What We've Implemented Correctly:

1. **Tool Definitions**: We've defined tools with clear names and descriptions.
2. **Input Schemas**: We use Zod for parameter validation, which aligns with the JSON Schema approach.
3. **Return Values**: Our tools return properly formatted content.
4. **Parameter Descriptions**: We include descriptions for all parameters.

### Areas for Improvement:

1. **Tool Discovery**: We haven't explicitly implemented the `tools/list` endpoint. The SDK may handle this automatically, but we should verify.
2. **Error Handling**: We're currently throwing errors rather than returning them as part of the tool response with `isError: true`.
3. **Progress Reporting**: We don't have progress reporting for long-running operations.
4. **Tool Updates**: We don't notify clients when tools change.
5. **Security Considerations**: We could enhance input validation and access controls.

## Recommended Improvements

### 1. Proper Error Handling

Update our tools to return errors in the content rather than throwing exceptions:

```typescript
try {
  // Tool operation
  const result = await performOperation();
  return {
    content: [{
      type: 'text',
      text: `Operation successful: ${result}`
    }]
  };
} catch (error) {
  return {
    isError: true,
    content: [{
      type: 'text',
      text: `Error: ${error.message}`
    }]
  };
}
```

### 2. Verify Tool Discovery

Ensure the SDK is properly exposing our tools via the `tools/list` endpoint, or implement it explicitly:

```typescript
// Verify if this is needed or if the SDK handles it automatically
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "query-logs",
        description: "Query logs with a custom filter",
        inputSchema: {
          type: "object",
          properties: {
            filter: { type: "string", description: "The filter to apply to logs" },
            limit: { type: "number", description: "Maximum number of log entries to return" }
          },
          required: ["filter"]
        }
      },
      // Add other tools here
    ]
  };
});
```

### 3. Progress Reporting for Long Operations

Implement progress reporting for long-running operations:

```typescript
server.tool(
  'execute-long-query',
  {
    // Parameters
  },
  async (params, context) => {
    // Start operation
    const operationId = startLongRunningOperation();
    
    // Return initial response
    return {
      content: [{
        type: 'text',
        text: `Operation started with ID: ${operationId}`
      }],
      progress: {
        status: 'in_progress',
        message: 'Query execution started',
        percentComplete: 0
      }
    };
    
    // In background process, update progress:
    // server.sendNotification({
    //   type: 'notifications/tools/progress',
    //   params: {
    //     toolCallId: context.toolCallId,
    //     progress: {
    //       status: 'in_progress',
    //       message: 'Processing data',
    //       percentComplete: 50
    //     }
    //   }
    // });
  }
);
```

### 4. Enhanced Input Validation

Improve input validation for all tools:

```typescript
server.tool(
  'execute-spanner-query',
  {
    sql: z.string()
      .min(1, "SQL query cannot be empty")
      .max(10000, "SQL query too long")
      .refine(
        sql => !sql.toLowerCase().includes("drop") && !sql.toLowerCase().includes("truncate"),
        "Destructive operations are not allowed"
      )
      .describe('The SQL query to execute'),
    // Other parameters
  },
  // Implementation
);
```

### 5. Tool Notifications

Implement notifications for tool changes:

```typescript
// When tools are updated
server.sendNotification({
  type: "notifications/tools/list_changed"
});
```

### 6. Security Enhancements

Add more robust security measures:

```typescript
// Rate limiting
const rateLimiter = new RateLimiter();

server.tool(
  'query-logs',
  {
    // Parameters
  },
  async (params, context) => {
    // Check rate limits
    if (!rateLimiter.allowRequest(context.clientId)) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Rate limit exceeded. Please try again later.'
        }]
      };
    }
    
    // Proceed with tool execution
  }
);
```

## Implementation Timeline

1. Error Handling - High Priority
2. Verify Tool Discovery - High Priority
3. Enhanced Input Validation - Medium Priority
4. Progress Reporting - Medium Priority
5. Security Enhancements - Medium Priority
6. Tool Notifications - Low Priority

## References

- [MCP Tool Documentation](https://modelcontextprotocol.io/docs/concepts/tools/)
- [MCP Tool Examples](https://github.com/modelcontextprotocol/servers/blob/main/src/github/)
