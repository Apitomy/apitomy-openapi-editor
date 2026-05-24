import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ApitomyOpenAPIEditor',
            formats: ['es', 'cjs'],
            fileName: (format) => `apitomy-openapi-editor.${format}.js`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@patternfly/react-core',
                '@patternfly/react-table',
                '@patternfly/react-icons',
                'zustand',
                '@apitomy/data-models',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'react/jsx-runtime',
                    '@patternfly/react-core': 'PatternflyReactCore',
                    '@patternfly/react-table': 'PatternflyReactTable',
                    '@patternfly/react-icons': 'PatternflyReactIcons',
                },
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@components': resolve(__dirname, './src/components'),
            '@services': resolve(__dirname, './src/services'),
            '@stores': resolve(__dirname, './src/stores'),
            '@hooks': resolve(__dirname, './src/hooks'),
            '@models': resolve(__dirname, './src/models'),
            '@commands': resolve(__dirname, './src/commands'),
            '@visitors': resolve(__dirname, './src/visitors'),
            '@utils': resolve(__dirname, './src/utils'),
        },
    },
});
