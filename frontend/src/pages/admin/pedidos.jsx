import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faArrowLeft, faBoxArchive } from '@fortawesome/free-solid-svg-icons';
import { API, API_URL } from '../../config/api';
import Swal from "sweetalert2";
import "../../css/CSSA/admin-global.css";
import Loader from "../../components/Loader.jsx";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarPapelera, setMostrarPapelera] = useState(false);
  const [pedidosPapelera, setPedidosPapelera] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const res = await API.get(`pedidos`);
      const data = res.data;

      if (Array.isArray(data)) {
        const pedidosParseados = data.map(pedido => {
          if (typeof pedido.productos === 'string') {
            try {
              pedido.productos = JSON.parse(pedido.productos);
            } catch (e) {
              pedido.productos = [];
            }
          }
          return pedido;
        });
        setPedidos(pedidosParseados);
      } else {
        setPedidos([]);
      }

      setLoading(false);
      setTimeout(() => {
        if (!$.fn.DataTable.isDataTable("#tablaPedidos")) {
          $("#tablaPedidos").DataTable({
            responsive: true,
            autoWidth: false,
            pageLength: 10,
            order: [[0, 'desc']],
            columnDefs: [{ targets: 0, type: 'num' }],
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
      console.error("Error al obtener pedidos:", error);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPapelera = async () => {
    setLoading(true);
    try {
      const res = await API.get(`pedidos?papelera=1`);
      const data = res.data;
      const filtrados = Array.isArray(data)
        ? data.filter(p => ["cancelado", "entregado"].includes((p.estado || "").toLowerCase()))
        : [];
      setPedidosPapelera(filtrados);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setPedidosPapelera([]);
      console.error("Error al obtener papelera:", error);
    }
  };

  useEffect(() => {
    if (mostrarPapelera) cargarPapelera();
  }, [mostrarPapelera]);

  const eliminarPedido = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Archivar pedido?",
      text: "El pedido se moverá a la papelera.",
      showCancelButton: true,
      confirmButtonText: "Sí, archivar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`pedidos/eliminar/${id}`);
      Swal.fire("Archivado", "El pedido se ha movido a la papelera.", "success");
      if ($.fn.DataTable.isDataTable("#tablaPedidos")) {
        $("#tablaPedidos").DataTable().destroy();
      }
      cargarPedidos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo archivar el pedido.", "error");
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <h1>{mostrarPapelera ? "Pedidos en Papelera" : "Gestión de Pedidos"}</h1>
          <div className="d-flex gap-2">
            <button
              className={`btn-pro ${mostrarPapelera ? 'btn-pro-primary' : 'btn-outline-primary'}`}
              style={{ border: mostrarPapelera ? 'none' : '1.5px solid #3483fa' }}
              onClick={() => {
                if (mostrarPapelera) setMostrarPapelera(false);
                else setMostrarPapelera(true);
              }}
            >
              <FontAwesomeIcon icon={mostrarPapelera ? faArrowLeft : faBoxArchive} />
              {mostrarPapelera ? " Volver" : " Papelera"}
            </button>
            {mostrarPapelera && (
              <button
                className="btn btn-danger"
                onClick={async () => {
                  const result = await Swal.fire({
                    icon: "warning",
                    title: "¿Vaciar papelera?",
                    text: "Esta acción eliminará definitivamente los pedidos con más de 7 días.",
                    showCancelButton: true,
                    confirmButtonText: "Sí, vaciar",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#d33",
                  });
                  if (result.isConfirmed) {
                    await API.delete(`pedidos/vaciar-papelera`);
                    cargarPapelera();
                  }
                }}
              >
                <FontAwesomeIcon icon={faTrashAlt} /> Vaciar Papelera
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loader text="Sincronizando órdenes..." />
        ) : (
          <div className="premium-table-container animate-section">
            <table className="premium-table" id="tablaPedidos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(mostrarPapelera ? pedidosPapelera : pedidos)
                  .filter(p => mostrarPapelera
                    ? ["cancelado", "entregado"].includes((p.estado || '').toLowerCase())
                    : !["cancelado", "entregado"].includes((p.estado || '').toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id_factura}>
                      <td className="fw-700 text-muted" data-order={p.id_factura}>
                        #{p.id_factura}
                      </td>
                      <td className="fw-500">{p.nombre_cliente}</td>
                      <td className="text-muted small">{p.direccion}</td>
                      <td className="fw-700 text-primary">${Number(p.total).toLocaleString("es-CO")}</td>
                      <td>
                        <span className={`badge-pro ${p.estado.toLowerCase() === "entregado" ? "badge-active" : "badge-inactive"}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-sm btn-outline-info border-0" onClick={() => navigate(`/ver-factura/${p.id_factura}`)}>
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          {!mostrarPapelera && (
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarPedido(p.id_factura)}>
                              <FontAwesomeIcon icon={faTrashAlt} />
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
