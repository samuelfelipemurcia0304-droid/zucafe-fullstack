import { useState } from 'react';

const ENLACES = [
  { id: 'inicio', texto: 'Inicio' },
  { id: 'origen', texto: 'Origen' },
  { id: 'catalogo', texto: 'Catálogo' },
  { id: 'pedido', texto: 'Pedido' },
];

export default function Navbar({ vista, onIr }) {
  const [abierto, setAbierto] = useState(false);

  const clic = (id) => {
    setAbierto(false);
    onIr(id);
  };

  return (
    <header className="navbar">
      <div className="navbar__interno">
        <button className="navbar__logo" onClick={() => clic('inicio')} aria-label="Ir al inicio">
          <span className="navbar__taza">☕</span> Zucafé
        </button>

        <button
          className="navbar__menu-btn"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label="Abrir menú"
        >
          {abierto ? '✕' : '☰'}
        </button>

        <nav className={`navbar__enlaces ${abierto ? 'navbar__enlaces--abierto' : ''}`}>
          {ENLACES.map((e) => (
            <button key={e.id} className="navbar__enlace" onClick={() => clic(e.id)}>
              {e.texto}
            </button>
          ))}
          <button
            className={`navbar__enlace navbar__enlace--admin ${vista === 'admin' ? 'activo' : ''}`}
            onClick={() => clic('admin')}
          >
            🔒 Admin
          </button>
        </nav>
      </div>
    </header>
  );
}
