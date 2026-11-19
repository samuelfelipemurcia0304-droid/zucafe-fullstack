import { useState } from 'react';
import { motion } from 'framer-motion';
import { LEMA } from '../config';

export default function Hero({ onIr }) {
  // Si pones tu foto en frontend/public/zucafe-bolsa.jpg se muestra aquí
  const [sinFoto, setSinFoto] = useState(false);

  return (
    <section id="inicio" className="hero">
      <div className="hero__interno">
        <motion.div
          className="hero__texto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="hero__etiqueta">Café colombiano de altura · Tena, Cundinamarca</p>
          <h1 className="hero__titulo">Zucafé</h1>
          <p className="hero__lema">{LEMA}</p>
          <p className="hero__descripcion">
            Café cultivado bajo sombra a 1.750 metros de altura. Aroma floral, taza brillante y notas frutales cítricas
            para que cada sorbo sea memorable.
          </p>
          <div className="hero__botones">
            <button className="btn btn--primario" onClick={() => onIr('catalogo')}>
              Ver el catálogo
            </button>
            <button className="btn btn--claro" onClick={() => onIr('pedido')}>
              Hacer mi pedido
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          {sinFoto ? (
            <div className="bolsa" aria-hidden="true">
              <div className="bolsa__vapor">
                <span />
                <span />
                <span />
              </div>
              <div className="bolsa__cuerpo">
                <div className="bolsa__ventana">☕</div>
                <p className="bolsa__marca">Zucafé</p>
                <p className="bolsa__lema">{LEMA}</p>
                <p className="bolsa__peso">Tostión media · 500 g</p>
              </div>
            </div>
          ) : (
            <img
              className="hero__foto"
              src={`${import.meta.env.BASE_URL}zucafe-bolsa.jpg`}
              alt="Bolsa de café Zucafé de 500 g con ventana transparente"
              onError={() => setSinFoto(true)}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
