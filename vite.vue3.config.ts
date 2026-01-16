import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/plugins/vue3.ts'],
      outDir: 'dist'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/plugins/vue3.ts'),
      name: 'APMVue3',
      fileName: (format) => `vue3.${format === 'es' ? 'mjs' : 'js'}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', '@power/apm-client-js'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    sourcemap: true
  }
})
