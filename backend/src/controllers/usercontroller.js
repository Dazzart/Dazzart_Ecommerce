const bcrypt = require('bcrypt');
const { Usuario, Rol } = require('../models');
const { Op } = require('sequelize');

// --- REGISTRAR USUARIO (Público) ---
exports.registerUser = async (req, res) => {
    // Normalizamos la entrada para aceptar ambos nombres de campo
    const correo_electronico = req.body.correo_electronico || req.body.correo;
    const { nombre, nombre_usuario, telefono, contrasena, cedula, direccion } = req.body;

    try {
        if (!correo_electronico || !nombre_usuario || !contrasena || !nombre) {
            return res.status(400).json({ error: 'Nombre, usuario, correo y contraseña son obligatorios' });
        }

        // 1. Verificar Nombre de Usuario y Correo
        const usuariosExistentes = await Usuario.findAll({
            where: {
                [Op.or]: [
                    { nombre_usuario: nombre_usuario },
                    { correo_electronico: correo_electronico }
                ]
            }
        });

        if (usuariosExistentes.length > 0) {
            const existeUsuario = usuariosExistentes.some(u => u.nombre_usuario === nombre_usuario);
            const mensajeError = existeUsuario ? 'El nombre de usuario ya existe' : 'El correo ya está registrado';
            return res.status(400).json({ error: mensajeError });
        }

        // 2. Verificar Cédula (si se proporciona)
        if (cedula) {
            const cedulaExistente = await Usuario.findOne({ where: { cedula } });
            if (cedulaExistente) {
                return res.status(400).json({ error: 'La cédula ya está registrada en el sistema' });
            }
        }

        // 3. Verificar Rol
        let rolCliente = await Rol.findOne({ where: { nombre_rol: 'cliente' } });
        // Si no existe por nombre, intentamos el ID 2 por defecto
        if (!rolCliente) {
            rolCliente = await Rol.findByPk(2);
        }

        if (!rolCliente) {
            console.error('CRÍTICO: No se encontró el rol de cliente en la base de datos.');
            return res.status(500).json({ error: 'Error del sistema: No se pueden registrar clientes en este momento (Falta rol).' });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        await Usuario.create({
            nombre, nombre_usuario, correo_electronico, telefono,
            contrasena: hashedPassword, cedula, direccion,
            id_rol: rolCliente.id_rol
        });

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error en registro:', error);
        // Devolvemos el mensaje exacto del error para depuración
        res.status(500).json({ error: 'Error interno al registrar: ' + error.message });
    }
};

// --- LISTAR USUARIOS ---
exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: { model: Rol, attributes: ['nombre_rol'] }
        });
        const rows = usuarios.map(u => {
            const plain = u.get({ plain: true });
            return { ...plain, rol: plain.Rol ? plain.Rol.nombre_rol : null };
        });
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// --- AGREGAR USUARIO (Admin CRUD) ---
exports.agregarUsuario = async (req, res) => {
    const correo_electronico = req.body.correo_electronico || req.body.correo;
    const { cedula, nombre, nombre_usuario, telefono, direccion, contrasena, id_rol } = req.body;

    try {
        if (!correo_electronico) return res.status(400).json({ error: 'Correo requerido' });

        const existe = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { nombre_usuario: nombre_usuario },
                    { correo_electronico: correo_electronico }
                ]
            }
        });

        if (existe) return res.status(400).json({ error: 'El usuario o correo ya existen' });

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        await Usuario.create({
            cedula, nombre, nombre_usuario, correo_electronico,
            telefono, direccion, contrasena: hashedPassword, id_rol
        });

        res.status(201).json({ message: 'Usuario creado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- ACTUALIZAR USUARIO (EL QUE DABA ERROR 500) ---
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;

    // BLINDAJE: Si correo_electronico viene undefined, usamos req.body.correo o un string vacío para no romper Sequelize
    const correo_electronico = req.body.correo_electronico || req.body.correo || "";
    const nombre_usuario = req.body.nombre_usuario || "";
    const { nombre, telefono, direccion, contrasena } = req.body;

    try {
        // Validar que no lleguen vacíos para la consulta WHERE
        if (!nombre_usuario || !correo_electronico) {
            return res.status(400).json({ error: "Datos insuficientes para actualizar." });
        }

        // 🔎 Validar nombre de usuario duplicado
        const usuarioNombre = await Usuario.findOne({
            where: {
                nombre_usuario: nombre_usuario,
                id_usuario: { [Op.ne]: id }
            }
        });
        if (usuarioNombre) return res.status(400).json({ error: "El nombre de usuario ya está en uso." });

        // 🔎 Validar correo duplicado
        const usuarioCorreo = await Usuario.findOne({
            where: {
                correo_electronico: correo_electronico,
                id_usuario: { [Op.ne]: id }
            }
        });
        if (usuarioCorreo) return res.status(400).json({ error: "El correo ya está registrado." });

        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        const updateData = {
            nombre,
            nombre_usuario,
            correo_electronico,
            telefono,
            direccion
        };

        if (contrasena && contrasena.trim() !== "") {
            updateData.contrasena = await bcrypt.hash(contrasena, 10);
        }

        await usuario.update(updateData);
        res.json({ message: "Usuario actualizado correctamente." });

    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: "Error interno en el servidor." });
    }
};

// --- CAMBIAR ESTADO ---
exports.cambiarEstadoUsuario = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ error: "No existe" });

        if ((usuario.id_usuario === 1 || usuario.correo_electronico === "josecrack13113@gmail.com") && estado === "inactivo") {
            return res.status(403).json({ error: "No puedes desactivar al admin" });
        }

        await usuario.update({ estado });
        res.json({ message: `Usuario ${estado}` });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

// --- OBTENER POR ID ---
exports.obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({
            where: { id_usuario: req.params.id },
            include: { model: Rol, attributes: ['nombre_rol'] }
        });
        if (!usuario) return res.status(404).json({ error: 'No encontrado' });
        res.json({ ...usuario.get({ plain: true }), rol: usuario.Rol?.nombre_rol });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
};