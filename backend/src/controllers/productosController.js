const fs = require('fs');
const path = require('path');
const { Producto, Descuento, DescuentoProducto, DescuentoCategoria, Categoria, Subcategoria, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper para calcular descuentos
const calcularPrecioFinal = (producto, descuentos) => {
  const precioBase = parseFloat(producto.precio);
  let precio_final = precioBase;
  let descuento_aplicado = null;

  // Filtrar descuentos aplicables
  // Nota: En la versión anterior se asume que 'descuentos' es una lista filtrada de descuentos ACTIVOS.
  // Aquí buscaremos el mejor descuento aplicable.

  // Encontrar descuento directo al producto
  const descProducto = descuentos.find(d =>
    d.DescuentoProductos && d.DescuentoProductos.some(dp => dp.id_producto === producto.id_producto)
  );

  // Encontrar descuento por categoría
  const descCategoria = descuentos.find(d =>
    d.DescuentoCategorias && d.DescuentoCategorias.some(dc => dc.id_categoria === producto.id_categoria)
  );

  const desc = descProducto || descCategoria;

  if (desc) {
    const valorDescuento = parseFloat(desc.valor);
    const tipo = (desc.tipo_descuento || '').toLowerCase();

    descuento_aplicado = {
      id_descuento: desc.id_descuento,
      tipo_descuento: desc.tipo_descuento,
      valor: valorDescuento,
      aplicacion: desc.aplicacion
    };

    if (tipo === 'porcentaje') {
      precio_final = Math.round(precioBase - (precioBase * valorDescuento / 100));
    } else if (tipo === 'valor' || tipo === 'fijo') {
      precio_final = Math.max(0, precioBase - valorDescuento);
    }

    if (precio_final === precioBase) {
      precio_final = parseFloat(precio_final.toFixed(2));
    }
  }

  return { ...producto.get({ plain: true }), descuento_aplicado, precio_final };
};

// Listar todos los productos con descuento aplicado si corresponde
exports.listarProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre_categoria'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['nombre_subcategoria'] }
      ]
    });

    // Traer descuentos activos
    const now = new Date();
    const descuentos = await Descuento.findAll({
      where: {
        estado_descuento: 'Activo',
        fecha_inicio: { [Op.lte]: now },
        fecha_fin: { [Op.gte]: now }
      },
      include: [
        { model: Producto, through: { attributes: [] } },
        { model: Categoria, through: { attributes: [] } }
      ]
    });

    const [descuentosProductos] = await sequelize.query(`
      SELECT d.*, dp.id_producto 
      FROM descuento d 
      JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento 
      WHERE d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin
    `);

    const [descuentosCategorias] = await sequelize.query(`
      SELECT d.*, dc.id_categoria 
      FROM descuento d 
      JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento 
      WHERE d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin
    `);

    // Mapas para acceso rápido
    const mapDescProd = {};
    descuentosProductos.forEach(d => mapDescProd[d.id_producto] = d);

    const mapDescCat = {};
    descuentosCategorias.forEach(d => mapDescCat[d.id_categoria] = d);

    const productosConDescuento = productos.map(prod => {
      let descuento_aplicado = null;
      let precioBase = parseFloat(prod.precio);
      let precio_final = precioBase;

      let desc = mapDescProd[prod.id_producto] || mapDescCat[prod.id_categoria];

      if (desc) {
        const valorDescuento = parseFloat(desc.valor);
        const tipo = (desc.tipo_descuento || '').toLowerCase();

        descuento_aplicado = {
          id_descuento: desc.id_descuento,
          tipo_descuento: desc.tipo_descuento,
          valor: valorDescuento,
          aplicacion: desc.aplicacion
        };

        if (tipo === 'porcentaje') {
          precio_final = Math.round(precioBase - (precioBase * valorDescuento / 100));
        } else if (tipo === 'valor' || tipo === 'fijo') {
          precio_final = Math.max(0, precioBase - valorDescuento);
        }

        if (precio_final === precioBase) {
          precio_final = parseFloat(precio_final.toFixed(2));
        }
      }

      const pPlain = prod.get({ plain: true });

      return {
        ...pPlain,
        nombre_categoria: pPlain.categoria?.nombre_categoria || 'Sin categoría',
        nombre_subcategoria: pPlain.subcategoria?.nombre_subcategoria || 'Sin subcategoría',
        descuento_aplicado,
        precio_final
      };
    });

    res.json(productosConDescuento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar productos' });
  }
};

