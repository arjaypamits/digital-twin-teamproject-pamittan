import { NextRequest, NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function GET() {
  await initDB();
  const members = await sql`SELECT * FROM members ORDER BY department, id`;
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  await initDB();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const { name, role, department, email, birth_date, birthplace, gender, citizenship, religion, address } = body as Record<string, string>;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 });
  }
  const result = await sql`
    INSERT INTO members (name, role, department, email, birth_date, birthplace, gender, citizenship, religion, address)
    VALUES (${name.trim()}, ${role ?? ''}, ${department ?? ''}, ${email ?? ''}, ${birth_date ?? ''}, ${birthplace ?? ''}, ${gender ?? ''}, ${citizenship ?? ''}, ${religion ?? ''}, ${address ?? ''})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}
