import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import {
  HeadlessUiResolver,
  VueUseComponentsResolver,
} from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Unfonts from 'unplugin-fonts/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: true,
      imports: ['vue', 'vue-router', '@vueuse/core', 'pinia', 'vitest'],
      eslintrc: {
        enabled: true,
      },
      dirs: ['./src/composables', './src/utils'],
    }),
    Components({
      dts: true,
      resolvers: [
        HeadlessUiResolver({ prefix: '' }),
        IconsResolver({ prefix: '' }),
        VueUseComponentsResolver(),
      ],
    }),
    Icons({ autoInstall: true }),
    Unfonts({
      custom: {
        families: [
          {
            name: 'Rubik',
            local: 'Rubik',
            src: './src/assets/fonts/*.ttf',
          },
        ],
        display: 'auto',
        preload: true,
        prefetch: false,
      },
    }),
    tsconfigPaths(),

    // Plugin "configure-token"
    {
      name: 'configure-token',
      // "pre" = esegui prima della fallback
      enforce: 'pre',
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            console.log('Richiesta arrivata a:', req.url)
    
            try {
              // Proviamo a recuperare la URL originale, se disponibile.
              const fullUrl = new URL(req.originalUrl || req.url, 'http://localhost')
              const user = fullUrl.searchParams.get('username') || 'adm_in'
              const pass = fullUrl.searchParams.get('password') || 'admin'
    
              console.log('username:', user, 'password:', pass)
    
              // Esegui la fetch verso l'endpoint di autenticazione
              const output = await fetch('http://localhost:1865/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass }),
              }).then(r => r.json())
    
              // Imposta il cookie
              res.setHeader('Set-Cookie', `ccat_user_token=${output.access_token}`)
            } catch (err) {
              console.error('Errore durante il recupero del token:', err)
            }
    
            next()
          })
        }
      },
    },
    
    
    
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/*'],
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        minifyInternalExports: true,
        entryFileNames: 'assets/cat.js',
        assetFileNames: info =>
          `assets/${info.name?.endsWith('css') ? 'cat' : '[name]'}[extname]`,
        chunkFileNames: 'chunk.js',
        manualChunks: () => 'chunk.js',
        generatedCode: {
          preset: 'es2015',
          constBindings: true,
          objectShorthand: true,
        },
      },
    },
  },
})
