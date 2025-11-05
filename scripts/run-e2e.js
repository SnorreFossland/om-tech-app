#!/usr/bin/env node
const { spawn } = require('child_process');
const { detect } = require('./get-base');

async function main() {
    const base = await detect();
    if (!base) process.exit(2);

    console.log('Using BASE=', base);

    const env = Object.assign({}, process.env, { BASE: base });

    const child = spawn('npm', ['run', 'test:e2e', '--silent'], {
        stdio: 'inherit',
        env,
    });

    child.on('exit', (code) => {
        process.exit(code);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
