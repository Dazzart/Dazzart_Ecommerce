const { Carrito, Producto, Descuento, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.obtenerCarrito = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Obtener items del carrito con producto
    const items = await Carrito.findAll({
      where: { id_usuario },
      include: [{
        model: Producto,
        // No necesitamos atributos anidados complejos aquí per se, pero
        // para calcular descuentos necesitamos la info del producto.
      }]
    });

    if (items.length === 0) {
      return res.json([]);
    }

    // Traer descuentos activos
    const now = new Date();
    // Optimization: fetch only relevant discounts? Or just all active ones. All active is easier.
    const descuentos = await Descuento.findAll({
      where: {
        estado_descuento: 'Activo',
        fecha_inicio: { [Op.lte]: now },
        fecha_fin: { [Op.gte]: now }
      }
    });

    // Replicar lógica de búsqueda de IDs de descuentos con consultas raw para las tablas de unión
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

    const mapDescProd = {};
    descuentosProductos.forEach(d => mapDescProd[d.id_producto] = d);

    const mapDescCat = {};
    descuentosCategorias.forEach(d => mapDescCat[d.id_categoria] = d);

    // Procesar cada item
    const resultado = items.map(item => {
      const prod = item.Producto;
      if (!prod) return null; // Should not happen with inner join logic implicitly but findAll uses left join by default

      const plainProd = prod.get({ plain: true });

      // Calcular descuentos
      let descuento_aplicado = null;
      let precioBase = parseFloat(plainProd.precio);
      let precio_final = precioBase;

      let desc = mapDescProd[plainProd.id_producto] || mapDescCat[plainProd.id_categoria];

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

      return {
        id_carrito: item.id_carrito,
        id_usuario: item.id_usuario,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        nombre: plainProd.nombre,
        precio: plainProd.precio,
        imagen: plainProd.imagen,
        stock: plainProd.stock,
        descuento_aplicado,
        precio_final
      };
    }).filter(i => i !== null);


    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

exports.agregarAlCarrito = async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  try {
    // Verificar si ya existe
    const itemExistente = await Carrito.findOne({
      where: { id_usuario, id_producto }
    });

    if (itemExistente) {
      await itemExistente.increment('cantidad', { by: cantidad });
      res.json({ message: 'Cantidad actualizada en el carrito' });
    } else {
      await Carrito.create({
        id_usuario,
        id_producto,
        cantidad
      });
      res.json({ message: 'Producto agregado al carrito' });
    }
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

exports.eliminarDelCarrito = async (req, res) => {
  const { id_carrito } = req.params;

  try {
    await Carrito.destroy({ where: { id_carrito } });
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
};

exports.vaciarCarrito = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    await Carrito.destroy({ where: { id_usuario } });
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

