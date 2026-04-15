const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');

const Producto = sequelize.define('Producto', {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero_serial: {
        type: DataTypes.STRING
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Categoria,
            key: 'id_categoria'
        }
    },
    id_subcategoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Subcategoria,
            key: 'id_subcategoria'
        }
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    imagen: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'producto',
    freezeTableName: true, 
    timestamps: false
});

module.exports = Producto;
