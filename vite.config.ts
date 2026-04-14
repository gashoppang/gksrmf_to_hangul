import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173
  const host = env.VITE_HOST || undefined
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map((value) => value.trim()).filter(Boolean)
    : undefined

  return {
    plugins: [react()],
    server: {
      allowedHosts,
      host,
      port,
    },
    preview: {
      host,
      port,
    },
  }
})

