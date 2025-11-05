#!/usr/bin/env node
const http = require('http');
const os = require('os');

function testUrl(url, timeout = 2000) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            // any 2xx/3xx/4xx is acceptable; connection succeeded
            res.resume();
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(timeout, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function detect() {
    const port = process.env.PORT || 3000;
    const candidates = [];

    // prefer loopback addresses
    candidates.push(`http://127.0.0.1:${port}`);
    candidates.push(`http://localhost:${port}`);

    // add all non-internal IPv4 addresses
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                candidates.push(`http://${iface.address}:${port}`);
            }
        }
    }

    for (const base of candidates) {
        try {
            const ok = await testUrl(`${base}/api/ping`);
            if (ok) {
                console.log(base);
                return base;
            }
        } catch (e) {
            // ignore
        }
    }

    console.error('No reachable base URL found. Tried:', candidates.join(', '));
    process.exitCode = 2;
    return null;
}

if (require.main === module) {
    detect().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { detect };
