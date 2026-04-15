const sequelize = require('../config/db');
const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');
const Producto = require('./Producto');
const Descuento = require('./Descuento');
const DescuentoProducto = require('./DescuentoProducto');
const DescuentoCategoria = require('./DescuentoCategoria');
const Carrito = require('./Carrito');
const Pedido = require('./Pedido');

// Definir relaciones

// Rol - Usuario
Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

// Categoria - Subcategoria
Categoria.hasMany(Subcategoria, { foreignKey: 'id_categoria' });
Subcategoria.belongsTo(Categoria, { foreignKey: 'id_categoria' });

// Categoria - Producto
Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

// Subcategoria - Producto
Subcategoria.hasMany(Producto, { foreignKey: 'id_subcategoria', as: 'productos' });
Producto.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria', as: 'subcategoria' });

// Usuario - Carrito
Usuario.hasMany(Carrito, { foreignKey: 'id_usuario' });
Carrito.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Producto - Carrito
Producto.hasMany(Carrito, { foreignKey: 'id_producto' });
Carrito.belongsTo(Producto, { foreignKey: 'id_producto' });

// Usuario - Pedido
Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Descuento - Producto (Many-to-Many through DescuentoProducto)
Descuento.belongsToMany(Producto, { through: DescuentoProducto, foreignKey: 'id_descuento' });
Producto.belongsToMany(Descuento, { through: DescuentoProducto, foreignKey: 'id_producto' });

// Descuento - Categoria (Many-to-Many through DescuentoCategoria)
Descuento.belongsToMany(Categoria, { through: DescuentoCategoria, foreignKey: 'id_descuento' });
Categoria.belongsToMany(Descuento, { through: DescuentoCategoria, foreignKey: 'id_categoria' });

module.exports = {
    sequelize,
    Rol,
    Usuario,
    Categoria,
    Subcategoria,
    Producto,
    Descuento,
    DescuentoProducto,
    DescuentoCategoria,
    Carrito,
    Pedido
};
