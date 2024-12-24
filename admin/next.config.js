module.exports = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  publicRuntimeConfig: {
    ADMIN_API_URL: process.env.ADMIN_API_URL || 'http://localhost:3000'
  },
  // Set the port for the admin panel
  server: {
    port: 3001
  }
}

