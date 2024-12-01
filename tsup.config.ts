import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    lib: 'src/lib.ts',
    index: 'src/index.ts',
  },
  format: ['cjs'],
  outExtension: (ext) => {
    return { js: `.js` }
  },
  dts: false,
  clean: false,
  outDir: 'dist',
  shims: true,
  skipNodeModulesBundle: false,
  target: 'node20',
  platform: 'node',
  minify: false,
  sourcemap: false,
  bundle: true,
  external: ['pocketbase-presigned-urls', 'url-parse'],
})
