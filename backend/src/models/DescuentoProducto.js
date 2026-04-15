const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Descuento = require('./Descuento');
const Producto = require('./Producto');

const DescuentoProducto = sequelize.define('DescuentoProducto', {
    id_descuento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Descuento,
            key: 'id_descuento'
        }
    },
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Producto,
            key: 'id_producto'
        }
    }
}, {
    tableName: 'descuento_producto',
    timestamps: false
});

module.exports = DescuentoProducto;
