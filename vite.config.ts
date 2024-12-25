import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 5086,
      host: true
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  }
})
