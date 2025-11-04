import { test, expect } from '@playwright/test'

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
  const createRes = await request.post(`${BASE}/api/properties`, { data: payload, headers: { cookie, 'x-dev-user-id': devId } })
  // Accept 200/201 for created/saved or 409 if the same owner/address already exists (unique constraint)
  expect([200, 201, 409]).toContain(createRes.status())
  const createJson = await createRes.json()
  const propertyId = createJson?.data?.id || createJson?.id
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
