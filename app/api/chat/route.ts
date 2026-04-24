import { NextRequest, NextResponse } from 'next/server';
import { sanitizeMessages } from '@/lib/prompt-guard';
import { MCP_TOOLS, executeMcpTool } from '@/lib/mcp-tools';
import { TEAM_MEMBERS, SHARED_EDUCATION, SHARED_CERTIFICATIONS, SHARED_SEMINARS, SHARED_SKILLS } from '@/lib/members';

// AI chat route — handles member persona switching and MCP tool calls

export const runtime = 'edge';

function buildSystemPrompt(): string {
  const memberProfiles = TEAM_MEMBERS.map((m) =>
    `- **${m.name}** (${m.role}): Born ${m.birthDate} in ${m.birthplace}. Gender: ${m.gender}. Citizenship: ${m.citizenship}. Religion: ${m.religion}. Address: ${m.address}. Email: ${m.email}.`
  ).join('\n');

  const certList = SHARED_CERTIFICATIONS.map((c) => `  - ${c}`).join('\n');

  const seminarList = SHARED_SEMINARS.map((s) =>
    `  - ${s.event}${s.theme ? ` — "${s.theme}"` : ''} at ${s.venue}${s.date ? ` (${s.date})` : ''}`
  ).join('\n');

  const skillList = SHARED_SKILLS.join(', ');

  return `You are the Digital Twin system. You represent real team members and respond AS the specific member the user wants to talk to.

## Available Team Members
${memberProfiles}

## Shared Background (all members share this)
**Education:** ${SHARED_EDUCATION}

**Certifications:**
${certList}

**Seminars/Workshops/Conferences Attended:**
${seminarList}

**Programming Skills:** ${skillList}

**Goal:** To enhance and expand knowledge as IT students. Earning certifications provides a competitive advantage.

## How to Behave
1. When the user first opens the chat, introduce yourself as the Digital Twin system and list the available members. Ask who they'd like to talk to.
2. When the user says they want to talk to a specific member (e.g., "I want to talk to Aeron", "Can I chat with Ethan?"), respond AS that member in first person. Say something like "Hey! I'm [name], nice to meet you! What would you like to know about me?"
3. Stay in character as that member. Use their personal data when answering personal questions (birthday, address, email, etc.).
4. When the user wants to switch to another member (e.g., "Let me talk to Ethan instead"), acknowledge the switch naturally and start responding as the new member.
5. If asked about education, certifications, seminars, or skills, use the shared background data above.
6. Be friendly, conversational, and natural. You ARE this person — speak as they would.
7. If the user asks a question you don't have data for, say so honestly rather than making things up.
8. You can also still help with career-related questions using your MCP tools when appropriate.

**MCP Tools Available** (use proactively when they can add value):
- analyze_skill_gap: Skill-gap analysis between current and target roles
- score_resume: Score a resume summary against a target role
- generate_interview_questions: Generate role-specific interview questions
- get_career_path: Suggest career progression paths
- get_member_profile: Retrieve full profile of a Digital Twin team member by name
- recommend_learning_resources: Curated learning resources for a specific technology or skill
- suggest_certifications: Suggest IT certifications based on career goals
- generate_study_plan: Create a week-by-week study plan for a technology or subject
- evaluate_tech_stack: Evaluate a tech stack for a student project
- assess_project_idea: Assess a student project idea for feasibility and learning value
- get_networking_tips: Actionable networking and career tips for IT students`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const rawMessages = (body as Record<string, unknown>)?.messages;

  const { messages, error } = sanitizeMessages(rawMessages as unknown[]);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // Build tool definitions for OpenRouter (OpenAI-compatible format)
  const tools = MCP_TOOLS;

  // First LLM call — may include tool_calls
  const firstResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools,
      tool_choice: 'auto',
    }),
  });

  if (!firstResponse.ok) {
    const errText = await firstResponse.text();
    console.error('OpenRouter error:', errText);
    return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
  }

  const firstData = await firstResponse.json();
  const firstChoice = firstData.choices?.[0];

  // If no tool calls, return the plain reply
  if (!firstChoice?.message?.tool_calls?.length) {
    const reply = firstChoice?.message?.content ?? 'No response';
    return NextResponse.json({ reply, mcp_tools_used: [] });
  }

  // Execute each MCP tool call
  const toolCalls: Array<{ id: string; function: { name: string; arguments: string } }> = firstChoice.message.tool_calls;
  const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];
  const mcpToolsUsed: string[] = [];

  for (const tc of toolCalls) {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(tc.function.arguments);
    } catch {
      args = {};
    }

    const result = executeMcpTool(tc.function.name, args);
    mcpToolsUsed.push(tc.function.name);

    toolResults.push({
      role: 'tool',
      tool_call_id: tc.id,
      content: result,
    });
  }

  // Second LLM call — feed tool results back so the model can synthesize
  const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
        firstChoice.message,
        ...toolResults,
      ],
    }),
  });

  if (!secondResponse.ok) {
    const errText = await secondResponse.text();
    console.error('OpenRouter error (tool follow-up):', errText);
    return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
  }

  const secondData = await secondResponse.json();
  const reply = secondData.choices?.[0]?.message?.content ?? 'No response';

  return NextResponse.json({ reply, mcp_tools_used: mcpToolsUsed });
}
