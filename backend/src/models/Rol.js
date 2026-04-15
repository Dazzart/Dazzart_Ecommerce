const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rol = sequelize.define('Rol', {
    id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_rol: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'roles',
    timestamps: false
});

module.exports = Rol;
