import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite configuration for the test application
 */
export default defineConfig({
    plugins: [react()],
    base: process.env.VITE_BASE_PATH || '/',
    resolve: {
        alias: {
            '@components': resolve(__dirname, '../src/components'),
            '@services': resolve(__dirname, '../src/services'),
            '@stores': resolve(__dirname, '../src/stores'),
            '@hooks': resolve(__dirname, '../src/hooks'),
            '@models': resolve(__dirname, '../src/models'),
            '@commands': resolve(__dirname, '../src/commands'),
            '@visitors': resolve(__dirname, '../src/visitors'),
            '@utils': resolve(__dirname, '../src/utils'),
            // Force all React imports to resolve to test-app's node_modules
            // This prevents multiple React instances when importing from parent src
            'react': resolve(__dirname, './node_modules/react'),
            'react-dom': resolve(__dirname, './node_modules/react-dom'),
            'react/jsx-runtime': resolve(__dirname, './node_modules/react/jsx-runtime'),
            'zustand': resolve(__dirname, './node_modules/zustand'),
            'zustand/react': resolve(__dirname, './node_modules/zustand/react.js'),
            '@apitomy/data-models': resolve(__dirname, './node_modules/@apitomy/data-models'),
        },
        dedupe: ['react', 'react-dom', 'zustand', '@apitomy/data-models'],
    },
    server: {
        port: 3000,
        open: true,
    },
});
