import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faFolderTree,
  faBox,
  faPercent,
  faTruck,
  faGear,
  faUser,
  faRightFromBracket,
  faChartLine,
  faChevronDown,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

export default function SidebarAdmin() {
  const [openConfig, setOpenConfig] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Custom styles for a premium look
  const sidebarStyle = {
    height: "100vh",
    width: "280px",
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "#1a1c23",
    color: "#fff",
    padding: "2rem 1.5rem",
    overflowY: "auto",
    zIndex: 1040,
    transition: "all 0.3s ease",
    borderRight: "1px solid rgba(255,255,255,0.05)"
  };

  const navLinkStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: active ? "#fff" : "rgba(255,255,255,0.6)",
    backgroundColor: active ? "rgba(52, 131, 250, 0.15)" : "transparent",
    textDecoration: "none",
    fontWeight: active ? "600" : "500",
    transition: "all 0.2s ease",
    marginBottom: "8px",
    borderLeft: active ? "3px solid #3483fa" : "3px solid transparent",
  });

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    window.location.replace('/');
  };

  const navItems = [
    { name: "Estadísticas", path: "/admin-estadisticas", icon: faChartLine },
    { name: "Categorías", path: "/admin-categorias", icon: faFolder },
    { name: "Subcategorías", path: "/admin-subcategorias", icon: faFolderTree },
    { name: "Productos", path: "/admin-productos", icon: faBox },
    { name: "Descuentos", path: "/admin-descuento", icon: faPercent },
    { name: "Pedidos", path: "/admin-pedidos", icon: faTruck },
  ];

  return (
    <>
      <div className="sidebar d-none d-md-block" style={sidebarStyle}>
        <div className="mb-5 px-3">
          <h5 className="fw-bold m-0" style={{ letterSpacing: '1px', color: '#fff' }}>
            Dazzart <span style={{ color: '#3483fa' }}>Admin</span>
          </h5>
          <small style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", textTransform: "uppercase" }}>
            Management Eccomerce
          </small>
        </div>

        <nav className="nav flex-column">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={navLinkStyle(isActive(item.path))}
              className="sidebar-link"
            >
              <FontAwesomeIcon icon={item.icon} style={{ width: "20px" }} />
              {item.name}
            </Link>
          ))}

          <div className="mt-4">
            <button
              onClick={() => setOpenConfig(!openConfig)}
              style={{
                ...navLinkStyle(false),
                width: "100%",
                background: "transparent",
                border: "none",
                justifyContent: "space-between"
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faGear} style={{ width: "20px" }} />
                <span>Configuración</span>
              </div>
              <FontAwesomeIcon icon={openConfig ? faChevronDown : faChevronRight} style={{ fontSize: "0.8rem" }} />
            </button>

            {openConfig && (
              <div className="ps-4 mt-2 slide-down">
                <Link
                  to="/admin-usuarios"
                  style={navLinkStyle(isActive("/admin-usuarios"))}
                >
                  <FontAwesomeIcon icon={faUser} style={{ width: "16px" }} />
                  Clientes
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    ...navLinkStyle(false),
                    width: "100%",
                    background: "transparent",
                    color: "#ff7675",
                    border: "none"
                  }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} style={{ width: "16px" }} />
                  Salir
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Botón Móvil y Offcanvas a simplificar también si es necesario, 
          pero lo principal es el layout de escritorio para el sentimiento Pro */}
    </>
  );
}