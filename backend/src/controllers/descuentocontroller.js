const { Descuento, DescuentoCategoria, DescuentoProducto, sequelize } = require('../models');
const { Op } = require('sequelize');

// Crear descuento
exports.crearDescuento = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Extraer datos del body
    const {
      estado_descuento,
      fecha_inicio,
      fecha_fin,
      tipo_descuento,
      valor,
      aplicacion,
      seleccion
    } = req.body;

    // Validar campos básicos
    if (!tipo_descuento || !valor || !fecha_inicio || !fecha_fin || !estado_descuento || !aplicacion) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Faltan campos obligatorios en el formulario.' });
    }

    // 1. Insertar el descuento en la tabla `descuento`
    const nuevoDescuento = await Descuento.create({
      estado_descuento,
      fecha_inicio,
      fecha_fin,
      tipo_descuento,
      valor,
      aplicacion
    }, { transaction });

    const idDescuento = nuevoDescuento.id_descuento;

    // 2. Insertar relaciones en `descuento_producto` o `descuento_categoria`
    if (aplicacion === 'producto' && Array.isArray(seleccion) && seleccion.length > 0) {
      const registros = seleccion.map(id => ({
        id_descuento: idDescuento,
        id_producto: id
      }));
      await DescuentoProducto.bulkCreate(registros, { transaction });
    } else if (aplicacion === 'categoria' && Array.isArray(seleccion) && seleccion.length > 0) {
      const registros = seleccion.map(id => ({
        id_descuento: idDescuento,
        id_categoria: id
      }));
      await DescuentoCategoria.bulkCreate(registros, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Descuento creado con éxito', id: idDescuento });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error creando descuento:', error);
    res.status(500).json({ error: 'Error al crear el descuento' });
  }
};

// Listar descuentos (incluyendo ids de productos o categorías)
exports.listarDescuentos = async (req, res) => {
  try {
    const { Producto, Categoria } = require('../models');
    const descuentos = await Descuento.findAll({
      include: [
        { model: Producto, attributes: ['id_producto', 'nombre'], through: { attributes: [] } },
        { model: Categoria, attributes: ['id_categoria', 'nombre_categoria'], through: { attributes: [] } }
      ]
    });

    const resultados = descuentos.map(d => {
      const plain = d.get({ plain: true });
      let nombre_producto = null;
      let nombre_categoria = null;
      let seleccion = [];

      if (plain.aplicacion === 'producto' && plain.Productos) {
        seleccion = plain.Productos.map(p => p.id_producto);
        if (plain.Productos.length > 0) {
          nombre_producto = plain.Productos.length > 1
            ? `${plain.Productos[0].nombre} (+${plain.Productos.length - 1})`
            : plain.Productos[0].nombre;
        }
      } else if (plain.aplicacion === 'categoria' && plain.Categoria) {
        seleccion = plain.Categoria.map(c => c.id_categoria);
        if (plain.Categoria.length > 0) {
          nombre_categoria = plain.Categoria.length > 1
            ? `${plain.Categoria[0].nombre_categoria} (+${plain.Categoria.length - 1})`
            : plain.Categoria[0].nombre_categoria;
        }
      }

      return { ...plain, seleccion, nombre_producto, nombre_categoria };
    });

    res.json(resultados);
  } catch (error) {
    console.error('Error listando descuentos:', error);
    res.status(500).json({ error: 'Error al listar descuentos' });
  }
};

// Eliminar descuento
exports.eliminarDescuento = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    await DescuentoProducto.destroy({ where: { id_descuento: id }, transaction });
    await DescuentoCategoria.destroy({ where: { id_descuento: id }, transaction });

    await Descuento.destroy({ where: { id_descuento: id }, transaction });

    await transaction.commit();
    res.json({ message: 'Descuento eliminado' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error eliminando descuento:', error);
    res.status(500).json({ error: 'Error al eliminar descuento' });
  }
};

exports.obtenerDescuentoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const descuento = await Descuento.findByPk(id);
    if (!descuento) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }
    res.json(descuento);
  } catch (error) {
    console.error('Error al obtener descuento:', error);
    res.status(500).json({ error: 'Error al obtener el descuento' });
  }
};

exports.actualizarDescuento = async (req, res) => {
  const { id } = req.params;
  const { tipo_descuento, valor, fecha_inicio, fecha_fin, estado_descuento } = req.body;
  try {
    const descuento = await Descuento.findByPk(id);
    if (!descuento) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    await descuento.update({
      tipo_descuento, valor, fecha_inicio, fecha_fin, estado_descuento
    });

    res.json({ message: 'Descuento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar descuento:', error);
    res.status(500).json({ error: 'Error al actualizar el descuento' });
  }
};
