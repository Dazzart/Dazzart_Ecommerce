import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faPhone, faIdCard,
  faMapMarkerAlt, faUserTag, faLock
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import Header from '../../components/cliente/Header';
import Footer from '../../components/cliente/Footer';
import MenuLateral from '../../components/cliente/MenuLateral';
import ModalConfirmacion from '../../components/cliente/ModalConfirmacion';
import fondoGif from '../../assets/giphy.gif';
import { API } from '../../config/api';

export default function MisDatos() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    nombre_usuario: '',
    correo_electronico: '',
    telefono: '',
    cedula: '',
    direccion: '',
    contrasena: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 1. Cargar datos de sesión
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      navigate('/');
      return;
    }
    try {
      const parsedUsuario = JSON.parse(usuarioGuardado);
      if (Number(parsedUsuario.id_rol) !== 2) {
        navigate('/');
        return;
      }
      setUsuario(parsedUsuario);
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  // 2. Llenar el formulario
  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        nombre_usuario: usuario.nombre_usuario || '',
        correo_electronico: usuario.correo_electronico || '',
        telefono: usuario.telefono || '',
        cedula: usuario.cedula || '',
        direccion: usuario.direccion || '',
        contrasena: '',
      });
    }
  }, [usuario]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Guardar cambios
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const token = localStorage.getItem('token');

    // CONSTRUCCIÓN EXPLÍCITA
    const datosEnviar = {
      nombre: form.nombre,
      nombre_usuario: form.nombre_usuario,
      correo_electronico: form.correo_electronico, // Asegúrate que este nombre sea exacto al del useState
      telefono: form.telefono,
      cedula: form.cedula,
      direccion: form.direccion,
    };

    if (form.contrasena && form.contrasena.trim() !== "") {
      datosEnviar.contrasena = form.contrasena.trim();
    }

    // LOG DE CONTROL: Mira esto en la consola de Chrome (F12) antes de que falle
    console.log("JSON que se enviará:", JSON.stringify(datosEnviar));

    try {
      const res = await API.put(`usuarios/${usuario.id_usuario}`, datosEnviar);
      const data = res.data;

      if (res.status === 200 || res.status === 201) {
        setMensaje('Datos actualizados correctamente');
        // Actualizamos el estado global del usuario con los nuevos datos
        const nuevoUsuario = {
          ...usuario,
          ...datosEnviar
        };
        localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
        setUsuario(nuevoUsuario);
        setForm(f => ({ ...f, contrasena: '' }));
        setShowModal(true);
      } else {
        // Si el backend responde error (como el 500 que veíamos), lo mostramos
        setMensaje(data.error || data.message || 'Error al actualizar los datos');
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      setMensaje('Error de red o servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Header
        onOpenMenu={() => setShowMenu(true)}
        onOpenCarrito={() => navigate('/carrito')}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        usuario={usuario}
        onLogout={() => {
          localStorage.clear();
          navigate('/');
          window.location.reload();
        }}
      />

      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <div style={{
        minHeight: '100vh',
        backgroundImage: `url(${fondoGif})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px 15px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '550px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 className="text-center fw-bold mb-4" style={{ color: '#222' }}>
            <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
            Mis Datos
          </h2>

          <form onSubmit={handleSubmit}>
            {[
              { name: 'nombre', icon: faUser, type: 'text', label: 'Nombre Completo' },
              { name: 'nombre_usuario', icon: faUserTag, type: 'text', label: 'Nombre de Usuario' },
              { name: 'correo_electronico', icon: faEnvelope, type: 'email', label: 'Correo Electrónico' },
              { name: 'telefono', icon: faPhone, type: 'text', label: 'Teléfono' },
              { name: 'cedula', icon: faIdCard, type: 'text', label: 'Cédula' }
            ].map(({ name, icon, type, label }) => (
              <div className="mb-3" key={name} style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={icon} style={{
                  position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#888'
                }} />
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={label}
                  className="form-control"
                  style={{ paddingLeft: 40, borderRadius: 10, height: '45px' }}
                  required
                />
              </div>
            ))}

            <div className="mb-3" style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ position: 'absolute', left: 15, top: 15, color: '#888' }} />
              <textarea
                name="direccion"
                rows="2"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección de Envío"
                className="form-control"
                style={{ paddingLeft: 40, borderRadius: 10 }}
                required
              />
            </div>

            <div className="mb-4" style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faLock} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="contrasena"
                value={form.contrasena}
                onChange={handleChange}
                placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                className="form-control"
                style={{ paddingLeft: 40, paddingRight: 45, borderRadius: 10, height: '45px' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#aaa' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 fw-bold py-2 shadow-sm"
              style={{ borderRadius: 10, fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>

            {mensaje && !showModal && (
              <div className="alert alert-warning text-center mt-3 py-2">
                {mensaje}
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />

      <ModalConfirmacion
        show={showModal}
        mensaje={mensaje}
        onClose={() => setShowModal(false)}
        onIrCarrito={() => {
          setShowModal(false);
          navigate('/');
        }}
        textoBoton="Volver al Inicio"
        textoCerrar="Cerrar"
        titulo="¡Perfil Actualizado!"
        icono={<FontAwesomeIcon icon={faUser} style={{ color: '#28a745', fontSize: '2rem' }} />}
      />
    </>
  );
}