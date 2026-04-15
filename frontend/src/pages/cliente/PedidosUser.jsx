import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, API_URL } from '../../config/api'; // Usamos la instancia de API (Axios) para mayor seguridad

export default function PedidosUser() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const token = localStorage.getItem('token'); // Recuperamos el token de sesión

    if (!usuarioGuardado) {
      navigate('/');
      return;
    }

    const parsedUsuario = JSON.parse(usuarioGuardado);

    // Verificamos que sea un cliente (Rol 2)
    if (Number(parsedUsuario.id_rol) !== 2) {
      navigate('/');
      return;
    }

    const cargarPedidosUsuario = async () => {
      try {
        setCargando(true);

        console.log("[FRONT DEBUG] Token from localStorage:", token);
        console.log("[FRONT DEBUG] User ID:", parsedUsuario.id_usuario);

        // Usamos fetch con los headers de autorización para evitar el Error 403
        const res = await API.get(`pedidos/usuario/${parsedUsuario.id_usuario}`);

        const data = res.data;

        // Validamos que los datos sean un arreglo
        setPedidos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error en la vista de pedidos:", error);
        setPedidos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarPedidosUsuario();
  }, [navigate]);

  // Función para procesar el campo 'productos' (que a veces viene como String JSON de la DB)
  const renderizarProductos = (productos) => {
    try {
      const lista = typeof productos === 'string' ? JSON.parse(productos) : productos;
      if (!Array.isArray(lista)) return "Sin detalles";
      return lista.map((p) => p.nombre || p.nombre_producto).join(", ");
    } catch (e) {
      return "Error al leer productos";
    }
  };

  if (cargando) return <div className="container mt-5 text-center"><p>Cargando tus compras...</p></div>;

  return (
    <main className="container mt-5" style={{ minHeight: '80vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mis Pedidos</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
          Volver a la tienda
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className="alert alert-info">
          No tienes pedidos realizados aún. ¡Anímate a comprar algo!
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID Factura</th>
                <th>Fecha</th>
                <th>Dirección</th>
                <th>Productos</th>
                <th>Cant.</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id_factura}>
                  <td className="fw-bold">#{pedido.id_factura}</td>
                  <td>{pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString() : 'N/A'}</td>
                  <td>{pedido.direccion}</td>
                  <td style={{ maxWidth: '250px' }} className="text-truncate">
                    {renderizarProductos(pedido.productos)}
                  </td>
                  <td className="text-center">{pedido.total_productos}</td>
                  <td className="fw-bold text-success">
                    ${Number(pedido.total).toLocaleString("es-CO")}
                  </td>
                  <td>
                    <span className={`badge ${pedido.estado === 'entregado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/factura/${pedido.id_factura}`)}
                    >
                      <i className="bi bi-file-earmark-pdf"></i> Ver Factura
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}