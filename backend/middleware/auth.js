const jwt = require('jsonwebtoken');

// Protege las rutas del admin: exige un token válido en "Authorization: Bearer <token>"
module.exports = function verificarAdmin(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
};
