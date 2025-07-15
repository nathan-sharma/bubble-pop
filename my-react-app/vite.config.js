// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tailwind CSS v3 does NOT require the @tailwindcss/vite plugin here.
  // Vite will automatically use postcss.config.js if it's in your project root.
})