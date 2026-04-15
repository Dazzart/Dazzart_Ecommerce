import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/gestionproductos.css";
import "../../css/CSSA/admin-global.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API } from '../../config/api';
import Loader from "../../components/Loader.jsx";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id_categoria: null, nombre: "", descripcion: "" });
  const navigate = useNavigate();

  const cargarCategorias = () => {
    setLoading(true);
    API
      .get(`categorias/listar`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCategorias(res.data);
        } else {
          setCategorias([]);
        }
        setLoading(false);
        setTimeout(() => {
          if (!$.fn.DataTable.isDataTable("#tablaCategorias")) {
            $("#tablaCategorias").DataTable({
              responsive: true,
              autoWidth: false,
              pageLength: 10,
              order: [[0, 'asc']],
              columnDefs: [
                { targets: 0, type: 'num' }
              ],
              lengthMenu: [[5, 10, 15], [5, 10, 15]],
              language: {
                lengthMenu: "Mostrar _MENU_ registros por página",
                zeroRecords: "No se encontraron resultados",
                info: "Mostrando página _PAGE_ de _PAGES_",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrado de _MAX_ registros en total)",
                search: "Buscar:",
                paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
              },
            });
          }
        }, 100);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.descripcion) return;

    try {
      await API.post(`categorias/agregar`, form);
      Swal.fire("Agregado", "Categoría agregada con éxito", "success");
      setForm({ nombre: "", descripcion: "" });
      if ($.fn.DataTable.isDataTable("#tablaCategorias")) {
        $("#tablaCategorias").DataTable().destroy();
      }
      cargarCategorias();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar la categoría", "error");
    }
  };

  const eliminarCategoria = async (id) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Eliminar categoría",
      text: "¿Estás seguro de eliminar esta categoría?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await API.delete(`categorias/eliminar/${id}`);
      if (response.status === 200) {
        Swal.fire("Categoría eliminada", "La categoría ha sido eliminada con éxito.", "success");
        if ($.fn.DataTable.isDataTable("#tablaCategorias")) {
          $("#tablaCategorias").DataTable().destroy();
        }
        cargarCategorias();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "No se pudo eliminar la categoría.", "error");
    }
  };

  const abrirEditarModal = (categoria) => {
    setEditForm({
      id_categoria: categoria.id_categoria,
      nombre: categoria.nombre_categoria,
      descripcion: categoria.descripcion_categoria,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const { id_categoria, nombre, descripcion } = editForm;

    try {
      await API.put(`categorias/editar/${id_categoria}`, { nombre, descripcion });
      Swal.fire("Guardado", "Categoría actualizada con éxito", "success");
      setShowEditModal(false);
      if ($.fn.DataTable.isDataTable("#tablaCategorias")) {
        $("#tablaCategorias").DataTable().destroy();
      }
      cargarCategorias();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
    }
  };


  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>Gestión de Categorías</h1>
        </div>

        {loading ? (
          <Loader text="Organizando catálogo de categorías..." />
        ) : (
          <div className="row g-4 animate-section">
            <div className="col-lg-4">
              <div className="admin-card shadow-sm border-0">
                <h2 className="section-title h5 mb-3 fw-bold">Agregar Categoría</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group-pro">
                    <label className="form-label-pro">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control-pro"
                      placeholder="Ej. Accesorios"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group-pro mt-3">
                    <label className="form-label-pro">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control-pro"
                      placeholder="Breve descripción..."
                      value={form.descripcion}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-pro btn-pro-primary w-100 justify-content-center mt-4 p-2 fw-600">
                    <FontAwesomeIcon icon={faPlus} /> Añadir Categoría
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="premium-table-container shadow-sm">
                <table className="premium-table" id="tablaCategorias">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((categoria) => (
                      <tr key={categoria.id_categoria}>
                        <td className="fw-700 text-muted" data-order={categoria.id_categoria}>
                          #{categoria.id_categoria}
                        </td>
                        <td className="fw-600">{categoria.nombre_categoria}</td>
                        <td className="text-muted small">{categoria.descripcion_categoria}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-sm btn-outline-primary border-0" onClick={() => abrirEditarModal(categoria)}>
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarCategoria(categoria.id_categoria)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {showEditModal && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content modal-content-pro">
              <form onSubmit={guardarEdicion}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Editar Categoría</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label-pro">Nombre</label>
                    <input type="text" name="nombre" className="form-control-pro" value={editForm.nombre} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-pro">Descripción</label>
                    <textarea name="descripcion" className="form-control-pro" value={editForm.descripcion} onChange={handleEditChange} rows={3} required />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 pt-0">
                  <button type="button" className="btn btn-pro btn-outline-secondary me-2" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-pro btn-pro-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
