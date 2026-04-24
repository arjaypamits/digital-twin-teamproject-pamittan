import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, role, department, email, birth_date, birthplace, gender, citizenship, religion, address } = body;
  const result = await sql`
    UPDATE members SET
      name = ${name},
      role = ${role},
      department = ${department},
      email = ${email},
      birth_date = ${birth_date},
      birthplace = ${birthplace},
      gender = ${gender},
      citizenship = ${citizenship},
      religion = ${religion},
      address = ${address}
    WHERE id = ${id}
    RETURNING *
  `;
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM members WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
