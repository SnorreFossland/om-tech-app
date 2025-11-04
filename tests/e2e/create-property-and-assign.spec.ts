import { test, expect } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:3000'
const SELLER_EMAIL = process.env.SELLER_EMAIL || 'seller@example.com'
const REP_ID = process.env.REP_ID || 'cmhi9czp10002qs959mkf6aay'

test('create property then assign/unassign representative (dev mint)', async ({ request }) => {
  // Mint dev session for seller (creates user if missing)
  const mint = await request.post(`${BASE}/api/dev/mint-session`, { data: { email: SELLER_EMAIL, createIfMissing: true, role: 'SELLER' } })
  expect(mint.ok()).toBeTruthy()

  const setCookie = mint.headers()['set-cookie']?.[0]
  console.log('mint set-cookie header:', mint.headers())
  expect(setCookie).toBeTruthy()
  const cookie = setCookie!.split(';')[0]
  const mintJson = await mint.json()
  const devId = mintJson?.id
  expect(devId).toBeTruthy()

  // Create a new property via API
  const payload = {
    title: `E2E Test Property ${Date.now()}`,
    address: `123 Test St ${Date.now()}`,
    city: 'Testville',
    state: 'TS',
    zipCode: '12345',
    propertyType: 'HOUSE',
    price: 100000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    description: 'Created by Playwright E2E test. This description intentionally exceeds fifty characters to satisfy validation rules.',
  }

  const createRes = await request.post(`${BASE}/api/properties`, { data: payload, headers: { cookie, 'x-dev-user-id': devId } })
  expect([200, 201]).toContain(createRes.status())
  const createJson = await createRes.json()
  const propertyId = createJson?.data?.id || createJson?.id
  expect(propertyId).toBeTruthy()

  // Assign representative
  const assign = await request.post(`${BASE}/api/properties/${propertyId}/representative`, {
    data: { representativeId: REP_ID },
    headers: { cookie, 'x-dev-user-id': devId },
  })
  expect(assign.status()).toBe(200)

  // Unassign representative
  const unassign = await request.delete(`${BASE}/api/properties/${propertyId}/representative`, { headers: { cookie, 'x-dev-user-id': devId } })
  expect([200, 204]).toContain(unassign.status())
})
