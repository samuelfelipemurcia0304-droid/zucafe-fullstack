const router = require('express').Router();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const verificarAdmin = require('../middleware/auth');

const CAMPOS_TEXTO = ['nombre', 'categoria', 'descripcion', 'origen', 'variedad', 'cultivo', 'perfil', 'tostion', 'molido', 'imagen'];

function limpiarPresentaciones(lista) {
  if (!Array.isArray(lista)) return null;
  return lista
    .map((p) => ({ etiqueta: String(p.etiqueta || '').trim().slice(0, 40), precio: Number(p.precio) }))
    .filter((p) => p.etiqueta && Number.isFinite(p.precio) && p.precio >= 0);
}

function armarDatos(body = {}) {
  const datos = {};
  for (const campo of CAMPOS_TEXTO) {
    if (typeof body[campo] === 'string') datos[campo] = body[campo].trim();
  }
  const presentaciones = limpiarPresentaciones(body.presentaciones);
  if (presentaciones) datos.presentaciones = presentaciones;
  return datos;
}

function manejarError(e, res, next) {
  if (e.name === 'ValidationError') return res.status(400).json({ error: e.message });
  next(e);
}

// PÚBLICO: ver el catálogo
router.get('/', async (req, res, next) => {
  try {
    res.json(await Producto.find().sort({ createdAt: 1 }));
  } catch (e) {
    next(e);
  }
});

// ADMIN: crear producto
router.post('/', verificarAdmin, async (req, res, next) => {
  try {
    const datos = armarDatos(req.body);
    if (!datos.nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!datos.presentaciones || datos.presentaciones.length === 0) {
      return res.status(400).json({ error: 'Agrega al menos una presentación con su precio' });
    }
    res.status(201).json(await Producto.create(datos));
  } catch (e) {
    manejarError(e, res, next);
  }
});

// ADMIN: editar producto (por ejemplo, cambiar precios)
router.put('/:id', verificarAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const producto = await Producto.findByIdAndUpdate(req.params.id, armarDatos(req.body), {
      new: true,
      runValidators: true,
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (e) {
    manejarError(e, res, next);
  }
});

// ADMIN: eliminar producto
router.delete('/:id', verificarAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
