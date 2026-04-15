import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/gestionusuarios.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API } from '../../config/api';
import "../../css/CSSA/admin-global.css";
import Loader from "../../components/Loader.jsx";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarUsuarios = () => {
    setLoading(true);
    API
      .get(`usuarios`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setUsuarios(res.data);
        } else {
          setUsuarios([]);
        }
        setLoading(false);
        setTimeout(() => {
          if (!$.fn.DataTable.isDataTable("#tablaUsuarios")) {
            $("#tablaUsuarios").DataTable({
              responsive: true,
              autoWidth: false,
              pageLength: 10,
              order: [[1, 'asc']],
              columnDefs: [
                { targets: 0, type: 'num' },
                { targets: [0, 3, 4], searchable: true },
                { targets: "_all", searchable: false },
              ],
              lengthMenu: [[4, 8, 10], [4, 8, 10]],
            });
          }
        }, 100);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const cambiarEstadoUsuario = async (id, nuevoEstado) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `${nuevoEstado === "Activo" ? "Activar" : "Inactivar"} usuario`,
      text: `¿Estás seguro de ${nuevoEstado === "Activo" ? "activar" : "inactivar"} este usuario?`,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await API.put(`usuarios/${id}/estado`, { estado: nuevoEstado });
      if (response.status === 200) {
        Swal.fire("Éxito", `El usuario ahora está ${nuevoEstado}.`, "success");
        if ($.fn.DataTable.isDataTable("#tablaUsuarios")) {
          $("#tablaUsuarios").DataTable().destroy();
        }
        cargarUsuarios();
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire("Error", "No se pudo cambiar el estado del usuario.", "error");
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>Gestión de Usuarios</h1>
          <button onClick={() => navigate('/agregar-usuarios')} className="btn-pro btn-pro-primary" >
            <FontAwesomeIcon icon={faPlus} /> Añadir Administrador
          </button>
        </div>

        {loading ? (
          <Loader text="Autenticando base de usuarios..." />
        ) : (
          <div className="premium-table-container animate-section">
            <table className="premium-table" id="tablaUsuarios">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td className="fw-700 text-muted" data-order={usuario.cedula}>
                      #{usuario.cedula}
                    </td>
                    <td className="fw-600">{usuario.nombre}</td>
                    <td className="text-muted small">@{usuario.nombre_usuario}</td>
                    <td className="small">{usuario.correo_electronico}</td>
                    <td>
                      <span className="small fw-600 text-uppercase" style={{ color: 'var(--primary)' }}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pro ${usuario.estado.toLowerCase() === 'activo' ? 'badge-active' : 'badge-inactive'}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-sm btn-outline-primary border-0" onClick={() => navigate(`/editar-usuario/${usuario.id_usuario}`)} title="Editar">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        {usuario.id_usuario === 1 || usuario.correo_electronico === "josecrack13113@gmail.com" ? (
                          <span className="small text-muted fst-italic">Master Admin</span>
                        ) : (
                          <button
                            onClick={() => cambiarEstadoUsuario(usuario.id_usuario, usuario.estado.toLowerCase() === "activo" ? "Inactivo" : "Activo")}
                            className={`btn btn-sm border-0 ${usuario.estado.toLowerCase() === "activo" ? "btn-outline-warning" : "btn-outline-success"}`}
                            title={usuario.estado.toLowerCase() === "activo" ? "Inactivar" : "Activar"}
                          >
                            <FontAwesomeIcon icon={usuario.estado.toLowerCase() === "activo" ? faEdit : faPlus} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
