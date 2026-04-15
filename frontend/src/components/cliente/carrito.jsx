import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ProductoDetalle from '../../pages/cliente/ProductoDetalle';
import ModalConfirmarPedido from './ModalConfirmarPedido';
import ModalConfirmacion from './ModalConfirmacion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faLightbulb } from '@fortawesome/free-solid-svg-icons';
// Importamos la configuración centralizada
import { API, imgUrl } from '../../config/api';

export default function Carrito({ id_usuario, direccion, onOpenLogin }) {
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
  const [recomendados, setRecomendados] = useState([]);
  const [mostrarErrorCantidad, setMostrarErrorCantidad] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [direccionPedido, setDireccionPedido] = useState(direccion || '');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. CARGAR CARRITO (Con Axios/API para evitar 403)
  useEffect(() => {
    if (!id_usuario) return;
    setLoading(true);
    API.get(`carrito/${id_usuario}`)
      .then(res => {
        const datos = Array.isArray(res.data) ? res.data : [];
        const carritoConImagen = datos.map(item => ({
          ...item,
          urlImagen: imgUrl(item.imagen) // Usamos la función centralizada
        }));
        setCarrito(carritoConImagen);
      })
      .catch(err => {
        console.error("Error cargando carrito:", err);
        setCarrito([]); // Evita que el diseño se rompa si hay error 500
      })
      .finally(() => setLoading(false));
  }, [id_usuario]);

  // 2. CARGAR RECOMENDADOS
  useEffect(() => {
    API.get(`productos/listar`)
      .then(res => {
        const idsEnCarrito = carrito.map(item => item.id_producto);
        const filtrados = res.data
          .filter(prod => !idsEnCarrito.includes(prod.id_producto))
          .slice(0, 4)
          .map(prod => ({
            ...prod,
            urlImagen: imgUrl(prod.imagen)
          }));
        setRecomendados(filtrados);
      })
      .catch(() => setRecomendados([]));
  }, [carrito]);

  const eliminarProducto = (id_carrito) => {
    setProductoAEliminar(id_carrito);
    setMostrarModalEliminar(true);
  };

  const confirmarEliminar = () => {
    if (!productoAEliminar) return;
    API.delete(`carrito/${productoAEliminar}`)
      .then(() => {
        setCarrito(carrito.filter(item => item.id_carrito !== productoAEliminar));
        setMostrarModalEliminar(false);
      })
      .catch(() => {
        setModalMensaje('Error al eliminar el producto');
        setMostrarModal(true);
      });
  };

  const calcularTotalRaw = () => {
    return carrito.reduce((sum, item) => {
      const precio = item.precio_final ?? item.precio;
      return sum + (Number(precio) * Number(item.cantidad));
    }, 0);
  };

  const calcularTotal = () => calcularTotalRaw().toLocaleString('es-CO');

  const comprar = () => {
    if (carrito.length === 0) return;
    setMostrarModalPedido(true);
  };

  const confirmarCompra = async () => {
    setMostrarModalPedido(false);
    try {
      const payload = {
        id_usuario,
        direccion: direccionPedido || direccion,
        productos: carrito,
        total_productos: carrito.reduce((sum, item) => sum + item.cantidad, 0),
        total: calcularTotalRaw(),
      };

      const res = await API.post('pedidos', payload);
      
      if (res.status === 200 || res.status === 201) {
        await API.delete(`carrito/vaciar/${id_usuario}`);
        setCarrito([]);
        navigate(`/factura/${res.data.id_factura}`);
      }
    } catch (error) {
      setModalMensaje(error.response?.data?.error || 'Error al procesar el pedido');
      setMostrarModal(true);
    }
  };
const agregarAlCarrito = (producto, cantidad = 1) => {
  // LOG PARA DEPURAR: Abre la consola y mira qué sale aquí
  console.log("Enviando al carrito:", { id_usuario, id_producto: producto?.id_producto, cantidad });

  // VALIDACIÓN PREVENTIVA
  if (!id_usuario) {
    setModalMensaje('Debes iniciar sesión para agregar productos.');
    setMostrarModal(true);
    return;
  }

  if (!producto?.id_producto) {
    console.error("El producto no tiene ID:", producto);
    return;
  }

  API.post(`carrito`, {
    id_usuario: Number(id_usuario), // Forzamos que sea número
    id_producto: Number(producto.id_producto),
    cantidad: Number(cantidad)
  })
    .then(res => {
      setModalMensaje('¡Producto añadido!');
      setMostrarModal(true);
      return API.get(`carrito/${id_usuario}`);
    })
    .then(res => {
      setCarrito(res.data.map(item => ({ ...item, urlImagen: imgUrl(item.imagen) })));
    })
    .catch(err => {
      // Si el servidor responde 400, aquí veremos por qué
      console.error("Error 400 - Detalles:", err.response?.data);
      setModalMensaje(err.response?.data?.message || 'Error en los datos enviados');
      setMostrarModal(true);
    });
};

  const handleVerProducto = (producto) => {
    if (!id_usuario) {
      onOpenLogin ? onOpenLogin() : setMostrarModal(true);
      return;
    }
    setProductoSeleccionado(producto);
  };

  if (loading) return <div className="text-center p-5"><h3>Cargando carrito...</h3></div>;

  if (productoSeleccionado) {
    return (
      <ProductoDetalle
        producto={productoSeleccionado}
        onVolver={() => setProductoSeleccionado(null)}
        onAgregarCarrito={agregarAlCarrito}
        mostrarModal={mostrarModal}
        modalMensaje={modalMensaje}
        onCloseModal={() => setMostrarModal(false)}
        onIrCarrito={() => {
          setProductoSeleccionado(null);
          setMostrarModal(false);
          navigate('/carrito');
        }}
      />
    );
  }

  return (
    <>
      <div className="row">
        <section className="col-md-8">
          <h2 className="text-start mb-4">Tu Carrito de Compras</h2>
          {carrito.length === 0 ? (
            <div className="alert alert-info">El carrito está vacío.</div>
          ) : (
            carrito.map(item => (
              <div key={item.id_carrito} className="row mb-3 align-items-center border-bottom pb-3">
                <div className="col-4 col-md-2">
                  <img src={item.urlImagen} alt={item.nombre} className="img-fluid rounded" style={{ maxHeight: '80px' }} />
                </div>
                <div className="col-8 col-md-4">
                  <p className="mb-0"><strong>{item.nombre}</strong></p>
                  <p className="text-primary fw-bold">${Number(item.precio_final || item.precio).toLocaleString('es-CO')}</p>
                </div>
                <div className="col-6 col-md-3 text-center">Cant: {item.cantidad}</div>
                <div className="col-6 col-md-2 text-end">
                  <button className="btn btn-outline-danger" onClick={() => eliminarProducto(item.id_carrito)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <div className="col-md-4">
          <div className="p-4 border rounded bg-light shadow-sm">
            <h4 className="mb-3">Resumen</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>$ {calcularTotal()}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 border-top pt-2">
              <strong>Total:</strong>
              <strong className="text-primary">$ {calcularTotal()}</strong>
            </div>
            <button className="btn btn-success w-100" onClick={comprar} disabled={carrito.length === 0}>
              REALIZAR PEDIDO
            </button>
          </div>
        </div>
      </div>

      {/* RECOMENDACIONES */}
      <div className="mt-5 p-4 bg-white border rounded">
        <h5 className="mb-4"><FontAwesomeIcon icon={faLightbulb} className="text-warning me-2"/>Recomendados</h5>
        <div className="row">
          {recomendados.map(prod => (
            <div key={prod.id_producto} className="col-md-3 mb-3">
              <div className="card h-100 text-center p-2 shadow-sm">
                <img src={prod.urlImagen} className="card-img-top mx-auto" style={{height:'100px', width:'auto'}} alt={prod.nombre} />
                <div className="card-body">
                  <h6 className="card-title small">{prod.nombre}</h6>
                  <button className="btn btn-sm btn-link" onClick={() => handleVerProducto(prod)}>Ver más</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALES */}
      <ModalConfirmacion show={mostrarModal} mensaje={modalMensaje} onClose={() => setMostrarModal(false)} />
      
      <ModalConfirmarPedido
        show={mostrarModalPedido}
        onClose={() => setMostrarModalPedido(false)}
        onConfirm={confirmarCompra}
        direccion={direccionPedido}
        setDireccion={setDireccionPedido}
      />

      {/* Portal para Modal de Eliminar */}
      {mostrarModalEliminar && ReactDOM.createPortal(
        <div className="modal-overlay-custom">
          <div className="modal-content-custom">
            <h5>¿Eliminar producto?</h5>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-secondary flex-grow-1" onClick={() => setMostrarModalEliminar(false)}>Cancelar</button>
              <button className="btn btn-danger flex-grow-1" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}