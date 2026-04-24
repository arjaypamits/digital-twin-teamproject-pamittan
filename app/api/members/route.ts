import { NextRequest, NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function GET() {
  await initDB();
  const members = await sql`SELECT * FROM members ORDER BY department, id`;
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  await initDB();
  const body = await req.json();
  const { name, role, department, email, birth_date, birthplace, gender, citizenship, religion, address } = body;
  const result = await sql`
    INSERT INTO members (name, role, department, email, birth_date, birthplace, gender, citizenship, religion, address)
    VALUES (${name}, ${role}, ${department}, ${email}, ${birth_date}, ${birthplace}, ${gender}, ${citizenship}, ${religion}, ${address})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}
