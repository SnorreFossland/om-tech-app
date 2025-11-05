import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
    resolve: {
        alias: {
            // map '@' to the workspace src folder so vitest can resolve project aliases
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        include: ['test/**/*.spec.ts', 'test/**/*.test.ts'],
        // run tests in a single thread/process to avoid SQLite file locking and test interference
        threads: false,
    },
});
