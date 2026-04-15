import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/gestionproductos.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API, imgUrl } from '../../config/api';
import Loader from "../../components/Loader.jsx";

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await API.get(`productos/listar`);
      if (Array.isArray(res.data)) {
        setProductos(res.data);
      } else {
        setProductos([]);
        console.error("La respuesta no es un arreglo:", res.data);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productos.length === 0 || loading) return;

    if ($.fn.DataTable.isDataTable("#tablaProductos")) {
      $("#tablaProductos").DataTable().clear().destroy();
    }

    const timer = setTimeout(() => {
      $("#tablaProductos").DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        order: [[0, 'asc']],
        columnDefs: [{ targets: 0, type: 'num' }],
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
        },
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      if ($.fn.DataTable.isDataTable("#tablaProductos")) {
        $("#tablaProductos").DataTable().clear().destroy();
      }
    };
  }, [productos, loading]);

  const eliminarProducto = async (id) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Eliminar producto",
      text: "¿Estás seguro de eliminar este producto?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await API.delete(`productos/eliminar/${id}`);
      if (response.status === 200) {
        if ($.fn.DataTable.isDataTable("#tablaProductos")) {
          $("#tablaProductos").DataTable().destroy();
        }
        cargarProductos();
        Swal.fire("Producto eliminado", "El producto ha sido eliminado con éxito.", "success");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "No se pudo eliminar el producto.", "error");
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>Gestión de Productos</h1>
          <Link to="/agregar-producto" className="btn-pro btn-pro-primary" style={{ textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faPlus} /> Añadir Producto
          </Link>
        </div>

        {loading ? (
          <Loader text="Analizando inventario..." />
        ) : (
          <div className="premium-table-container animate-section">
            <table className="premium-table" id="tablaProductos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Imagen</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Subcategoría</th>
                  <th>Creación</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td className="fw-700 text-muted" data-order={producto.id_producto}>
                      #{producto.id_producto}
                    </td>
                    <td className="fw-600">{producto.nombre}</td>
                    <td>
                      <img
                        src={imgUrl(producto.imagen)}
                        alt={producto.nombre}
                        width="60"
                        height="60"
                        style={{ objectFit: "contain", borderRadius: "8px", border: "1px solid #edf2f7" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default.png";
                        }}
                      />
                    </td>
                    <td style={{ maxWidth: "250px" }}>
                      <div className="text-truncate" title={producto.descripcion}>{producto.descripcion}</div>
                    </td>
                    <td className="fw-700 text-primary">${Number(producto.precio).toLocaleString()}</td>
                    <td>
                      <span className={`badge-pro ${producto.stock > 0 ? 'badge-active' : 'badge-inactive'}`}>
                        {producto.stock} en stock
                      </span>
                    </td>
                    <td className="small fw-600">{producto.nombre_categoria}</td>
                    <td className="small text-muted">{producto.nombre_subcategoria}</td>
                    <td className="text-muted small">{producto.fecha_creacion?.split("T")[0]}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Link
                          to={`/editar-producto/${producto.id_producto}`}
                          className="btn btn-sm btn-outline-primary border-0"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => eliminarProducto(producto.id_producto)}
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
