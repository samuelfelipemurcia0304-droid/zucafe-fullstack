const router = require('express').Router();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Pedido = require('../models/Pedido');
const verificarAdmin = require('../middleware/auth');

// Evita spam: máximo 10 pedidos cada 15 minutos por IP
const limitarPedidos = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado muchos pedidos seguidos. Intenta de nuevo en unos minutos.' },
});

const texto = (valor, max) => String(valor ?? '').trim().slice(0, max);

// PÚBLICO: el cliente envía su pedido / contacto
router.post('/', limitarPedidos, async (req, res, next) => {
  try {
    const nombre = texto(req.body.nombre, 80);
    const whatsapp = texto(req.body.whatsapp, 20).replace(/[^\d+]/g, '');
    const producto = texto(req.body.producto, 120);
    const presentacion = texto(req.body.presentacion, 40);
    const cantidad = Number.parseInt(req.body.cantidad, 10);
    const lugarEntrega = texto(req.body.lugarEntrega, 200); // opcional

    if (!nombre) return res.status(400).json({ error: 'Escribe tu nombre' });
    if (whatsapp.replace(/\D/g, '').length < 7) return res.status(400).json({ error: 'Escribe un número de WhatsApp válido' });
    if (!producto) return res.status(400).json({ error: 'Elige un producto' });
    if (!presentacion) return res.status(400).json({ error: 'Elige la presentación' });
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 100) {
      return res.status(400).json({ error: 'La cantidad debe ser un número entre 1 y 100' });
    }

    const pedido = await Pedido.create({ nombre, whatsapp, producto, presentacion, cantidad, lugarEntrega });
    res.status(201).json({ ok: true, id: pedido._id });
  } catch (e) {
    next(e);
  }
});

// ADMIN: ver la lista de pedidos
router.get('/', verificarAdmin, async (req, res, next) => {
  try {
    res.json(await Pedido.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

// ADMIN: cambiar el estado (nuevo, contactado, entregado)
router.patch('/:id', verificarAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    if (!['nuevo', 'contactado', 'entregado'].includes(req.body.estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { new: true });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (e) {
    next(e);
  }
});

// ADMIN: eliminar un pedido
router.delete('/:id', verificarAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
