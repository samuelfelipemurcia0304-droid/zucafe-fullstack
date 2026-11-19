import { motion } from 'framer-motion';

const DATOS = [
  { icono: '⛰️', titulo: '1.750 m.s.n.m.', texto: 'Cultivado en las alturas de Tena, Cundinamarca, donde el clima fresco madura el grano despacio.' },
  { icono: '🌿', titulo: 'Bajo sombra', texto: 'Cultivo agroforestal que cuida el suelo, las aves y la calidad de la taza.' },
  { icono: '🌸', titulo: 'Aroma floral', texto: 'Un perfil intenso y fresco que se siente desde que abres la bolsa.' },
  { icono: '🍊', titulo: 'Notas cítricas', texto: 'Sabor frutal, dulce y brillante, de la variedad Caturra.' },
];

export default function Origen() {
  return (
    <section id="origen" className="seccion seccion--kraft">
      <div className="contenedor">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="seccion__script">de la montaña a tu taza</p>
          <h2 className="seccion__titulo">Un café con historia</h2>
          <p className="seccion__intro">
            Zucafé nace en el campo cundinamarqués. Empacamos nuestro café en bolsa kraft con ventana frontal para que
            veas el grano antes de moler y lo disfrutes con todo su aroma.
          </p>
        </motion.div>

        <div className="origen__rejilla">
          {DATOS.map((d, i) => (
            <motion.article
              key={d.titulo}
              className="origen__tarjeta"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="origen__icono" aria-hidden="true">
                {d.icono}
              </span>
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
