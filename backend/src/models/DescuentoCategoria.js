const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Descuento = require('./Descuento');
const Categoria = require('./Categoria');

const DescuentoCategoria = sequelize.define('DescuentoCategoria', {
    id_descuento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Descuento,
            key: 'id_descuento'
        }
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Categoria,
            key: 'id_categoria'
        }
    }
}, {
    tableName: 'descuento_categoria',
    timestamps: false
});

module.exports = DescuentoCategoria;
