    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      // Set the base path for your deployed application.
      // This should be your GitHub repository name, surrounded by slashes.
      // For example, if your repo is 'bubble-pop-game', set it to '/bubble-pop-game/'.
      base: '/YOUR_REPO_NAME/', // <--- IMPORTANT: REPLACE 'YOUR_REPO_NAME' with your actual repository name

      plugins: [react()],
    })
    