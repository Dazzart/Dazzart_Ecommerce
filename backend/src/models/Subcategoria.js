const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Categoria = require('./Categoria');

const Subcategoria = sequelize.define('Subcategoria', {
    id_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_subcategoria: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion_subcategoria: {
        type: DataTypes.STRING
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Categoria,
            key: 'id_categoria'
        }
    }
}, {
    tableName: 'subcategoria',
    timestamps: false
});

module.exports = Subcategoria;
