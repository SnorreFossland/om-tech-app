import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'
import bcrypt from 'bcryptjs'

// Development-only helper to set a dev cookie identifying a user by id or email.
// This lets local smoke-test scripts authenticate protected endpoints without
// going through the full NextAuth flow. It is guarded by NODE_ENV==='development'.
export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse(JSON.stringify({ error: 'Not available' }), { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const { id, email, createIfMissing = true, role = 'SELLER' } = body || {}
    if (!id && !email) {
      return new NextResponse(JSON.stringify({ error: 'Missing id or email' }), { status: 400 })
    }

    let user = id
      ? await prisma.user.findUnique({ where: { id } })
      : await prisma.user.findUnique({ where: { email } })

    if (!user && createIfMissing) {
      // Create-or-return a minimal test user (upsert) so concurrent calls don't hit P2002.
      const hashed = await bcrypt.hash('password', 10)
      const upserted = await prisma.user.upsert({
        where: { email: email as string },
        update: {},
        create: {
          email: email ?? `dev+${Date.now()}@example.com`,
          password: hashed,
          name: email?.split('@')[0] ?? 'dev-user',
          role: role as any,
        },
      })
      user = upserted
    }

    if (!user) return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 })

    // Set a simple dev cookie with the user id. HttpOnly for safety but available
    // to server-side checks via the cookie header. Expires in 1 hour.
    const maxAge = 60 * 60
    const cookie = `dev-user-id=${user.id}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`

    const res = NextResponse.json({ ok: true, id: user.id, email: user.email, role: user.role })
    res.headers.append('Set-Cookie', cookie)
  // Also expose the dev id in a response header to help programmatic test runners
  res.headers.append('x-dev-user-id', user.id)
    return res
  } catch (err) {
    console.error('POST /api/dev/mint-session error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
