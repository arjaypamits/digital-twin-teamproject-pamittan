import { NextRequest, NextResponse } from 'next/server';
import { sanitizeMessages } from '@/lib/prompt-guard';

const SYSTEM_PROMPT = `You are Digital Twin, an expert AI career coach and guidance agent. You specialize in:

**Career Profile Analysis**: Ask targeted questions about background, years of experience, industry, current role, education, and career aspirations. Build a comprehensive profile and deliver personalized, specific insights.

**Skill Gap Detection**: When users mention a target role or company, identify exactly which skills they are missing. Recommend specific resources (courses, certifications, projects) with realistic learning timelines.

**Resume & Profile Feedback**: Help users craft compelling resumes, LinkedIn profiles, and personal brands. Provide specific, actionable suggestions tied to their target roles.

**Interview Preparation**: Conduct realistic mock interviews tailored to specific roles. Ask relevant questions, evaluate answers using the STAR method, and give detailed feedback on content, structure, and delivery.

Guidelines:
- Be conversational, encouraging, and highly specific — avoid generic advice
- Ask one or two clarifying questions when more context would improve your guidance
- When detecting skill gaps, list them clearly and prioritize by importance
- For interview prep, stay in character as the interviewer until the user asks for feedback
- Always tie advice back to the user's specific situation and goals`;

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

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenRouter error:', errText);
    return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? 'No response';
  return NextResponse.json({ reply });
}
