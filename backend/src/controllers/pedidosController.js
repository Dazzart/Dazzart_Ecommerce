const { Pedido, Usuario, Producto, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// --- 1. LISTAR ---
exports.listarPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            where: { en_papelera: false },
            include: { model: Usuario, attributes: ['nombre'] },
            order: [['fecha_pedido', 'DESC']]
        });
        res.json(pedidos);
    } catch (error) {
        logger.error("Error al listar pedidos: %o", error);
        res.status(500).json({ error: "Error al listar", details: error.message });
    }
};

// --- 2. CREAR ---
exports.crearPedido = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_usuario, direccion, productos, total_productos, total } = req.body;
        for (const prod of productos) {
            const productoDB = await Producto.findByPk(prod.id_producto, { transaction });
            if (productoDB) await productoDB.decrement('stock', { by: prod.cantidad, transaction });
        }
        const nuevoPedido = await Pedido.create({
            id_usuario, direccion, productos, total_productos, total,
            estado: 'pendiente', en_papelera: false
        }, { transaction });
        await transaction.commit();
        res.status(201).json({ message: "Pedido creado", id_factura: nuevoPedido.id_factura });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: "Error al crear" });
    }
};

// --- 3. CAMBIAR ESTADO (Versión Corregida) ---
exports.cambiarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        // Atrapamos el valor use el nombre que use el front
        const nuevoEstado = req.body.estado || req.body.nuevo_estado || req.body.nuevoEstado;

        console.log(`Intentando actualizar pedido ID: ${id} a estado: ${nuevoEstado}`);

        // Verificamos que el ID y el estado existan
        if (!id || !nuevoEstado) {
            return res.status(400).json({ error: "Falta ID o Estado", recibido: req.body });
        }

        // Usamos el nombre exacto de tu llave primaria: id_factura
        const [filasActualizadas] = await Pedido.update(
            { estado: nuevoEstado },
            { where: { id_factura: id } }
        );

        if (filasActualizadas === 0) {
            return res.status(404).json({ error: "No se realizó ningún cambio en la base de datos" });
        }

        res.json({ message: "Estado actualizado con éxito", estado: nuevoEstado });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.restaurarPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);
        await pedido.update({ en_papelera: false });
        res.json({ message: "Pedido restaurado" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
};

exports.vaciarPapelera = async (req, res) => {
    try {
        await Pedido.destroy({ where: { en_papelera: true } });
        res.json({ message: "Papelera vaciada" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
};

// --- 5. OTRAS RUTAS NECESARIAS ---
exports.obtenerPedidoPorId = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id, { include: Usuario });
        res.json(pedido);
    } catch (error) {
        logger.error("Error al obtener pedido por ID: %o", error);
        res.status(500).json({ error: "Error al obtener pedido", details: error.message });
    }
};

exports.obtenerPedidosPorUsuario = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({ where: { id_usuario: req.params.id_usuario } });
        res.json(pedidos);
    } catch (error) {
        logger.error("Error al obtener pedidos por usuario: %o", error);
        res.status(500).json({ error: "Error al obtener pedidos por usuario", details: error.message });
    }
};

exports.listarPapelera = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({ where: { en_papelera: true } });
        res.json(pedidos);
    } catch (error) {
        logger.error("Error al listar papelera: %o", error);
        res.status(500).json({ error: "Error al listar papelera", details: error.message });
    }
};

exports.moverAPapelera = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);
        await pedido.update({ en_papelera: true });
        res.json({ message: "A la papelera" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
};

exports.eliminarDefinitivamente = async (req, res) => {
    try {
        await Pedido.destroy({ where: { id_factura: req.params.id } });
        res.json({ message: "Eliminado" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
};

// --- FUNCIÓN FALTANTE QUE PIDE EL ROUTER ---
exports.cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const [actualizado] = await Pedido.update(
            { estado: 'cancelado' },
            { where: { id_factura: id } }
        );
        if (actualizado === 0) return res.status(404).json({ error: "No se encontró el pedido" });
        res.json({ message: "Pedido cancelado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al cancelar pedido" });
    }
};