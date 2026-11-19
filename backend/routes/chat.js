const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const Producto = require('../models/Producto');

// Datos del negocio (se configuran en el .env)
const HORARIO = process.env.NEGOCIO_HORARIO || 'Lunes a sábado de 8:00 a. m. a 6:00 p. m.';
const UBICACION =
  process.env.NEGOCIO_UBICACION || 'Cundinamarca, Colombia. Hacemos entregas y envíos; escríbenos por WhatsApp para coordinar.';
const WHATSAPP = process.env.NEGOCIO_WHATSAPP || '';

const limitarChat = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Estás escribiendo muy rápido. Espera un momento ☕' },
});

const pesos = (n) => '$' + Number(n).toLocaleString('es-CO');

const normalizar = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const tiene = (t, palabras) => palabras.some((p) => t.includes(p));

function textoPrecios(productos) {
  if (!productos.length) return 'Por ahora no tengo los precios a la mano. Escríbenos por WhatsApp y te los confirmamos.';
  const lineas = productos.map(
    (p) => `• ${p.nombre}: ` + p.presentaciones.map((x) => `${x.etiqueta} ${pesos(x.precio)}`).join(' · ')
  );
  return `Estos son nuestros precios ☕\n${lineas.join('\n')}`;
}

// Chatbot por reglas: responde horarios, precios, ubicación y más
function responderPorReglas(mensaje, productos) {
  const t = normalizar(mensaje);
  const especialidad = productos.find((p) => p.categoria === 'especialidad');

  if (tiene(t, ['gracias', 'chao', 'adios', 'hasta luego'])) {
    return '¡Con mucho gusto! Que disfrutes tu café ☕ Aquí estaré para lo que necesites.';
  }
  if (tiene(t, ['precio', 'cuesta', 'cuanto', 'valor', 'tarifa', 'costo'])) return textoPrecios(productos);
  if (tiene(t, ['horario', 'hora', 'abren', 'abierto', 'atienden', 'atencion', 'cierran'])) {
    return `Nuestro horario de atención es: ${HORARIO}`;
  }
  if (tiene(t, ['ubicacion', 'ubicados', 'donde', 'direccion', 'envio', 'domicilio', 'entrega', 'llegan'])) {
    return `📍 ${UBICACION}\nEn el formulario de pedido puedes dejar tu lugar de entrega (es opcional) o coordinarlo con nosotros por WhatsApp.`;
  }
  if (tiene(t, ['pedido', 'pedir', 'comprar', 'ordenar', 'quiero', 'encargar'])) {
    return 'Hacer tu pedido es fácil: baja a la sección "Haz tu pedido", llena tu nombre, WhatsApp, producto, cantidad y presentación (1/2 libra, 1 libra o 1 kilo). Te escribimos para confirmar 🙌';
  }
  if (tiene(t, ['origen', 'tena', 'altura', 'altitud', 'caturra', 'sombra', 'sabor', 'aroma', 'nota', 'especialidad', 'perfil', 'cultivo'])) {
    if (especialidad) {
      return `Nuestro café de especialidad viene de ${especialidad.origen || 'Cundinamarca'}. Variedad ${especialidad.variedad || 'Caturra'}, cultivo ${(especialidad.cultivo || 'agroforestal bajo sombra').toLowerCase()}. Perfil: ${especialidad.perfil || 'floral y cítrico'}. ¡Una taza brillante y memorable! 🌸🍊`;
    }
  }
  if (tiene(t, ['molido', 'grano', 'tostion', 'tostado', 'moler', 'fino', 'medio'])) {
    return 'Tenemos tostión media y media alta, y lo puedes pedir molido fino o medio. Si lo prefieres en grano para moler en casa, cuéntanos en tu pedido o por WhatsApp.';
  }
  if (tiene(t, ['whatsapp', 'contacto', 'telefono', 'celular', 'llamar', 'escribir'])) {
    return WHATSAPP
      ? `Escríbenos por WhatsApp al +${WHATSAPP} y te atendemos con gusto 💬`
      : 'Puedes dejarnos tus datos en el formulario de pedido y te escribimos por WhatsApp 💬';
  }
  if (tiene(t, ['hola', 'buenas', 'buenos', 'hey', 'saludos', 'que tal'])) {
    return '¡Hola! Bienvenido a Zucafé, "un sabor para no olvidar" ☕ Puedo contarte sobre precios, horarios, ubicación, nuestro café de especialidad o ayudarte con tu pedido. ¿Qué quieres saber?';
  }
  return 'Todavía estoy aprendiendo ☕ Puedo ayudarte con precios, horarios, ubicación, el origen de nuestro café o cómo hacer tu pedido. También puedes escribirnos por WhatsApp.';
}

