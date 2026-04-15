const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dazzart_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'super',
  {
    host: process.env.DB_HOST || 'db-dazzart',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    define: {
      // 1. CAMBIO CRÍTICO: Tu SQL NO tiene las columnas createdAt ni updatedAt. 
      // Si dejas esto en true, Sequelize fallará al no encontrarlas.
      timestamps: false, 
      
      // 2. Mantiene el nombre tal cual lo definas en el modelo (singular/plural)
      freezeTableName: true 
    },
    logging: (msg) => {
      // Solo logueamos errores o queries importantes para no saturar la consola
      if (msg.includes('ERROR') || msg.includes('SELECT')) {
        console.log(`[DB_LOG]: ${msg.includes('ERROR') ? '❌ ' : '🔍 '}${msg}`);
      }
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a Postgres.');
    
    // 3. NUNCA uses force: true aquí, o borrarás el SQL que importaste.
    // alter: false es lo más seguro para desarrollo con datos existentes.
    await sequelize.sync({ alter: false }); 
    console.log('✅ Modelos vinculados exitosamente.');
  } catch (error) {
    console.error('❌ Error crítico de base de datos:', error.message);
  }
};

syncDB();

module.exports = sequelize;