import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

export default {
    input: './src/index.js',

    plugins: [
        replace({
//           'process.env.NODE_ENV': JSON.stringify('development'), // or 'development'
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.VUE_ENV': JSON.stringify('browser')
        }),
        commonjs({
            include: [
                'node_modules/**',
            ],
            ignoreGlobal: false,
            sourceMap: false,
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
    ],
    output: {
        file: './static/functiongrapher.js',
        format: 'umd',
        name: 'FG',
    },
};