// Opcional: respuestas con IA real (Claude) si hay ANTHROPIC_API_KEY
async function responderConIA(mensaje, historial, productos) {
  const catalogo = productos
    .map(
      (p) =>
        `- ${p.nombre} (${p.categoria}): ` +
        p.presentaciones.map((x) => `${x.etiqueta} ${pesos(x.precio)}`).join(', ') +
        (p.origen ? `. Origen: ${p.origen}. Variedad: ${p.variedad}. Cultivo: ${p.cultivo}. Perfil: ${p.perfil}.` : '')
    )
    .join('\n');

  const system = `Eres el asistente virtual de Zucafé, una marca colombiana de café ("Un sabor para no olvidar"). Respondes en español, con tono cálido, breve (máximo 4 frases) y usando a veces un emoji de café.
Solo respondes sobre Zucafé: precios, horarios, ubicación, productos, cómo pedir. Si no sabes algo, invita a escribir por WhatsApp. No inventes datos.

CATÁLOGO:
${catalogo}

HORARIO: ${HORARIO}
UBICACIÓN / ENTREGAS: ${UBICACION}
WHATSAPP: ${WHATSAPP ? '+' + WHATSAPP : 'disponible en la página'}
CÓMO PEDIR: formulario "Haz tu pedido" (nombre, WhatsApp, producto, cantidad, presentación 1/2 libra, 1 libra o 1 kilo, lugar de entrega opcional).`;

  // Construye el historial con roles alternados que empiece con "user"
  const mensajes = [];
  const agregar = (role, content) => {
    const ultimo = mensajes[mensajes.length - 1];
    if (ultimo && ultimo.role === role) ultimo.content += '\n' + content;
    else mensajes.push({ role, content });
  };
  for (const h of historial) {
    const role = h.rol === 'user' ? 'user' : 'assistant';
    if (!mensajes.length && role === 'assistant') continue;
    agregar(role, String(h.texto || '').slice(0, 500));
  }
  agregar('user', mensaje);

  const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
      max_tokens: 400,
      system,
      messages: mensajes,
    }),
  });
  if (!respuesta.ok) throw new Error(`IA respondió ${respuesta.status}`);
  const data = await respuesta.json();
  const textoIA = data.content?.find((b) => b.type === 'text')?.text;
  if (!textoIA) throw new Error('Respuesta vacía de la IA');
  return textoIA;
}

router.post('/', limitarChat, async (req, res, next) => {
  try {
    const mensaje = String(req.body.mensaje || '').trim().slice(0, 500);
    if (!mensaje) return res.status(400).json({ error: 'Escribe un mensaje' });

    const historial = Array.isArray(req.body.historial) ? req.body.historial.slice(-6) : [];
    const productos = await Producto.find().sort({ createdAt: 1 }).lean();

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        return res.json({ respuesta: await responderConIA(mensaje, historial, productos), modo: 'ia' });
      } catch (e) {
        console.error('Chatbot IA falló, usando reglas:', e.message);
      }
    }
    res.json({ respuesta: responderPorReglas(mensaje, productos), modo: 'reglas' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
