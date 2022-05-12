import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
// import alias from '@rollup/plugin-alias';
import { terser } from 'rollup-plugin-terser'
// import copy from 'rollup-plugin-copy'
import rm from 'rimraf'

const input = process.env.INPUT_FILE
const NODE_ENV = process.env.NODE_ENV
const isPro = function () {
  return NODE_ENV === 'production'
}

const root = process.cwd()
// 获取每个包的package.json 文件
const pkg = require(path.resolve(root, 'package.json'))

const extensions = ['.js', '.ts']
const external = []

const output = [{
  exports: 'auto',
  file: path.join(root, pkg.module),
  format: 'esm',
}]

if (isPro()) {
  // external.push(/@two-ui/)
  output.push({
    exports: 'auto',
    file: path.resolve(root, pkg.main),
    format: 'cjs'
  })
}

rm(path.resolve(root, 'dist'), err => {
  if (err) throw err
})

const babelConfig = {
  extensions,
  exclude: [
    '*.config.js',
    'packages/**/node_modules/*.d.ts',
    'node_modules/**',
    '**/dist/**/*',
  ],
  // babelHelpers: 'bundled',
  babelHelpers: 'bundled',// 使plugin-transform-runtime生效
  /* "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "useBuiltIns": "usage",
        "corejs": "3.15.2",
        // 目标浏览器
        "targets": {
          "browsers": "> 1%, IE 11, not op_mini all, not dead",
          "node": 8
        }
      }
    ],
    "@babel/preset-typescript"
  ],
  "plugins": [
    // "@vue/babel-plugin-jsx"
    // "@babel/plugin-transform-runtime"
  ] */
}

export default {
  input,
  output,
  external,
  watch: {
    exclude: 'node_modules/**'
  },
  plugins: [
    resolve({
      preferBuiltins: false,
      mainFields: ['module', 'main'],
      extensions
    }),
    babel(babelConfig),
    commonjs(),
    json(),
    /* copy({
      targets: [
        {
          src: 'LICENSE',
          dest: 'dist',
          rename: 'LICENSE.md'
        }
      ]
    }), */
    isPro() && terser({
      output: {
        comments: false
      }
    }),
    !isPro() && replace({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    })
  ]
}