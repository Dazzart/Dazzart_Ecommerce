const { sequelize, Rol, Usuario, Categoria, Subcategoria, Producto } = require('../models');
const bcrypt = require('bcrypt');

const seed = async () => {
    try {
        console.log('🔄 Sincronizando base de datos...');
        await sequelize.sync({ force: false }); // ¡ESTO BORRA TODO!
        console.log('✅ Base de datos sincronizada.');

        console.log('🌱 Sembrando datos...');

        // 1. Roles
        const rolAdmin = await Rol.create({ nombre_rol: 'Administrador' });
        const rolCliente = await Rol.create({ nombre_rol: 'Cliente' });

        // 2. Administrador
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await Usuario.create({
            nombre: 'Administrador Principal',
            nombre_usuario: 'admin',
            correo_electronico: 'admin@dazzart.com',
            contrasena: hashedPassword,
            id_rol: rolAdmin.id_rol,
            estado: 'activo',
            telefono: '3001234567',
            direccion: 'Oficina Central'
        });

        // 3. Categorías
        const catHombres = await Categoria.create({ nombre_categoria: 'Hombres', descripcion_categoria: 'Ropa para caballeros' });
        const catMujeres = await Categoria.create({ nombre_categoria: 'Mujeres', descripcion_categoria: 'Ropa para damas' });
        const catNinos = await Categoria.create({ nombre_categoria: 'Niños', descripcion_categoria: 'Ropa para niños' });

        // 4. Subcategorías (Ejemplo)
        await Subcategoria.create({ nombre_subcategoria: 'Camisetas', descripcion_subcategoria: 'Camisetas de todo tipo', id_categoria: catHombres.id_categoria });
        await Subcategoria.create({ nombre_subcategoria: 'Pantalones', descripcion_subcategoria: 'Jeans y pantalones', id_categoria: catHombres.id_categoria });

        await Subcategoria.create({ nombre_subcategoria: 'Blusas', descripcion_subcategoria: 'Blusas elegantes y casuales', id_categoria: catMujeres.id_categoria });
        await Subcategoria.create({ nombre_subcategoria: 'Vestidos', descripcion_subcategoria: 'Vestidos de temporada', id_categoria: catMujeres.id_categoria });

        console.log('✅ Seeders ejecutados correctamente.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al ejecutar seeders:', error);
        process.exit(1);
    }
};

seed();
