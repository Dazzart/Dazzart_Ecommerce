module.exports = {
  apps: [{
    name: 'dazzart-backend',
    script: 'index.js',
    env: {
      NODE_ENV: 'production',
      DB_HOST: '127.0.0.1',
      DB_USER: 'postgres',
      DB_PASSWORD: 'super',
      DB_NAME: 'postgres',
      DB_PORT: 5432,
      PORT: 3001
    }
  }]
}