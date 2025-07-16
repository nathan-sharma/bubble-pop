    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      // IMPORTANT: Set the base path for your deployed application.
      // This MUST be your exact GitHub repository name, surrounded by forward slashes.
      //
      // Example: If your GitHub repository URL is:
      //    https://github.com/YOUR_GITHUB_USERNAME/my-bubble-pop-game
      // Then the 'base' value should be:
      //    base: '/my-bubble-pop-game/',
      //
      // Make sure the slashes are present at both the beginning and the end.
      base: '/bubble-pop/', // <--- PLEASE REPLACE THIS WITH YOUR EXACT REPOSITORY NAME FROM GITHUB

      plugins: [react()],
    })
    