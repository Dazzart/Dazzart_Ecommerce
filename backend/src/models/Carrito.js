const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./Usuario');
const Producto = require('./Producto');

const Carrito = sequelize.define('Carrito', {
    id_carrito: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id_usuario'
        }
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Producto,
            key: 'id_producto'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'carrito',
    timestamps: false
});

module.exports = Carrito;
