const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'backend-dazzart' },
    transports: [
        // Escribir todos los logs con nivel 'error' o menor en 'error.log'
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        // Escribir todos los logs con nivel 'info' o menor en 'combined.log'
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log')
        }),
    ],
    
});

// Si no estamos en producción, mostrar logs en la consola también con un formato simple
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;
