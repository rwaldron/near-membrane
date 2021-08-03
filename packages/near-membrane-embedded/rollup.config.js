import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: `lib/index.js`,
            format: 'iife',
            name: 'createVirtualEnvironment',
            sourcemap: true,
        },
        {
            file: `lib/index.min.js`,
            format: 'iife',
            name: 'createVirtualEnvironment',
            sourcemap: true,
            plugins: [terser()],
        },
    ],
    plugins: [resolve(), typescript()],
};
