import {defineConfig} from 'vitest/config';import react from '@vitejs/plugin-react';import path from 'node:path';
export default defineConfig({plugins:[react()],resolve:{alias:{'@':path.resolve('.')}},test:{environment:'jsdom',include:['frontend/src/__tests__/**/*.test.tsx','tests/otp.test.ts'],setupFiles:['./tests/setup.ts']}});
