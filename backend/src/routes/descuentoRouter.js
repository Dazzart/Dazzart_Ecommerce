const express = require('express');
const router = express.Router();
const descuentoController = require('../controllers/descuentocontroller');
const auth = require('../middlewares/auth');

router.post('/', auth, descuentoController.crearDescuento);
router.get('/', auth, descuentoController.listarDescuentos);
router.get('/:id', auth, descuentoController.obtenerDescuentoPorId);
router.put('/:id', auth, descuentoController.actualizarDescuento);
router.delete('/:id', auth, descuentoController.eliminarDescuento);

module.exports = router;