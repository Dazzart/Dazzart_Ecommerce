import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/descuento.css";
import Swal from "sweetalert2";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate, Link } from "react-router-dom";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API } from '../../config/api';
import "../../css/CSSA/admin-global.css";

import Loader from "../../components/Loader.jsx";

export default function DescuentosAdmin() {
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarDescuentos = async () => {
    setLoading(true);
    try {
      const res = await API.get(`descuentos`);
      setDescuentos(Array.isArray(res.data) ? res.data : []);

      setLoading(false);
      setTimeout(() => {
        if (!$.fn.DataTable.isDataTable("#tablaDescuentos")) {
          $('#tablaDescuentos').DataTable({
            responsive: true,
            autoWidth: false,
            pageLength: 10,
            lengthMenu: [[5, 10, 20], [5, 10, 20]],
            language: {
              lengthMenu: "Mostrar _MENU_ registros por página",
              zeroRecords: "No se encontraron resultados",
              info: "Mostrando página _PAGE_ de _PAGES_",
              infoEmpty: "No hay registros disponibles",
              infoFiltered: "(filtrado de _MAX_ registros en total)",
              search: "Buscar:",
              paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior",
              },
            }
          });
        }
      }, 100);
    } catch (error) {
      setLoading(false);
      console.error("Error al cargar descuentos:", error);
    }
  };

  const eliminarDescuento = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
    });

    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`descuentos/${id}`);
      Swal.fire("Eliminado", "El descuento ha sido eliminado.", "success");
      if ($.fn.DataTable.isDataTable("#tablaDescuentos")) {
        $("#tablaDescuentos").DataTable().destroy();
      }
      cargarDescuentos();
    } catch (error) {
      console.error("Error al eliminar descuento:", error);
      Swal.fire("Error", "No se pudo eliminar el descuento.", "error");
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarDescuentos();
  }, []);

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>Gestión de Descuentos</h1>
          <Link to="/agregar-descuento" className="btn-pro btn-pro-primary" style={{ textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faPlus} /> Añadir Descuento
          </Link>
        </div>

        {loading ? (
          <Loader text="Analizando promociones activas..." />
        ) : (
          <div className="premium-table-container animate-section">
            <table className="premium-table" id="tablaDescuentos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th>Aplicación</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {descuentos.map((d) => (
                  <tr key={d.id_descuento}>
                    <td className="fw-700">#{d.id_descuento}</td>
                    <td className="fw-600">{d.tipo_descuento}</td>
                    <td className="fw-700 text-primary">
                      {d.tipo_descuento === 'Porcentaje' ? `${d.valor}%` : `$${Number(d.valor).toLocaleString()}`}
                    </td>
                    <td>
                      <div className="small">
                        <div className="text-success"><span className="fw-600">Desde:</span> {d.fecha_inicio?.split("T")[0]}</div>
                        <div className="text-danger"><span className="fw-600">Hasta:</span> {d.fecha_fin?.split("T")[0]}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-pro ${d.estado_descuento.toLowerCase() === 'activo' ? 'badge-active' : 'badge-inactive'}`}>
                        {d.estado_descuento}
                      </span>
                    </td>
                    <td>
                      {d.aplicacion === "producto"
                        ? <span className="small fw-500">{d.nombre_producto || 'Sin asignar'}</span>
                        : d.aplicacion === "categoria"
                          ? <span className="small text-muted">Cat: {d.nombre_categoria || 'Sin asignar'}</span>
                          : <span className="badge bg-light text-dark border p-1 rounded small">Catálogo Global</span>}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <a
                          href={`/editar-descuento/${d.id_descuento}`}
                          className="btn btn-sm btn-outline-primary border-0"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </a>
                        <button
                          className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => eliminarDescuento(d.id_descuento)}
                          title="Eliminar"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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
