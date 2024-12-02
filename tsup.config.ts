import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'pocketbase-presigned-urls.pb': 'src/index.ts',
  },
  banner: {
    js: 'var module = module || {};',
  },
  format: ['cjs'],
  outExtension: (ext) => {
    return { js: `.js` }
  },
  dts: false,
  clean: false,
  outDir: 'pb_hooks',
  shims: true,
  skipNodeModulesBundle: false,
  target: 'node20',
  platform: 'node',
  minify: false,
  sourcemap: false,
  bundle: true,
  noExternal: [/(.*)/],
  external: ['pocketbase-presigned-urls.pb'],
})
