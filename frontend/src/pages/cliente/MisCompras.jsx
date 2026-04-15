import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/cliente/Header';
import Footer from '../../components/cliente/Footer';
import MenuLateral from '../../components/cliente/MenuLateral';
import Carrito from '../../components/cliente/carrito';
import { API } from '../../config/api';

export default function MisCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const navigate = useNavigate();

  // 1. Cargar y validar sesión del usuario
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      navigate('/');
      return;
    }

    try {
      const parsedUsuario = JSON.parse(usuarioGuardado);

      if (Number(parsedUsuario.id_rol) !== 2) {
        navigate('/');
        return;
      }
      setUsuario(parsedUsuario);
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  // 2. Función para obtener el historial de compras
  const cargarCompras = useCallback(async () => {
    if (!usuario || !usuario.id_usuario) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await API.get(`pedidos/usuario/${usuario.id_usuario}`);
      const data = res.data;

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(data.message || 'Error al obtener las compras');
      }

      setCompras(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // 3. Efecto para disparar la carga cuando el usuario esté listo
  useEffect(() => {
    if (usuario) {
      cargarCompras();
    }
  }, [usuario, cargarCompras]);

  // 4. Lógica para cancelar un pedido pendiente
  const handleCancelar = async (id_factura) => {
    const confirmacion = window.confirm('¿Estás seguro de cancelar el pedido?');
    if (!confirmacion) return;

    const token = localStorage.getItem('token');

    try {
      const res = await API.put(`pedidos/cancelar/${id_factura}`);
      const data = res.data;
      if (res.status !== 200 && res.status !== 201) throw new Error(data.message || 'Error al cancelar');

      alert('Pedido cancelado con éxito');
      cargarCompras();
    } catch (err) {
      alert(err.message || 'Error al cancelar el pedido');
    }
  };

  const handleBuscar = () => {
    const termino = busqueda.trim();
    if (termino.length > 0) {
      navigate(`/buscar/${encodeURIComponent(termino)}`);
      setBusqueda('');
    }
  };

  // Estados de carga y error
  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2">Cargando tus compras...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-5 text-center">
      <div className="alert alert-danger">Error: {error}</div>
      <button className="btn btn-primary" onClick={cargarCompras}>Reintentar</button>
    </div>
  );

  return (
    <>
      <Header
        onOpenMenu={() => setShowMenu(true)}
        usuario={usuario}
        onLogout={() => {
          localStorage.removeItem('usuario');
          localStorage.removeItem('token');
          navigate('/');
          window.location.reload();
        }}
        onOpenCarrito={() => navigate('/carrito')}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBuscar={handleBuscar}
      />

      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main className="container mt-5 flex-grow-1">
          <h2 className="mb-4">Mis compras</h2>

          {compras.length === 0 ? (
            <div className="alert alert-info">No has realizado compras aún.</div>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID Pedido</th>
                    <th>Dirección</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map(pedido => {
                    let productosArr = [];
                    try {
                      productosArr = typeof pedido.productos === 'string'
                        ? JSON.parse(pedido.productos)
                        : Array.isArray(pedido.productos) ? pedido.productos : [];
                    } catch (e) {
                      productosArr = [];
                    }

                    return (
                      <tr key={pedido.id_factura}>
                        <td className="fw-bold">#{pedido.id_factura}</td>
                        <td>{pedido.direccion}</td>
                        <td>
                          <ul className="list-unstyled mb-0">
                            {productosArr.map((p, i) => (
                              <li key={i} style={{ fontSize: '0.9rem' }}>
                                • {p.nombre || p.nombre_producto} <span className="text-muted">(x{p.cantidad})</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="fw-bold text-success">
                          ${Number(pedido.total).toLocaleString("es-CO")}
                        </td>
                        <td>
                          <span className={`badge rounded-pill bg-${pedido.estado === 'cancelado' ? 'danger' :
                            pedido.estado === 'pendiente' ? 'warning text-dark' : 'success'
                            }`}>
                            {pedido.estado.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center">
                          {pedido.estado === 'pendiente' ? (
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelar(pedido.id_factura)}>
                              Cancelar
                            </button>
                          ) : <span className="text-muted">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {mostrarCarrito && usuario && (
        <Carrito id_usuario={usuario.id_usuario} onClose={() => setMostrarCarrito(false)} />
      )}
    </>
  );
}