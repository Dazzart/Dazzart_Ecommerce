import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/CSSA/añadirusuario.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { API } from '../../config/api';

export default function AgregarUsuario() {
  const navigate = useNavigate();
  const { id } = useParams(); // Se usa para editar (si la ruta incluye un id)

  const [formData, setFormData] = useState({
    id_usuario: null,
    cedula: '',
    nombre: '',
    nombre_usuario: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    id_rol: 1 // 1 = admin
  });

  const [verPassword, setVerPassword] = useState(false);

  // Verificación de sesión
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  // Si hay un ID en la URL, se cargan los datos del usuario para editar
  useEffect(() => {
    if (id) {
      API.get(`usuarios/${id}`)
        .then(res => {
          setFormData({
            ...res.data,
            id_usuario: res.data.id_usuario,
            contrasena: '' // no se muestra la contraseña
          });
        })
        .catch(err => console.error('Error al cargar usuario:', err));
    }
  }, [id]);

  // Manejo de inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Validación de nombre (solo letras y espacios)
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
      Swal.fire('Error', 'El nombre solo puede contener letras y espacios.', 'warning');
      return;
    }

    // 🔹 Validación de teléfono (exactamente 10 dígitos)
    if (!/^\d{10}$/.test(formData.telefono)) {
      Swal.fire('Error', 'El número de celular debe tener exactamente 10 dígitos numéricos.', 'warning');
      return;
    }

    // 🔹 Validación de cédula (8 a 10 dígitos)
    if (!/^\d{8,10}$/.test(formData.cedula)) {
      Swal.fire('Error', 'La cédula debe tener entre 8 y 10 dígitos numéricos.', 'warning');
      return;
    }

    try {
      let res;

      if (id) {
        // 🔸 Actualizar usuario existente
        res = await API.put(`usuarios/${id}`, formData);
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
      } else {
        // 🔸 Crear nuevo usuario
        res = await API.post(`usuarios`, formData);
        if (res.status === 201) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario administrador creado con éxito',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            navigate('/admin-usuarios');
          });
        }
      }

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.error || 'No se pudo completar la operación', 'error');
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>{id ? 'Editar Administrador' : 'Añadir Administrador'}</h1>
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
              {/* Cédula y Nombre */}
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Número de Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="form-control-pro"
                  required
                  pattern="\d{8,10}"
                  maxLength={10}
                />
              </div>
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

              {/* Usuario y Correo */}
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

              {/* Teléfono y Dirección */}
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

              {/* Contraseña */}
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Contraseña {id && '(Opcional)'}</label>
                <div className="position-relative">
                  <input
                    type={verPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    className="form-control-pro"
                    required={!id}
                  />
                  <div
                    onClick={() => setVerPassword(!verPassword)}
                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#6c757d' }}
                  >
                    <FontAwesomeIcon icon={verPassword ? faEyeSlash : faEye} />
                  </div>
                </div>
              </div>

              {/* Rol (Solo lectura para Admin) */}
              <div className="col-md-6 form-group-pro">
                <label className="form-label-pro">Rol de Usuario</label>
                <input
                  type="text"
                  className="form-control-pro"
                  value="Administrador"
                  readOnly
                  style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-end">
              <button type="submit" className="btn-pro btn-pro-primary" style={{ padding: '12px 32px' }}>
                <FontAwesomeIcon icon={id ? faEdit : faPlus} /> {id ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
