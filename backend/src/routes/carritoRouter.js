const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const auth = require('../middlewares/auth');

router.get('/:id_usuario', auth, carritoController.obtenerCarrito);
router.post('/', auth, carritoController.agregarAlCarrito);
router.delete('/:id_carrito', auth, carritoController.eliminarDelCarrito);
router.delete('/vaciar/:id_usuario', auth, carritoController.vaciarCarrito);

module.exports = router;