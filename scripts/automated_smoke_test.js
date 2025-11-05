#!/usr/bin/env node
/*
 Automated smoke test:
 - Signs in via NextAuth Credentials provider (assumes seller@example.com / password)
 - Calls POST /api/properties/:id/representative to assign a representative
 - Calls DELETE /api/properties/:id/representative to unassign

 Usage:
  BASE=http://localhost:3000 SELLER_EMAIL=seller@example.com SELLER_PASSWORD=password \ 
    PROPERTY_ID=cmhi9czp70004qs95ta8go93e REP_ID=cmhi9czp10002qs959mkf6aay \
    node scripts/automated_smoke_test.js

Notes:
 - Assumes the app is running at BASE. If the credentials differ, override env vars.
 - This script is a light smoke test for auth-protected endpoints and will print responses.
*/

const BASE = process.env.BASE || 'http://localhost:3000'
const SELLER_EMAIL = process.env.SELLER_EMAIL || 'seller@example.com'
const PROPERTY_ID = process.env.PROPERTY_ID || 'cmhi9czp70004qs95ta8go93e'
const REP_ID = process.env.REP_ID || 'cmhi9czp10002qs959mkf6aay'

function debug(...args) { console.log('[smoke]', ...args) }

async function fetchJson(url, opts) {
    const res = await fetch(url, opts)
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch (e) { /* not json */ }
    return { status: res.status, headers: res.headers, text, json }
}


function cookieHeaderFromJar(jar) {
    // jar is array of set-cookie header strings; extract "name=value" parts
    return jar
        .map(h => h.split(';')[0])
        .filter(Boolean)
        .join('; ')
}


async function assignRepresentative(cookieHeader) {
    debug('assigning rep', REP_ID, 'to property', PROPERTY_ID)
    const res = await fetch(`${BASE}/api/properties/${PROPERTY_ID}/representative`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'cookie': cookieHeader
        },
        body: JSON.stringify({ representativeId: REP_ID })
    })
    let bodyText = await res.text()
    let json = null
    try { json = JSON.parse(bodyText) } catch { }
    debug('assign status', res.status, json || bodyText)
    return { status: res.status, json, text: bodyText }
}

async function unassignRepresentative(cookieHeader) {
    debug('unassigning rep from property', PROPERTY_ID)
    const res = await fetch(`${BASE}/api/properties/${PROPERTY_ID}/representative`, {
        method: 'DELETE',
        headers: {
            'cookie': cookieHeader
        }
    })
    let bodyText = await res.text()
    let json = null
    try { json = JSON.parse(bodyText) } catch { }
    debug('unassign status', res.status, json || bodyText)
    return { status: res.status, json, text: bodyText }
}

; (async function main() {
    try {
        const cookieJar = []
        // Mint a dev session cookie (fast, local-only). If the endpoint fails,
        // abort the smoke test since we require an authenticated session for the
        // protected endpoints.
        const mint = await fetchJson(`${BASE}/api/dev/mint-session`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: SELLER_EMAIL, createIfMissing: true })
        })
        if (mint.status !== 200) {
            throw new Error('Dev mint failed: ' + JSON.stringify(mint))
        }
        const setCookie = mint.headers.get && mint.headers.get('set-cookie')
        if (setCookie) cookieJar.push(setCookie)
        debug('dev mint successful')
        const cookieHeader = cookieHeaderFromJar(cookieJar)
        debug('cookieHeader:', cookieHeader.split(';').slice(0, 3).join('; '))

        const assignRes = await assignRepresentative(cookieHeader)
        if (assignRes.status >= 400) {
            debug('assign failed — aborting unassign step')
        } else {
            // attempt unassign
            await unassignRepresentative(cookieHeader)
        }

        debug('smoke test finished')
    } catch (err) {
        console.error('[smoke] error:', err && err.stack ? err.stack : err)
        process.exitCode = 2
    }
})()
