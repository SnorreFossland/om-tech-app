import { test, expect, type APIResponse } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:3000'
const SELLER_EMAIL = process.env.SELLER_EMAIL || 'seller@example.com'
const PROPERTY_ID = process.env.PROPERTY_ID || 'cmhi9czp70004qs95ta8go93e'
const REP_ID = process.env.REP_ID || 'cmhi9czp10002qs959mkf6aay'

test('rep assign/unassign via dev mint endpoint', async ({ request }) => {
  // Mint dev session
  const mint = await request.post(`${BASE}/api/dev/mint-session`, {
    data: { email: SELLER_EMAIL, createIfMissing: true, role: 'SELLER' },
  })
  expect(mint.ok()).toBeTruthy()

  // Extract dev cookie and reuse for authenticated API calls
  const setCookie = mint.headers()['set-cookie']?.[0]
  console.log('mint set-cookie header:', mint.headers())
  expect(setCookie).toBeTruthy()
  const cookie = setCookie!.split(';')[0]
  const mintJson = await mint.json()
  const devId = mintJson?.id
  expect(devId).toBeTruthy()
  // Create a new property to assign the representative to
  const payload = {
    title: `E2E Temp Property for Assign ${Date.now()}`,
    address: `1 Assign Ave ${Date.now()}`,
    city: 'Assignville',
    state: 'AS',
    zipCode: '00001',
    propertyType: 'HOUSE',
    price: 50000,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 800,
    description: 'Temp property for rep assign test. This description intentionally exceeds fifty characters to satisfy validation rules.',
  }
  // Try creating the property, retrying with a more-unique address if we hit a duplicate/500 error.
  let createRes: APIResponse | undefined = undefined
  let attempts = 0
  let propertyId: string | undefined
  while (attempts < 3) {
    attempts += 1
    if (attempts > 1) payload.address = `${payload.address}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    createRes = await request.post(`${BASE}/api/properties`, { data: payload, headers: { cookie, 'x-dev-user-id': devId } })
    if (createRes && [200, 201].includes(createRes.status())) {
      const createJson = await createRes.json()
      propertyId = createJson?.data?.id || createJson?.id
      break
    }
    if (createRes) {
      const text = await createRes.text().catch(() => '')
      console.log('createRes debug', { status: createRes.status(), body: text })
    }
    if (createRes && createRes.status() === 409) {
      try {
        const listRes = await request.get(`${BASE}/api/properties?page=1&pageSize=50`)
        if (listRes.ok()) {
          const listJson = await listRes.json()
          const found = (listJson?.data || []).find((p: Record<string, unknown>) => {
            const addr = p['address'] as string | undefined
            const title = p['title'] as string | undefined
            return addr === payload.address || title === payload.title
          })
          if (found) {
            propertyId = found.id as string
            break
          }
        }
      } catch {
        // ignore
      }
      break
    }
    if (createRes && [500, 401, 502, 503].includes(createRes.status())) {
      await new Promise((r) => setTimeout(r, 200))
      continue
    }
    break
  }
  expect(propertyId).toBeTruthy()

  // Assign representative
  const assign = await request.post(`${BASE}/api/properties/${propertyId}/representative`, {
    data: { representativeId: REP_ID },
    headers: { cookie, 'x-dev-user-id': devId },
  })
  expect(assign.status()).toBe(200)
  const assignJson = await assign.json()
  expect(assignJson.data).toBeDefined()

  // Unassign representative
  const unassign = await request.delete(`${BASE}/api/properties/${PROPERTY_ID}/representative`, {
    headers: { cookie, 'x-dev-user-id': devId },
  })
  expect([200, 204]).toContain(unassign.status())
})
