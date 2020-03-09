const jwt = require('jsonwebtoken');

// ================================
// Verifica Token
// ================================
let verificaToken = (req, res, next) => {
  let token = req.get('token');
  verificarToken(token, req, next);
};

// ================================
// Verifica Token Imagen
// ================================
let verificaTokenImg = (req, res, next) => {
  let token = req.query.token;
  verificarToken(token, req, next);
};

const verificarToken = (token, req, next) => {
  console.log(token);
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) return res.status(401).json({ ok: false, err: { message: 'Token no válido' } });
    req.usuario = decoded.usuario;
    next();
  });
};

// ================================
// Verifica Admin Role
// ================================
let verificaAdminRol = (req, res, next) => {
  let usuario = req.usuario;
  if (usuario.rol !== 'ADMIN_ROL') {
    return res.status(403).json({ ok: false, err: { message: 'Usuario no autorizado' } });
  }
  next();
};

module.exports = { verificaToken, verificaAdminRol, verificaTokenImg };
