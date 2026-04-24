import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }
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
    UPDATE members SET
      name = ${name.trim()},
      role = ${role ?? ''},
      department = ${department ?? ''},
      email = ${email ?? ''},
      birth_date = ${birth_date ?? ''},
      birthplace = ${birthplace ?? ''},
      gender = ${gender ?? ''},
      citizenship = ${citizenship ?? ''},
      religion = ${religion ?? ''},
      address = ${address ?? ''}
    WHERE id = ${id}
    RETURNING *
  `;
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }
  const result = await sql`DELETE FROM members WHERE id = ${id} RETURNING id`;
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
