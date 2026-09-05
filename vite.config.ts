import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Relative asset paths so the production build works both at a domain root
  // and under a subpath (e.g. GitHub Pages project sites: /<repo>/).
  base: command === 'build' ? './' : '/',
}))
