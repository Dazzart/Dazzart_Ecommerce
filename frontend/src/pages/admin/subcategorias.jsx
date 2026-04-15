import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import Swal from "sweetalert2";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate } from "react-router-dom";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API } from '../../config/api';
import "../../css/CSSA/admin-global.css";
import Loader from "../../components/Loader.jsx";

export default function SubcategoriasAdmin() {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre_subcategoria: "",
    descripcion_subcategoria: "",
    id_categoria: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id_subcategoria: null,
    nombre_subcategoria: "",
    descripcion_subcategoria: "",
    id_categoria: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        API.get(`categorias/listar`),
        API.get(`subcategorias/listar`)
      ]);

      if (Array.isArray(catRes.data)) setCategorias(catRes.data);
      if (Array.isArray(subRes.data)) setSubcategorias(subRes.data);

      setLoading(false);
      setTimeout(() => {
        if (!$.fn.DataTable.isDataTable("#tablaSubcategorias")) {
          $("#tablaSubcategorias").DataTable({
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
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_categoria || !form.descripcion_subcategoria) return;
    try {
      await API.post(`subcategorias/agregar`, form);
      Swal.fire("Agregado", "Subcategoría agregada con éxito", "success");
      setForm({ nombre_subcategoria: "", descripcion_subcategoria: "", id_categoria: "" });
      if ($.fn.DataTable.isDataTable("#tablaSubcategorias")) {
        $("#tablaSubcategorias").DataTable().destroy();
      }
      cargarDatos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar la subcategoría", "error");
    }
  };

  const eliminarSubcategoria = async (id) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Eliminar subcategoría",
      text: "¿Estás seguro de eliminar esta subcategoría?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`subcategorias/eliminar/${id}`);
      Swal.fire("Eliminado", "Subcategoría eliminada con éxito", "success");
      if ($.fn.DataTable.isDataTable("#tablaSubcategorias")) {
        $("#tablaSubcategorias").DataTable().destroy();
      }
      cargarDatos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la subcategoría", "error");
    }
  };

  const abrirEditarModal = (subcat) => {
    setEditForm({
      id_subcategoria: subcat.id_subcategoria,
      nombre_subcategoria: subcat.nombre_subcategoria,
      descripcion_subcategoria: subcat.descripcion_subcategoria,
      id_categoria: subcat.id_categoria,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const { id_subcategoria, nombre_subcategoria, descripcion_subcategoria, id_categoria } = editForm;
    try {
      await API.put(`subcategorias/editar/${id_subcategoria}`, {
        nombre_subcategoria,
        descripcion_subcategoria,
        id_categoria,
      });
      Swal.fire("Actualizado", "Subcategoría actualizada con éxito", "success");
      setShowEditModal(false);
      if ($.fn.DataTable.isDataTable("#tablaSubcategorias")) {
        $("#tablaSubcategorias").DataTable().destroy();
      }
      cargarDatos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar la subcategoría", "error");
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>Gestión de Subcategorías</h1>
        </div>

        {loading ? (
          <Loader text="Sincronizando subcategorías..." />
        ) : (
          <div className="row g-4 animate-section">
            <div className="col-lg-4">
              <div className="admin-card shadow-sm border-0">
                <h2 className="section-title h5 mb-3 fw-bold">Agregar Subcategoría</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group-pro">
                    <label className="form-label-pro">Categoría Padre</label>
                    <select name="id_categoria" className="form-control-pro" value={form.id_categoria} onChange={handleChange} required >
                      <option value="">Selecciona categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-pro mt-3">
                    <label className="form-label-pro">Nombre Subcategoría</label>
                    <input type="text" name="nombre_subcategoria" className="form-control-pro" placeholder="Ej. Camisetas" value={form.nombre_subcategoria} onChange={handleChange} required />
                  </div>
                  <div className="form-group-pro mt-3">
                    <label className="form-label-pro">Descripción</label>
                    <textarea name="descripcion_subcategoria" className="form-control-pro" placeholder="Descripción detallada..." value={form.descripcion_subcategoria} onChange={handleChange} rows={3} required />
                  </div>
                  <button type="submit" className="btn-pro btn-pro-primary w-100 justify-content-center mt-4 p-2 fw-600">
                    <FontAwesomeIcon icon={faPlus} /> Añadir Subcategoría
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="premium-table-container shadow-sm border-0">
                <table className="premium-table" id="tablaSubcategorias">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subcategoría</th>
                      <th>Padre</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategorias.map((subcat) => (
                      <tr key={subcat.id_subcategoria}>
                        <td className="fw-700 text-muted" data-order={subcat.id_subcategoria}>
                          #{subcat.id_subcategoria}
                        </td>
                        <td className="fw-600">{subcat.nombre_subcategoria}</td>
                        <td className="text-primary fw-600">{subcat.nombre_categoria}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-sm btn-outline-primary border-0" onClick={() => abrirEditarModal(subcat)} title="Editar">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarSubcategoria(subcat.id_subcategoria)} title="Eliminar">
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
                  <h5 className="modal-title fw-bold">Editar Subcategoría</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-600">Categoría Padre</label>
                    <select className="form-control-pro" name="id_categoria" value={editForm.id_categoria} onChange={handleEditChange} required >
                      <option value="">Selecciona Categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-600">Nombre</label>
                    <input type="text" className="form-control-pro" name="nombre_subcategoria" value={editForm.nombre_subcategoria} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-600">Descripción</label>
                    <textarea className="form-control-pro" name="descripcion_subcategoria" value={editForm.descripcion_subcategoria} onChange={handleEditChange} rows={3} required />
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
