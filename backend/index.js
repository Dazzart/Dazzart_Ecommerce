require('dotenv').config();

const logger = require('./src/config/logger');
const createApp = require('./src/app');

const app = createApp();

const PORT = process.env.PORT || 3001;

// Servidor con manejo de errores mejorado
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('\n╔════════════════════════════════════════════════════╗');
  logger.info('║         🚀 BACKEND DAZZART INICIADO');
  logger.info(`║         🌐 URL Publica: https://3.134.246.187`);
  logger.info(`║         🔒 URL Privada: http://172.31.72.190   :${PORT}`);
  logger.info('║         ✅ Status: ESCUCHANDO');
  logger.info('╚════════════════════════════════════════════════════╝\n');
});

// Manejo de errores del servidor
server.on('error', (err) => {
  logger.error('❌ Error del servidor: %o', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('\n⚠️  SIGTERM recibido, cerrando servidor gracefully...');
  server.close(() => {
    logger.info('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.warn('\n⚠️  SIGINT recibido, cerrando servidor gracefully...');
  server.close(() => {
    logger.info('✅ Servidor cerrado');
    process.exit(0);
  });
});
