const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Descuento = sequelize.define('Descuento', {
    id_descuento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    estado_descuento: {
        type: DataTypes.STRING
    },
    fecha_inicio: {
        type: DataTypes.DATE
    },
    fecha_fin: {
        type: DataTypes.DATE
    },
    tipo_descuento: {
        type: DataTypes.STRING
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2)
    },
    aplicacion: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'descuento',
    timestamps: false
});

module.exports = Descuento;
