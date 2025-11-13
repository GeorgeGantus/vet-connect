import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // Load env file based on `mode` in the current working directory.
  return {
    plugins: [react()],
    // Use process.env or env object to access the variables
    base: '/',
  }
})
