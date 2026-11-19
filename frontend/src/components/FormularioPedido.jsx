import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { WHATSAPP_NEGOCIO } from '../config';

const PRESENTACIONES = ['1/2 libra', '1 libra', '1 kilo'];

const vacio = (producto = '') => ({
  nombre: '',
  whatsapp: '',
  producto,
  presentacion: '1 libra',
  cantidad: 1,
  lugarEntrega: '',
});

export default function FormularioPedido({ productos, productoElegido }) {
  const [form, setForm] = useState(() => vacio(productos[0]?.nombre));
  const [estado, setEstado] = useState('idle'); // idle | enviando | ok | error
  const [mensaje, setMensaje] = useState('');
  const [resumen, setResumen] = useState(null);

  // Si el cliente tocó "Pedir este café", se preselecciona
  useEffect(() => {
    if (productoElegido) setForm((f) => ({ ...f, producto: productoElegido.nombre }));
  }, [productoElegido]);

  // Si aún no hay producto elegido y llegan los productos, usa el primero
  useEffect(() => {
    setForm((f) => (f.producto ? f : { ...f, producto: productos[0]?.nombre || '' }));
  }, [productos]);

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setEstado('enviando');
    setMensaje('');
    try {
      await api('/api/pedidos', { method: 'POST', body: { ...form, cantidad: Number(form.cantidad) } });
      setResumen(form);
      setEstado('ok');
      setForm(vacio(form.producto));
    } catch (err) {
      setEstado('error');
      setMensaje(err.message);
    }
  };

  const textoWhatsApp = (d) =>
    encodeURIComponent(
      `Hola Zucafé ☕, soy ${d.nombre}. Quiero pedir ${d.cantidad} x ${d.producto} (${d.presentacion}).` +
        (d.lugarEntrega ? ` Entrega en: ${d.lugarEntrega}.` : '')
    );

  return (
    <section id="pedido" className="seccion seccion--oscura">
      <div className="contenedor contenedor--angosto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <p className="seccion__script seccion__script--claro">escríbenos y te lo llevamos</p>
          <h2 className="seccion__titulo">Haz tu pedido</h2>

          {estado === 'ok' && resumen ? (
            <div className="exito">
              <p className="exito__icono">🎉</p>
              <h3>¡Pedido recibido, {resumen.nombre}!</h3>
              <p>Te escribiremos por WhatsApp para confirmar tu café y la entrega.</p>
              <a
                className="btn btn--primario"
                href={`https://wa.me/${WHATSAPP_NEGOCIO}?text=${textoWhatsApp(resumen)}`}
                target="_blank"
                rel="noreferrer"
              >
                Escribir ya por WhatsApp
              </a>
              <button className="btn btn--claro" onClick={() => setEstado('idle')}>
                Hacer otro pedido
              </button>
            </div>
          ) : (
            <form className="formulario" onSubmit={enviar}>
              <label>
                Nombre
                <input name="nombre" value={form.nombre} onChange={cambiar} placeholder="Tu nombre" required maxLength={80} />
              </label>

              <label>
                WhatsApp
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={cambiar}
                  placeholder="Ej: 300 123 4567"
                  inputMode="tel"
                  required
                  maxLength={20}
                />
              </label>

              <label>
                Producto
                <select name="producto" value={form.producto} onChange={cambiar} required>
                  {productos.map((p) => (
                    <option key={p._id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="formulario__fila">
                <label>
                  Presentación
                  <select name="presentacion" value={form.presentacion} onChange={cambiar} required>
                    {PRESENTACIONES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Cantidad
                  <input name="cantidad" type="number" min="1" max="100" value={form.cantidad} onChange={cambiar} required />
                </label>
              </div>

              <label>
                Lugar de entrega <span className="opcional">(opcional)</span>
                <input
                  name="lugarEntrega"
                  value={form.lugarEntrega}
                  onChange={cambiar}
                  placeholder="Barrio, ciudad… o coordinamos por WhatsApp"
                  maxLength={200}
                />
              </label>

              {estado === 'error' && <p className="alerta">{mensaje}</p>}

              <button className="btn btn--primario btn--bloque" type="submit" disabled={estado === 'enviando'}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviar pedido'}
              </button>
              <p className="formulario__nota">
                ¿Prefieres hablar directo?{' '}
                <a href={`https://wa.me/${WHATSAPP_NEGOCIO}`} target="_blank" rel="noreferrer">
                  Escríbenos por WhatsApp
                </a>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
