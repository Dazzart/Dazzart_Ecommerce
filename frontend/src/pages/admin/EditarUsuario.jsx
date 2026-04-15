import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/CSSA/actualizarusuario.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';

import SidebarAdmin from '../../components/SideBarAdmin.jsx';
import { API } from '../../config/api';

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    nombre_usuario: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    rol: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await API.get(`usuarios/usuario/${id}`);
        setFormData({
          nombre: res.data.nombre,
          nombre_usuario: res.data.nombre_usuario,
          correo: res.data.correo_electronico,
          telefono: res.data.telefono,
          direccion: res.data.direccion,
          contrasena: '',
          rol: res.data.rol,
        });
      } catch (err) {
        console.error('Error al obtener usuario:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del usuario.',
        });
      }
    };

    cargarUsuario();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
      Swal.fire('Error', 'El nombre solo puede contener letras y espacios.', 'warning');
      return;
    }

    if (!/^\d{10}$/.test(formData.telefono)) {
      Swal.fire('Error', 'El número de celular debe tener exactamente 10 dígitos numéricos.', 'warning');
      return;
    }

    try {
      const res = await API.put(`usuarios/${id}`, formData);
      if (res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado con éxito',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/admin-usuarios');
        });
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el usuario.',
      });
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>Actualizar Usuario</h1>
          <button
            onClick={() => navigate('/admin-usuarios')}
            className="btn-pro btn-pro-outline-secondary"
            style={{ border: '1.5px solid #bdc3c7', background: 'transparent' }}
          >
            Regresar
          </button>
        </div>

        <div className="admin-card">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Nombre y Usuario */}
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="form-control-pro"
                  required
                />
              </div>
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Nombre de Usuario</label>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  className="form-control-pro"
                  required
                />
              </div>

              {/* Correo y Teléfono */}
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="form-control-pro"
                  required
                />
              </div>
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Teléfono Celular</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="form-control-pro"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>

              {/* Dirección y Contraseña */}
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Dirección de Residencia</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="form-control-pro"
                  required
                />
              </div>
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Nueva Contraseña (Opcional)</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    className="form-control-pro"
                    placeholder="Déjalo vacío para no cambiarla"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#6c757d' }}
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </div>
                </div>
              </div>

              {/* Rol */}
              <div className="col-md-12 form-group-pro">
                <label className="form-label-pro">Rol asignado</label>
                <input
                  type="text"
                  className="form-control-pro"
                  value={formData.rol || 'admin'}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-end">
              <button type="submit" className="btn-pro btn-pro-primary" style={{ padding: '12px 32px' }}>
                <FontAwesomeIcon icon={faEdit} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