// Listar imágenes en /public/img
exports.listarImagenes = async (req, res) => {
  try {
    const imgDir = path.join(__dirname, '../public/img');
    const files = await fs.promises.readdir(imgDir);
    const imagenes = files.filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
    res.json({ imagenes });
  } catch (error) {
    res.status(500).json({ error: 'Error al listar imágenes' });
  }
};

// Obtener un producto por ID
exports.obtenerProducto = async (req, res) => {
  try {
    const prod = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre_categoria'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['nombre_subcategoria'] }
      ]
    });
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    // Lógica de descuento... (omitiendo por brevedad en el chunk si es posible, pero debo ser cuidadoso)

    // Lógica de descuento (Reutilizamos la misma estrategia de queries crudas para IDs exactos por consistencia)
    const [descuentosProductos] = await sequelize.query(`
      SELECT d.*, dp.id_producto 
      FROM descuento d 
      JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento 
      WHERE d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin AND dp.id_producto = :id
    `, { replacements: { id: prod.id_producto } });

    const [descuentosCategorias] = await sequelize.query(`
      SELECT d.*, dc.id_categoria 
      FROM descuento d 
      JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento 
      WHERE d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin AND dc.id_categoria = :id
    `, { replacements: { id: prod.id_categoria } });

    let desc = descuentosProductos[0] || descuentosCategorias[0];
    let descuento_aplicado = null;
    let precioBase = parseFloat(prod.precio);
    let precio_final = precioBase;

    if (desc) {
      const valorDescuento = parseFloat(desc.valor);
      const tipo = (desc.tipo_descuento || '').toLowerCase();

      descuento_aplicado = {
        id_descuento: desc.id_descuento,
        tipo_descuento: desc.tipo_descuento,
        valor: valorDescuento,
        aplicacion: desc.aplicacion
      };

      if (tipo === 'porcentaje') {
        precio_final = Math.round(precioBase - (precioBase * valorDescuento / 100));
      } else if (tipo === 'valor' || tipo === 'fijo') {
        precio_final = Math.max(0, precioBase - valorDescuento);
      }

      if (precio_final === precioBase) {
        precio_final = parseFloat(precio_final.toFixed(2));
      }
    }

    const pPlain = prod.get({ plain: true });

    res.json({
      ...pPlain,
      nombre_categoria: pPlain.categoria?.nombre_categoria || 'Sin categoría',
      nombre_subcategoria: pPlain.subcategoria?.nombre_subcategoria || 'Sin subcategoría',
      descuento_aplicado,
      precio_final
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Agregar un nuevo producto
exports.agregarProducto = async (req, res) => {
  try {
    const {
      numero_serial,
      nombre,
      descripcion,
      precio,
      stock,
      id_categoria,
      id_subcategoria,
      fecha_creacion // Usually handled by default value, but accepting if sent
    } = req.body;

    const imagen = req.file?.filename || req.body.imagen;

    await Producto.create({
      numero_serial: numero_serial || null,
      nombre,
      descripcion,
      precio,
      stock,
      id_categoria,
      id_subcategoria: id_subcategoria || null,
      fecha_creacion: fecha_creacion || undefined,
      imagen
    });

    res.json({ message: 'Producto agregado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      numero_serial,
      nombre,
      descripcion,
      precio,
      stock,
      id_categoria,
      id_subcategoria,
      imagen // nombre de imagen (string)
    } = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const imagenActual = producto.imagen;
    let nuevaImagen = imagenActual;

    if (req.file) {
      nuevaImagen = req.file.filename;
      // Aquí podría ir lógica para borrar la imagen vieja del disco
    } else if (imagen && imagen !== imagenActual) {
      nuevaImagen = imagen.replace(/^\/img\/|^\/?\/?img\//, '');
    }

    await producto.update({
      numero_serial: numero_serial || null,
      nombre,
      descripcion,
      precio,
      stock,
      id_categoria,
      id_subcategoria: id_subcategoria || null,
      imagen: nuevaImagen
    });

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// Eliminar producto y su imagen si existe
exports.eliminarProducto = async (req, res) => {
  try {
    const id = req.params.id;
    const producto = await Producto.findByPk(id);

    if (producto && producto.imagen) {
      const filePath = path.join(__dirname, '../public/img', producto.imagen);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) { /* ignore */ }
      }
    }

    const result = await Producto.destroy({ where: { id_producto: id } });
    if (result === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
