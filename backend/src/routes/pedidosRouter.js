const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController'); // Importación masiva
const auth = require('../middlewares/auth');

// Cambia las rutas para que usen pedidosController.nombre
router.get('/', auth, pedidosController.listarPedidos);
router.get('/papelera', auth, pedidosController.listarPapelera);
router.get('/usuario/:id_usuario', auth, pedidosController.obtenerPedidosPorUsuario);
router.get('/:id', auth, pedidosController.obtenerPedidoPorId);

router.post('/', auth, pedidosController.crearPedido);
router.put('/actualizar-estado/:id', auth, pedidosController.cambiarEstadoPedido);
router.put('/cancelar/:id', auth, pedidosController.cancelarPedido); // <--- Línea 28 arreglada
router.put('/restaurar/:id', auth, pedidosController.restaurarPedido);

router.delete('/vaciar-papelera', auth, pedidosController.vaciarPapelera);
router.delete('/definitivo/:id', auth, pedidosController.eliminarDefinitivamente);
router.delete('/:id', auth, pedidosController.moverAPapelera);

module.exports = router;