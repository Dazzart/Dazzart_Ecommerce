import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from '../../components/SideBarAdmin.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faShoppingCart,
  faUsers,
  faBoxOpen,
  faStar,
  faEdit,
  faTrash,
  faSyncAlt,
  faChartLine,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { API } from '../../config/api';
import Swal from "sweetalert2";
import '../../css/CSSA/estadisticas.css';
import '../../css/CSSA/admin-global.css';

import Loader from "../../components/Loader.jsx";

// Componente para animar números
const Counter = ({ value, format }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (start === end) return;

    let totalDuration = 1000;
    let increment = end / (totalDuration / 10);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{format ? format(displayValue) : Math.round(displayValue)}</span>;
};

export default function EstadisticasAdmin() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    totalClientes: 0,
    totalProductos: 0,
    productosMasVendidos: [],
    stockTotal: 0
  });
  const [tendenciaVentas, setTendenciaVentas] = useState([]);
  const [mostrarStock, setMostrarStock] = useState(false);
  const [mostrarIngresos, setMostrarIngresos] = useState(false);
  const [ingresosDetalle, setIngresosDetalle] = useState({
    hoy: 0,
    mes: 0,
    anio: 0
  });
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [productosRes, pedidosRes] = await Promise.all([
        API.get(`productos/listar`),
        API.get(`pedidos`),
      ]);

      const productosData = productosRes.data;
      setProductos(productosData);

      const pedidos = pedidosRes.data;
      const pedidosValidos = pedidos.filter(p => p.estado !== 'cancelado');

      const totalVentas = pedidosValidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
      const totalPedidos = pedidos.length;
      const clientesUnicos = new Set(pedidos.map(p => p.nombre_cliente)).size;

      // Cálculos de Ingresos por tiempo
      const hoy = new Date();
      const ingresosHoy = pedidosValidos
        .filter(p => new Date(p.fecha_pedido).toDateString() === hoy.toDateString())
        .reduce((acc, p) => acc + Number(p.total || 0), 0);

      const ingresosMes = pedidosValidos
        .filter(p => {
          const f = new Date(p.fecha_pedido);
          return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
        })
        .reduce((acc, p) => acc + Number(p.total || 0), 0);

      const ingresosAnio = pedidosValidos
        .filter(p => new Date(p.fecha_pedido).getFullYear() === hoy.getFullYear())
        .reduce((acc, p) => acc + Number(p.total || 0), 0);

      setIngresosDetalle({ hoy: ingresosHoy, mes: ingresosMes, anio: ingresosAnio });

      // Tendencia de Ventas (últimos 7 días)
      const ultimos7Dias = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
      }).reverse();

      const tendencia = ultimos7Dias.map(fecha => {
        const totalDia = pedidosValidos
          .filter(p => new Date(p.fecha_pedido).toLocaleDateString() === fecha)
          .reduce((acc, p) => acc + Number(p.total || 0), 0);
        return { fecha, total: totalDia };
      });
      setTendenciaVentas(tendencia);

      const productosVendidos = {};
      pedidosValidos.forEach(p => {
        if (!p.productos) return;
        let productosArray = Array.isArray(p.productos) ? p.productos : [];
        productosArray.forEach(prod => {
          const nombre = prod.nombre?.trim() || 'Desconocido';
          const cantidad = Number(prod.cantidad) || 0;
          productosVendidos[nombre] = (productosVendidos[nombre] || 0) + cantidad;
        });
      });

      const totalVendidosCount = Object.values(productosVendidos).reduce((a, b) => a + b, 0);

      const productosMasVendidosSorted = Object.entries(productosVendidos)
        .map(([nombre, vendidos]) => ({
          nombre,
          vendidos,
          percentage: totalVendidosCount > 0 ? (vendidos / totalVendidosCount) * 100 : 0
        }))
        .sort((a, b) => b.vendidos - a.vendidos)
        .slice(0, 5);

      const stockTotal = productosData.reduce((acc, p) => acc + Number(p.stock || 0), 0);

      setEstadisticas({
        totalVentas,
        totalPedidos,
        totalClientes: clientesUnicos,
        totalProductos: productosData.length,
        productosMasVendidos: productosMasVendidosSorted,
        stockTotal
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const formatoDinero = (num) => {
    return num.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  const eliminarProducto = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`productos/eliminar/${id}`);
        Swal.fire("Eliminado", "Producto eliminado correctamente.", "success");
        cargarEstadisticas();
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />

      <main className="admin-main-wrapper">
        <div className="page-header">
          <div>
            <h1>Dazzart Analytics</h1>
            <p className="text-muted mb-0">Bienvenido al centro de control administrativo</p>
          </div>
          <button
            className="btn-pro btn-pro-primary"
            onClick={cargarEstadisticas}
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={loading} /> Actualizar Datos
          </button>
        </div>

        {loading ? (
          <Loader text="Compilando métricas en tiempo real..." />
        ) : (
          <div className="animate-section">
            {/* KPI Section */}
            <section className="kpi-grid">
              <div className="kpi-card kpi-blue animate-in" onClick={() => setMostrarIngresos(true)} style={{ cursor: 'pointer' }}>
                <div className="kpi-icon"><FontAwesomeIcon icon={faMoneyBillWave} /></div>
                <span className="kpi-label">Ingresos Totales</span>
                <span className="kpi-value"><Counter value={estadisticas.totalVentas} format={formatoDinero} /></span>
                <div className="text-primary small mt-2 fw-600">
                  Ver reporte detallado &rarr;
                </div>
              </div>

              <div className="kpi-card kpi-green animate-in" style={{ animationDelay: '0.1s' }}>
                <div className="kpi-icon"><FontAwesomeIcon icon={faShoppingCart} /></div>
                <span className="kpi-label">Conversiones</span>
                <span className="kpi-value"><Counter value={estadisticas.totalPedidos} /></span>
                <div className="text-muted small mt-2">Órdenes procesadas</div>
              </div>

              <div className="kpi-card kpi-cyan animate-in" style={{ animationDelay: '0.2s' }}>
                <div className="kpi-icon"><FontAwesomeIcon icon={faUsers} /></div>
                <span className="kpi-label">Base de Clientes</span>
                <span className="kpi-value"><Counter value={estadisticas.totalClientes} /></span>
                <div className="text-muted small mt-2">Clientes únicos</div>
              </div>

              <div className="kpi-card kpi-orange animate-in" onClick={() => setMostrarStock(true)} style={{ cursor: 'pointer', animationDelay: '0.3s' }}>
                <div className="kpi-icon"><FontAwesomeIcon icon={faBoxOpen} /></div>
                <span className="kpi-label">Inventario Total</span>
                <span className="kpi-value"><Counter value={estadisticas.stockTotal} /></span>
                <div className="text-primary small mt-2 fw-600">Ver detalle de stock &rarr;</div>
              </div>
            </section>

            {/* Insights Section */}
            <div className="dashboard-content-grid">
              <div className="section-card">
                <h3 className="section-title"><FontAwesomeIcon icon={faChartLine} className="text-primary" /> Tendencia de Ventas (7D)</h3>
                <div className="chart-container-premium">
                  {tendenciaVentas.length > 0 ? (
                    <div className="bar-chart-wrapper">
                      {tendenciaVentas.map((dia, idx) => {
                        const maxVal = Math.max(...tendenciaVentas.map(t => t.total), 1);
                        const heightPercent = (dia.total / maxVal) * 100;
                        return (
                          <div key={idx} className="bar-column">
                            <div className="bar-value-tooltip">{formatoDinero(dia.total)}</div>
                            <div className="bar-fill" style={{ height: `${Math.max(heightPercent, 5)}%` }}></div>
                            <div className="bar-label">{dia.fecha.split('/')[0]}/{dia.fecha.split('/')[1]}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted text-center py-5">Cargando tendencia...</p>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="section-title h6">Desempeño de Catálogo</h4>
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div>
                      <small className="text-muted">Total SKUs</small>
                      <div className="fw-bold">{estadisticas.totalProductos} Productos</div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Estado</small>
                      <div className="text-success"><span className="badge bg-success">Operativo</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <h3 className="section-title"><FontAwesomeIcon icon={faStar} className="text-warning" /> Top Ranking</h3>
                {estadisticas.productosMasVendidos.length > 0 ? (
                  estadisticas.productosMasVendidos.map((prod, idx) => (
                    <div key={idx} className="top-product-item">
                      <div className="product-info">
                        <span>{prod.nombre}</span>
                        <span className="text-primary">{prod.vendidos} u.</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.max(prod.percentage, 10)}%`,
                            backgroundColor: idx === 0 ? 'var(--dash-primary)' : idx === 1 ? 'var(--dash-secondary)' : '#bdc3c7'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-5">Sin datos de ventas aún</p>
                )}
              </div>
            </div>

            {/* Modal de Ingresos Detalle */}
            {mostrarIngresos && (
              <div className="modal show d-block modal-overlay" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content modal-content-pro">
                    <div className="modal-header border-0 pb-0">
                      <h5 className="modal-title fw-bold">Reporte de Ingresos</h5>
                      <button type="button" className="btn-close" onClick={() => setMostrarIngresos(false)}></button>
                    </div>
                    <div className="modal-body p-4">
                      <div className="list-group list-group-flush">
                        <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                          <div>
                            <div className="fw-bold">Ingresos Hoy</div>
                            <small className="text-muted">Ventas del día actual</small>
                          </div>
                          <span className="fs-5 fw-bold text-success"><Counter value={ingresosDetalle.hoy} format={formatoDinero} /></span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                          <div>
                            <div className="fw-bold">Ingresos del Mes</div>
                            <small className="text-muted">Total de este mes</small>
                          </div>
                          <span className="fs-5 fw-bold text-primary"><Counter value={ingresosDetalle.mes} format={formatoDinero} /></span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                          <div>
                            <div className="fw-bold">Ingresos del Año</div>
                            <small className="text-muted">Cifras anuales</small>
                          </div>
                          <span className="fs-5 fw-bold text-dark"><Counter value={ingresosDetalle.anio} format={formatoDinero} /></span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center py-3 bg-light rounded mt-2">
                          <div>
                            <div className="fw-bold">Total Histórico</div>
                            <small className="text-muted">Desde el inicio</small>
                          </div>
                          <span className="fs-4 fw-bold text-dark"><Counter value={estadisticas.totalVentas} format={formatoDinero} /></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Modal Refreshing */}
            {mostrarStock && (
              <div className="modal show d-block modal-overlay" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content modal-content-pro">
                    <div className="modal-header border-0 pb-0">
                      <h5 className="modal-title fw-bold">Inventario de Productos</h5>
                      <button type="button" className="btn-close" onClick={() => setMostrarStock(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="table-responsive">
                        <table className="table custom-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th className="text-center">Stock</th>
                              <th className="text-end">Valor Unitario</th>
                              <th className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productos.map((prod) => (
                              <tr key={prod.id_producto}>
                                <td className="fw-500">{prod.nombre}</td>
                                <td className="text-center">
                                  <span className={`badge ${prod.stock < 10 ? 'bg-danger' : 'bg-light text-dark border'}`}>
                                    {prod.stock}
                                  </span>
                                </td>
                                <td className="text-end fw-bold">{formatoDinero(prod.precio_final ?? prod.precio)}</td>
                                <td className="text-center">
                                  <div className="btn-group">
                                    <button className="btn btn-sm btn-outline-primary border-0" onClick={() => navigate(`/editar-producto/${prod.id_producto}`)}>
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarProducto(prod.id_producto)}>
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
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
