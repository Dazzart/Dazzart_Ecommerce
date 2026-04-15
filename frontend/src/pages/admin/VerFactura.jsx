import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API, API_URL } from '../../config/api';
import Swal from "sweetalert2";

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [estadoEditable, setEstadoEditable] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  const estadosDisponibles = ["en proceso", "en camino", "entregado"];

  const cargarFactura = () => {
    API.get(`pedidos/${id}`)
      .then((res) => {
        const data = res.data;
        setFactura(data);
        setEstadoEditable(data.estado);
        setNuevoEstado("");
      })
      .catch((err) => {
        console.error("Error al obtener factura:", err);
        if (err.response?.status === 403) {
          Swal.fire("Error", "No tienes permisos para ver esta factura", "error");
        }
      });
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
    cargarFactura();
  }, [id]);

  const guardarCambioEstado = async () => {
    try {
      await API.put(`pedidos/actualizar-estado/${id}`, { estado: nuevoEstado });
      setFactura(prev => ({ ...prev, estado: nuevoEstado }));
      setEstadoEditable(nuevoEstado);
      setNuevoEstado("");
      Swal.fire("Éxito", "Estado actualizado correctamente", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  if (!factura) {
    return (
      <div className="d-flex">
        <SidebarAdmin />
        <main className="admin-main-wrapper d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted fw-500">Cargando detalles del pedido...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header justify-content-center">
          <h1>Detalles del Pedido</h1>
        </div>

        <div className="d-flex justify-content-center pt-3">
          <div className="admin-card shadow-lg" style={{ maxWidth: "600px", width: '100%' }}>
            <div className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-700 mb-0">Factura #{factura.id_factura}</h5>
              <span className={`badge-pro ${factura.estado === 'entregado' ? 'badge-active' : factura.estado === 'cancelado' ? 'badge-inactive' : 'badge-warning'}`}>
                {factura.estado}
              </span>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="text-muted small fw-600 text-uppercase d-block mb-1">Cliente</label>
                <p className="fw-600 mb-0">{factura.nombre_cliente}</p>
              </div>
              <div className="col-md-6">
                <label className="text-muted small fw-600 text-uppercase d-block mb-1">Dirección</label>
                <p className="fw-500 mb-0">{factura.direccion}</p>
              </div>

              <div className="col-12 mt-4">
                <label className="text-muted small fw-600 text-uppercase d-block mb-2">Resumen de Productos</label>
                <div className="bg-light p-3 rounded-3">
                  {(typeof factura.productos === "string"
                    ? JSON.parse(factura.productos)
                    : factura.productos
                  ).map((prod, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 last-item-mb-0">
                      <span className="fw-500">
                        {prod.nombre} <span className="text-muted">x{prod.cantidad}</span>
                      </span>
                      <span className="fw-700 text-primary">
                        ${Number(prod.precio_final ?? prod.precio ?? 0).toLocaleString("es-CO")}
                      </span>
                    </div>
                  ))}
                  <div className="border-top mt-3 pt-2 d-flex justify-content-between align-items-center">
                    <span className="fw-700">Total</span>
                    <span className="fw-800 h5 mb-0 text-primary">
                      ${Number(factura.total).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-12 mt-5">
                <label className="text-muted small fw-600 text-uppercase d-block mb-3">Gestión de Entrega</label>

                {factura.estado === "cancelado" || factura.estado === "entregado" ? (
                  <div className={`alert ${factura.estado === 'cancelado' ? 'alert-danger' : 'alert-success'} border-0`}>
                    El pedido ha sido marcado como <strong>{factura.estado}</strong>.
                  </div>
                ) : (
                  <div className="input-group">
                    <select
                      value={nuevoEstado}
                      className="form-control-pro"
                      onChange={(e) => setNuevoEstado(e.target.value)}
                    >
                      <option value="">Cambiar estado...</option>
                      {estadosDisponibles.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                    <button
                      className="btn-pro btn-pro-primary ms-2"
                      onClick={guardarCambioEstado}
                      disabled={!nuevoEstado || nuevoEstado === estadoEditable}
                    >
                      Actualizar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-center">
              <button
                className="btn-pro btn-pro-outline-secondary w-100 justify-content-center"
                onClick={() => navigate(-1)}
                style={{ border: '1.5px solid #bdc3c7', padding: '12px' }}
              >
                Volver al listado
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}