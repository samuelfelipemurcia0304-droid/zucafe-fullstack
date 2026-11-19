import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api';

const SUGERENCIAS = ['¿Qué precios tienen?', '¿Cuál es el horario?', '¿Dónde están ubicados?', '¿Cómo hago un pedido?'];

const BIENVENIDA = {
  rol: 'bot',
  texto: '¡Hola! Soy el asistente de Zucafé ☕ Te ayudo con precios, horarios, ubicación y pedidos. ¿Qué quieres saber?',
};

export default function ChatbotIA() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([BIENVENIDA]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes, abierto, cargando]);

  const enviar = async (texto) => {
    const t = texto.trim();
    if (!t || cargando) return;
    const conUsuario = [...mensajes, { rol: 'user', texto: t }];
    setMensajes(conUsuario);
    setInput('');
    setCargando(true);
    try {
      const data = await api('/api/chat', {
        method: 'POST',
        body: { mensaje: t, historial: conUsuario.slice(-7, -1) },
      });
      setMensajes((m) => [...m, { rol: 'bot', texto: data.respuesta }]);
    } catch {
      setMensajes((m) => [
        ...m,
        { rol: 'bot', texto: 'Ups, no pude conectarme en este momento ☕ Intenta de nuevo en unos segundos o escríbenos por WhatsApp.' },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const alEnviar = (e) => {
    e.preventDefault();
    enviar(input);
  };

  return (
    <div className="chat">
      <AnimatePresence>
        {abierto && (
          <motion.div
            className="chat__panel"
            role="dialog"
            aria-label="Asistente de Zucafé"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chat__cabecera">
              <span>☕ Asistente Zucafé</span>
              <button onClick={() => setAbierto(false)} aria-label="Cerrar chat">
                ✕
              </button>
            </div>

            <div className="chat__mensajes">
              {mensajes.map((m, i) => (
                <p key={i} className={`chat__burbuja chat__burbuja--${m.rol}`}>
                  {m.texto}
                </p>
              ))}
              {cargando && <p className="chat__burbuja chat__burbuja--bot chat__escribiendo">Escribiendo…</p>}
              <div ref={finRef} />
            </div>

            {mensajes.length <= 1 && (
              <div className="chat__sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s} onClick={() => enviar(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form className="chat__form" onSubmit={alEnviar}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta…"
                maxLength={500}
                aria-label="Tu mensaje"
              />
              <button type="submit" disabled={cargando || !input.trim()}>
                Enviar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chat__boton"
        onClick={() => setAbierto((a) => !a)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente'}
      >
        {abierto ? '✕' : '💬'}
      </motion.button>
    </div>
  );
}
