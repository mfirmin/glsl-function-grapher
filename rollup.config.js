import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: './src/index.js',

  plugins: [
//      babel({
//          exclude: [
//              '../node_modules/**',
//          ],
//          runtimeHelpers: true,
//      }),
//      builtins(),
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
