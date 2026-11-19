const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Máximo 10 intentos de login cada 15 minutos por IP
const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

// Comparación segura (evita ataques de tiempo)
function iguales(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

router.post('/login', limitarLogin, (req, res) => {
  const { usuario, clave } = req.body || {};
  const { ADMIN_USER, ADMIN_PASS, JWT_SECRET } = process.env;

  if (!ADMIN_USER || !ADMIN_PASS || !JWT_SECRET) {
    return res.status(500).json({ error: 'El servidor no tiene configuradas las credenciales de admin' });
  }
  if (!usuario || !clave || !iguales(usuario, ADMIN_USER) || !iguales(clave, ADMIN_PASS)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign({ rol: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;
