import { motion } from 'framer-motion';
import { formatearPrecio } from '../utils';

export default function Catalogo({ productos, cargando, onPedir }) {
  return (
    <section id="catalogo" className="seccion">
      <div className="contenedor">
        <p className="seccion__script">escoge tu favorito</p>
        <h2 className="seccion__titulo">Nuestro catálogo</h2>
        <p className="seccion__intro">
          Café tostado y molido, en la presentación que prefieras. Tostión media o media alta, molido fino o medio.
        </p>

        {cargando && <p className="estado">Preparando el café… ☕</p>}

        <div className="catalogo__rejilla">
          {productos.map((p, i) => (
            <motion.article
              key={p._id}
              className={`producto producto--${p.categoria}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
            >
              <span className="producto__insignia">
                {p.categoria === 'especialidad' ? '✨ Especialidad' : '☕ Tradicional'}
              </span>
              <h3 className="producto__nombre">{p.nombre}</h3>
              <p className="producto__descripcion">{p.descripcion}</p>

              {(p.origen || p.variedad || p.cultivo || p.perfil || p.tostion || p.molido) && (
                <dl className="producto__ficha">
                  {p.origen && (
                    <>
                      <dt>Origen</dt>
                      <dd>{p.origen}</dd>
                    </>
                  )}
                  {p.variedad && (
                    <>
                      <dt>Variedad</dt>
                      <dd>{p.variedad}</dd>
                    </>
                  )}
                  {p.cultivo && (
                    <>
                      <dt>Cultivo</dt>
                      <dd>{p.cultivo}</dd>
                    </>
                  )}
                  {p.perfil && (
                    <>
                      <dt>Perfil</dt>
                      <dd>{p.perfil}</dd>
                    </>
                  )}
                  {p.tostion && (
                    <>
                      <dt>Tostión</dt>
                      <dd>{p.tostion}</dd>
                    </>
                  )}
                  {p.molido && (
                    <>
                      <dt>Molido</dt>
                      <dd>{p.molido}</dd>
                    </>
                  )}
                </dl>
              )}

              <ul className="producto__precios">
                {p.presentaciones.map((pr) => (
                  <li key={pr.etiqueta}>
                    <span>{pr.etiqueta}</span>
                    <strong>{formatearPrecio(pr.precio)}</strong>
                  </li>
                ))}
              </ul>

              <button className="btn btn--primario btn--bloque" onClick={() => onPedir(p)}>
                Pedir este café
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
