import { NextRequest, NextResponse } from 'next/server';
import { MCP_TOOLS, executeMcpTool } from '@/lib/mcp-tools';

export const runtime = 'edge';

/**
 * GET /api/mcp — List available MCP tools (tool discovery).
 */
export async function GET() {
  return NextResponse.json({
    name: 'digital-twin-mcp-server',
    version: '1.0.0',
    description:
      'MCP Server for Digital Twin AI Career Coach — exposes career-coaching tools for skill-gap analysis, resume scoring, interview prep, and career pathing.',
    tools: MCP_TOOLS,
  });
}

/**
 * POST /api/mcp — Execute an MCP tool.
 *
 * Body: { tool: string, arguments: Record<string, unknown> }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const toolName = body.tool as string | undefined;
  const args = (body.arguments ?? {}) as Record<string, unknown>;

  if (!toolName || typeof toolName !== 'string') {
    return NextResponse.json({ error: 'Missing required field: tool' }, { status: 400 });
  }

  const validNames = MCP_TOOLS.map((t) => t.function.name);
  if (!validNames.includes(toolName)) {
    return NextResponse.json(
      { error: `Unknown tool "${toolName}". Available: ${validNames.join(', ')}` },
      { status: 400 },
    );
  }

  const result = executeMcpTool(toolName, args);

  return NextResponse.json({
    tool: toolName,
    result: JSON.parse(result),
  });
}
