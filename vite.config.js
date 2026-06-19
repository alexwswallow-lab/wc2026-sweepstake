import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/wc2026-sweepstake/',
  plugins: [react()],
})
