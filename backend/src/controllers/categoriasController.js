const { Categoria } = require('../models');

// Listar categorías
exports.listarCategorias = async (req, res) => {
  console.log("Petición GET /categorias/listar recibida");

  try {
    const results = await Categoria.findAll();
    console.log("Categorías obtenidas:", results);
    res.json(results);
  } catch (err) {
    console.error("Error en consulta categorías:", err);
    res.status(500).json({ error: err.message || err });
  }
};

// Agregar nueva categoría
exports.agregarCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    await Categoria.create({
      nombre_categoria: nombre,
      descripcion_categoria: descripcion
    });
    res.json({ message: 'Categoría agregada correctamente' });
  } catch (err) {
    console.error('Error al agregar categoría:', err);
    res.status(500).json({ error: 'No se pudo agregar la categoría' });
  }
};

// Editar categoría
exports.editarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await categoria.update({
      nombre_categoria: nombre,
      descripcion_categoria: descripcion
    });

    res.json({ message: 'Categoría actualizada correctamente' });
  } catch (err) {
    console.error('Error al editar categoría:', err);
    res.status(500).json({ error: 'No se pudo editar la categoría' });
  }
};

// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await Categoria.destroy({
      where: { id_categoria: id }
    });

    if (resultado === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ error: 'No se pudo eliminar la categoría' });
  }
};
