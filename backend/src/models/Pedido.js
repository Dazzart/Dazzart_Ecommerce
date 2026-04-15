const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./Usuario');

const Pedido = sequelize.define('Pedido', {
    id_factura: {
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
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productos: {
        type: DataTypes.TEXT, 
        get() {
            const rawValue = this.getDataValue('productos');
            try {
                return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('productos', JSON.stringify(value));
        }
    },
    total_productos: {
        type: DataTypes.INTEGER
    },
    total: {
        type: DataTypes.DECIMAL(10, 2)
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'pendiente'
    },
    fecha_pedido: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // CAMBIO AQUÍ: Cambiamos BOOLEAN por INTEGER para que coincida con el SQL
    en_papelera: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    fecha_eliminado: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'pedidos',
    timestamps: false // Perfecto, esto evita buscar createdAt/updatedAt
});

module.exports = Pedido;