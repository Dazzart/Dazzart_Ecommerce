// backend/swagger.js
const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['./src/app.js'];

const doc = {
  info: {
    title: 'API DAZZART',
    description: 'Documentación de la API de DAZZART',
  },
  host: '3.134.246.187:3001',
  schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, doc);
