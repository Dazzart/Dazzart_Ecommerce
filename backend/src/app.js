const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routers
const productosRouter = require('./routes/productosrouter');
const categoriasRouter = require('./routes/categoriasrouter');
const subcategoriasRouter = require('./routes/subcategoriasrouter');
const pedidosRouter = require('./routes/pedidosRouter');
const carritoRouter = require('./routes/carritoRouter');
const userRoutes = require('./routes/userRouter');
const descuentoRoutes = require('./routes/descuentoRouter');
const authRouter = require('./routes/authRouter');

const morgan = require('morgan');
const logger = require('./config/logger');

const createApp = () => {
  const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://app.dazzartcomponents.store'
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Permitir si no hay origen (como Postman o peticiones locales)
      // O si el origen está en la lista
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // LOG EXTRA: Esto te dirá en la consola EXACTAMENTE qué origen está rechazando
      console.log("CORS bloqueó este origen:", origin);
      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Middleware base
  app.use(express.json());

  // Middleware de logging (Morgan)
  app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));

  // Ruta raíz
  app.get('/', (req, res) => {
    res.send('API de DAZZART - Funcionando ✅');
  });

  // API Routes
  app.use('/api/login', authRouter);
  app.use('/api/productos', productosRouter);
  app.use('/api/categorias', categoriasRouter);
  app.use('/api/subcategorias', subcategoriasRouter);
  app.use('/api/pedidos', pedidosRouter);
  app.use('/api/carrito', carritoRouter);
  app.use('/api/usuarios', userRoutes);
  app.use('/api/descuentos', descuentoRoutes);

  // Imágenes Estáticas
  app.use('/productos/img', express.static(path.join(__dirname, '../public/img')));

  // Documentación Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Manejador de errores global
  app.use((err, req, res, next) => {
    logger.error('SERVER ERROR: %s', err.stack || err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  });

  return app;
};

module.exports = createApp;