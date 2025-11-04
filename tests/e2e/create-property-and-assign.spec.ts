import { test, expect, type APIResponse } from '@playwright/test'

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

  // Try creating the property, retrying with a more-unique address if we hit a duplicate/500 error.
  let createRes: APIResponse | undefined = undefined
  let attempts = 0
  let propertyId: string | undefined
  while (attempts < 3) {
    attempts += 1
    // make address more unique on retries
    if (attempts > 1) payload.address = `${payload.address}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    createRes = await request.post(`${BASE}/api/properties`, { data: payload, headers: { cookie, 'x-dev-user-id': devId } })
    if (createRes && [200, 201].includes(createRes.status())) {
      const createJson = await createRes.json()
      propertyId = createJson?.data?.id || createJson?.id
      break
    }
    if (createRes && createRes.status() === 409) {
      // duplicate detected; stop retrying and proceed to check propertyId
      break
    }
    // if server error (500), retry with a new address
    if (createRes && createRes.status() === 500) continue
    break
  }
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
