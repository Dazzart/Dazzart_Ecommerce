const { Subcategoria, Categoria } = require('../models');

exports.listarSubcategorias = async (req, res) => {
  try {
    const results = await Subcategoria.findAll({
      include: [{
        model: Categoria,
        attributes: ['nombre_categoria']
      }],
      order: [['id_subcategoria', 'DESC']]
    });

    // Flatten result for compatibility if needed, though usually standard JSON is fine.
    // However, existing code might expect "nombre_categoria" at root object level?
    // SQL join returned "nombre_categoria". Sequelize returns it inside "Categoria" object.
    // Let's map it to match previous behavior exactly.
    const mappedResults = results.map(sub => {
      const plain = sub.get({ plain: true });
      return {
        ...plain,
        nombre_categoria: plain.Categoria ? plain.Categoria.nombre_categoria : null
      };
    });

    res.json(mappedResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
};

exports.listarSubcategoriasPorCategoria = async (req, res) => {
  const id_categoria = req.params.id_categoria;
  try {
    const results = await Subcategoria.findAll({
      where: { id_categoria: id_categoria }
    });
    res.json(results);
  } catch (err) {
    console.error('Error al listar subcategorias por categoria:', err);
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
};

exports.agregarSubcategoria = async (req, res) => {
  const { nombre_subcategoria, descripcion_subcategoria, id_categoria } = req.body;

  if (!id_categoria || !descripcion_subcategoria) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const result = await Subcategoria.create({
      nombre_subcategoria,
      descripcion_subcategoria,
      id_categoria
    });
    res.status(201).json({ message: 'Subcategoría agregada', id: result.id_subcategoria });
  } catch (err) {
    console.error('Error al agregar subcategoria:', err);
    res.status(500).json({ error: 'Error al agregar subcategoría' });
  }
};

exports.editarSubcategoria = async (req, res) => {
  const id_subcategoria = req.params.id_subcategoria;
  const { nombre_subcategoria, descripcion_subcategoria, id_categoria } = req.body;

  if (!id_categoria || !descripcion_subcategoria) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const subcategoria = await Subcategoria.findByPk(id_subcategoria);
    if (!subcategoria) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    await subcategoria.update({
      nombre_subcategoria,
      descripcion_subcategoria,
      id_categoria
    });

    res.json({ message: 'Subcategoría actualizada' });
  } catch (err) {
    console.error('Error al actualizar subcategoria:', err);
    res.status(500).json({ error: 'Error al actualizar subcategoría' });
  }
};

exports.eliminarSubcategoria = async (req, res) => {
  const id_subcategoria = req.params.id_subcategoria;
  try {
    const resultado = await Subcategoria.destroy({
      where: { id_subcategoria }
    });

    if (resultado === 0) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    res.json({ message: 'Subcategoría eliminada' });
  } catch (err) {
    console.error('Error al eliminar subcategoria:', err);
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
};
