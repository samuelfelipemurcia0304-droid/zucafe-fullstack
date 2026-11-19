import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Origen from './components/Origen.jsx';
import Catalogo from './components/Catalogo.jsx';
import FormularioPedido from './components/FormularioPedido.jsx';
import ChatbotIA from './components/ChatbotIA.jsx';
import PanelAdmin from './components/PanelAdmin.jsx';
import { api } from './api';
import { productosBase } from './data/productosBase';
import { LEMA, WHATSAPP_NEGOCIO } from './config';

export default function App() {
  const [vista, setVista] = useState('tienda'); // 'tienda' | 'admin'
  const [productos, setProductos] = useState(productosBase);
  const [cargando, setCargando] = useState(true);
  const [productoElegido, setProductoElegido] = useState(null);

  useEffect(() => {
    api('/api/productos')
      .then((lista) => {
        if (Array.isArray(lista) && lista.length) setProductos(lista);
      })
      .catch(() => {
        /* si el servidor no responde, se queda el catálogo de respaldo */
      })
      .finally(() => setCargando(false));
  }, []);

  const ir = useCallback((id) => {
    if (id === 'admin') {
      setVista('admin');
      window.scrollTo({ top: 0 });
      return;
    }
    setVista('tienda');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 60);
  }, []);

  const pedirProducto = (producto) => {
    setProductoElegido(producto);
    ir('pedido');
  };

  return (
    <>
      <Navbar vista={vista} onIr={ir} />
      <main>
        {vista === 'admin' ? (
          <PanelAdmin onProductosCambian={setProductos} />
        ) : (
          <>
            <Hero onIr={ir} />
            <Origen />
            <Catalogo productos={productos} cargando={cargando} onPedir={pedirProducto} />
            <FormularioPedido productos={productos} productoElegido={productoElegido} />
          </>
        )}
      </main>

      <footer className="footer">
        <p className="footer__marca">Zucafé</p>
        <p className="footer__lema">{LEMA}</p>
        <p className="footer__nota">
          Café colombiano de altura ·{' '}
          <a href={`https://wa.me/${WHATSAPP_NEGOCIO}`} target="_blank" rel="noreferrer">
            Escríbenos por WhatsApp
          </a>
        </p>
        <p className="footer__nota">© {new Date().getFullYear()} Zucafé. Hecho con ♥ y mucho café.</p>
      </footer>

      {vista === 'tienda' && <ChatbotIA />}
    </>
  );
}
