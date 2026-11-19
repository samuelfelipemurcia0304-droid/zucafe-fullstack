require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sembrarProductos } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: permite que el frontend (GitHub Pages) llame a esta API
const origenes = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(cors({ origin: origenes.includes('*') ? true : origenes }));
app.use(express.json({ limit: '50kb' }));

app.get('/', (req, res) => {
  res.json({ ok: true, mensaje: 'API de Zucafé funcionando ☕' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/chat', require('./routes/chat'));

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function iniciar() {
  if (!process.env.MONGODB_URI) {
    console.error('Falta MONGODB_URI en el archivo .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');
  await sembrarProductos();
  app.listen(PORT, () => console.log(`Servidor de Zucafé en http://localhost:${PORT}`));
}

iniciar().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
});
