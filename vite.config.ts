/// <reference types="vitest" />

import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import { VantResolve, createStyleImportPlugin } from 'vite-plugin-style-import'
import { visualizer } from 'rollup-plugin-visualizer'

import pkg from './package.json'

const { dependencies, devDependencies, name, version } = pkg
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: Date.now(),
}
const banner = `/** @license ${name} (c) 2021-${__APP_INFO__.lastBuildTime} */`

const plugins = []

if (process.env.pkg_analyze) {
  plugins.push(
    visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  )
}

export default defineConfig({

  define: {
    __APP_INFO__: JSON.stringify(__APP_INFO__),
  },

  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    Vue({
      reactivityTransform: true,
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue/macros',
        'vue-router',
        '@vueuse/core',
      ],
      dts: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),

    createStyleImportPlugin({
      resolves: [VantResolve()],
    }),

    ...plugins,
  ],

  // 构建
  build: {
    // 传递给 Terser 的更多 minify 选项。
    terserOptions: {
      compress: {
        drop_debugger: true,
        drop_console: true,
      },
    },
    // 自定义底层的 Rollup 打包配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      // external: ['vue', 'axios', 'nprogress'],
      output: {
        banner,
      },
    },
    // chunk 大小警告的限制
    chunkSizeWarningLimit: 1024,
    // 浏览器兼容性  "esnext"|"modules"
    target: 'modules',
    // 输出路径
    outDir: 'dist',
    // 生成静态资源的存放路径
    assetsDir: 'assets',
    // 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项
    assetsInlineLimit: 4096,
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    // 构建后是否生成 source map 文件
    sourcemap: false,
    // 构建的库
    // 当设置为 true，构建后将会生成 manifest.json 文件
    manifest: false,
    // 设置为 false 可以禁用最小化混淆，
    // 或是用来指定使用哪种混淆器
    // boolean | 'terser' | 'esbuild'
    minify: 'terser',

    // 设置为 false 来禁用将构建后的文件写入磁盘
    write: true,
    // 默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
    emptyOutDir: true,
    // 启用/禁用 brotli 压缩大小报告
    brotliSize: true,
  },

  server: {
    open: false,

    port: 3333,
    // Load proxy configuration from .env
    // proxy: createProxy(VITE_PROXY),
    proxy: {
      '/dev': {
        target: 'http://{devhost}',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dev/, ''),
      },
    },

    hmr: {
      overlay: true,
    },
  },

  preview: {
    port: 3334,
  },

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
  },
})
