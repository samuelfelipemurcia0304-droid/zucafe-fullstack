import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { formatearFecha, formatearPrecio, soloDigitos } from '../utils';

const CLAVE_TOKEN = 'zucafe_token';

/* ---------- LOGIN ---------- */
function Login({ onEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const { token } = await api('/api/auth/login', { method: 'POST', body: { usuario, clave } });
      onEntrar(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin__login">
      <h2 className="seccion__titulo">Panel de Zucafé</h2>
      <p className="seccion__intro">Zona privada para gestionar pedidos y catálogo.</p>
      <form className="formulario formulario--claro" onSubmit={enviar}>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Contraseña
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="alerta">{error}</p>}
        <button className="btn btn--primario btn--bloque" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

/* ---------- PEDIDOS ---------- */
function Pedidos({ token, onSalir }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setPedidos(await api('/api/pedidos', { token }));
      setError('');
    } catch (e) {
      if (e.status === 401) onSalir();
      else setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [token, onSalir]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarEstado = async (id, estado) => {
    try {
      const actualizado = await api(`/api/pedidos/${id}`, { method: 'PATCH', body: { estado }, token });
      setPedidos((lista) => lista.map((p) => (p._id === id ? actualizado : p)));
    } catch (e) {
      setError(e.message);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este pedido?')) return;
    try {
      await api(`/api/pedidos/${id}`, { method: 'DELETE', token });
      setPedidos((lista) => lista.filter((p) => p._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  if (cargando) return <p className="estado">Cargando pedidos…</p>;

  return (
    <div>
      <div className="admin__barra">
        <h3>Pedidos y mensajes ({pedidos.length})</h3>
        <button className="btn btn--claro btn--chico" onClick={cargar}>
          ↻ Actualizar
        </button>
      </div>
      {error && <p className="alerta">{error}</p>}
      {pedidos.length === 0 && <p className="estado">Aún no hay pedidos. ¡Pronto llegarán! ☕</p>}

      <div className="admin__lista">
        {pedidos.map((p) => (
          <article key={p._id} className={`pedido pedido--${p.estado}`}>
            <div className="pedido__cabecera">
              <strong>{p.nombre}</strong>
              <span className="pedido__fecha">{formatearFecha(p.createdAt)}</span>
            </div>
            <p>
              <strong>{p.cantidad} ×</strong> {p.producto} · {p.presentacion}
            </p>
            <p>📍 {p.lugarEntrega || 'Entrega por coordinar'}</p>
            <p>
              💬{' '}
              <a href={`https://wa.me/${soloDigitos(p.whatsapp)}`} target="_blank" rel="noreferrer">
                {p.whatsapp}
              </a>
            </p>
            <div className="pedido__acciones">
              <select value={p.estado} onChange={(e) => cambiarEstado(p._id, e.target.value)} aria-label="Estado del pedido">
                <option value="nuevo">🆕 Nuevo</option>
                <option value="contactado">📞 Contactado</option>
                <option value="entregado">✅ Entregado</option>
              </select>
              <button className="btn btn--peligro btn--chico" onClick={() => eliminar(p._id)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------- CATÁLOGO (admin) ---------- */
function ProductoFila({ producto, token, onGuardado, onEliminado, onError }) {
  const [pres, setPres] = useState(producto.presentaciones.map((x) => ({ ...x })));
  const [guardando, setGuardando] = useState(false);

  const cambiarPrecio = (i, valor) =>
    setPres((lista) => lista.map((x, idx) => (idx === i ? { ...x, precio: valor } : x)));

  const guardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await api(`/api/productos/${producto._id}`, {
        method: 'PUT',
        body: { presentaciones: pres.map((x) => ({ etiqueta: x.etiqueta, precio: Number(x.precio) })) },
        token,
      });
      onGuardado(actualizado);
    } catch (e) {
      onError(e);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) return;
    try {
      await api(`/api/productos/${producto._id}`, { method: 'DELETE', token });
      onEliminado(producto._id);
    } catch (e) {
      onError(e);
    }
  };

  return (
    <article className="pedido">
      <div className="pedido__cabecera">
        <strong>{producto.nombre}</strong>
        <span className="pedido__fecha">{producto.categoria}</span>
      </div>
      <div className="admin__precios">
        {pres.map((x, i) => (
          <label key={x.etiqueta}>
            {x.etiqueta} <small>({formatearPrecio(Number(x.precio) || 0)})</small>
            <input type="number" min="0" step="500" value={x.precio} onChange={(e) => cambiarPrecio(i, e.target.value)} />
          </label>
        ))}
      </div>
      <div className="pedido__acciones">
        <button className="btn btn--primario btn--chico" onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar precios'}
        </button>
        <button className="btn btn--peligro btn--chico" onClick={eliminar}>
          Eliminar
        </button>
      </div>
    </article>
  );
}

function Productos({ token, onSalir, onProductosCambian }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: 'tradicional', descripcion: '', media: '', libra: '' });

  const manejarError = useCallback(
    (e) => {
      if (e.status === 401) onSalir();
      else setError(e.message);
    },
    [onSalir]
  );

  const actualizarTodo = useCallback(
    (lista) => {
      setProductos(lista);
      onProductosCambian(lista);
    },
    [onProductosCambian]
  );

  useEffect(() => {
    api('/api/productos')
      .then(setProductos)
      .catch(manejarError)
      .finally(() => setCargando(false));
  }, [manejarError]);

  const agregar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const creado = await api('/api/productos', {
        method: 'POST',
        token,
        body: {
          nombre: nuevo.nombre,
          categoria: nuevo.categoria,
          descripcion: nuevo.descripcion,
          presentaciones: [
            { etiqueta: '1/2 libra', precio: Number(nuevo.media) },
            { etiqueta: '1 libra', precio: Number(nuevo.libra) },
          ],
        },
      });
      actualizarTodo([...productos, creado]);
      setNuevo({ nombre: '', categoria: 'tradicional', descripcion: '', media: '', libra: '' });
    } catch (err) {
      manejarError(err);
    }
  };

  const cambiarNuevo = (e) => setNuevo((n) => ({ ...n, [e.target.name]: e.target.value }));

  if (cargando) return <p className="estado">Cargando catálogo…</p>;

  return (
    <div>
      <h3>Productos del catálogo ({productos.length})</h3>
      {error && <p className="alerta">{error}</p>}

      <div className="admin__lista">
        {productos.map((p) => (
          <ProductoFila
            key={p._id}
            producto={p}
            token={token}
            onError={manejarError}
            onGuardado={(act) => actualizarTodo(productos.map((x) => (x._id === act._id ? act : x)))}
            onEliminado={(id) => actualizarTodo(productos.filter((x) => x._id !== id))}
          />
        ))}
      </div>

      <h3 className="admin__subtitulo">➕ Agregar producto</h3>
      <form className="formulario formulario--claro" onSubmit={agregar}>
        <label>
          Nombre
          <input name="nombre" value={nuevo.nombre} onChange={cambiarNuevo} required maxLength={120} />
        </label>
        <label>
          Categoría
          <select name="categoria" value={nuevo.categoria} onChange={cambiarNuevo}>
            <option value="tradicional">Tradicional</option>
            <option value="especialidad">Especialidad</option>
          </select>
        </label>
        <label>
          Descripción
          <textarea name="descripcion" value={nuevo.descripcion} onChange={cambiarNuevo} rows={3} maxLength={1000} />
        </label>
        <div className="formulario__fila">
          <label>
            Precio 1/2 libra
            <input name="media" type="number" min="0" step="500" value={nuevo.media} onChange={cambiarNuevo} required />
          </label>
          <label>
            Precio 1 libra
            <input name="libra" type="number" min="0" step="500" value={nuevo.libra} onChange={cambiarNuevo} required />
          </label>
        </div>
        <button className="btn btn--primario btn--bloque">Agregar al catálogo</button>
      </form>
    </div>
  );
}

/* ---------- PANEL ---------- */
export default function PanelAdmin({ onProductosCambian }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(CLAVE_TOKEN) || '');
  const [pestana, setPestana] = useState('pedidos');

  const entrar = (t) => {
    sessionStorage.setItem(CLAVE_TOKEN, t);
    setToken(t);
  };

  const salir = useCallback(() => {
    sessionStorage.removeItem(CLAVE_TOKEN);
    setToken('');
  }, []);

  return (
    <section className="seccion seccion--admin">
      <div className="contenedor contenedor--medio">
        {!token ? (
          <Login onEntrar={entrar} />
        ) : (
          <>
            <div className="admin__encabezado">
              <h2 className="seccion__titulo">Panel de gestión</h2>
              <button className="btn btn--claro btn--chico" onClick={salir}>
                Cerrar sesión
              </button>
            </div>
            <div className="admin__pestanas" role="tablist">
              <button role="tab" aria-selected={pestana === 'pedidos'} className={pestana === 'pedidos' ? 'activa' : ''} onClick={() => setPestana('pedidos')}>
                📋 Pedidos
              </button>
              <button role="tab" aria-selected={pestana === 'productos'} className={pestana === 'productos' ? 'activa' : ''} onClick={() => setPestana('productos')}>
                ☕ Catálogo
              </button>
            </div>
            {pestana === 'pedidos' ? (
              <Pedidos token={token} onSalir={salir} />
            ) : (
              <Productos token={token} onSalir={salir} onProductosCambian={onProductosCambian} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
