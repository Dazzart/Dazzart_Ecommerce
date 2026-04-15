const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const auth = require('../middlewares/auth');

router.post('/register', userController.registerUser);
router.get('/', auth, userController.listarUsuarios);
router.post('/', auth, userController.agregarUsuario);
router.put('/:id', auth, userController.actualizarUsuario);
router.put('/:id/estado', auth, userController.cambiarEstadoUsuario);
router.get('/usuario/:id', auth, userController.obtenerUsuarioPorId);


module.exports = router;