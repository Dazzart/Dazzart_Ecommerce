const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Rol = require('./Rol');

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_usuario: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    correo_electronico: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cedula: {
        type: DataTypes.STRING,
        unique: true
    },
    direccion: {
        type: DataTypes.STRING
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Rol,
            key: 'id_rol'
        }
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo'
    },
    reset_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'usuario',
    timestamps: false
});

module.exports = Usuario;
