import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const role = url.searchParams.get('role') || undefined

  const where: Record<string, unknown> = {}
    if (role) where.role = role

    const users = await prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true } })
    return NextResponse.json({ data: users })
  } catch (err) {
    console.error('GET /api/users error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
