// ================================
// Puerto
// ================================
process.env.PORT = process.env.PORT || 3000;

// ================================
// Entorno
// ================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ================================
// Vencimiento del token
// ================================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ================================
// SEED de autenticación
// ================================
process.env.SEED = process.env.SEED || 'este-es-el-sid-de-desarrollo';

// ================================
// Base de datos
// ================================
const urlDB = process.env.NODE_ENV === 'dev' ? 'mongodb://localhost:27017/cafeudemy' : process.env.MONGO_URI;

process.env.URLDB = urlDB;

// ================================
// Google Client ID
// ================================
process.env.CLIENT_ID =
  process.env.CLIENT_ID || '960938978476-6d6o45ltr1olehp1rd45bfeqhkvesurt.apps.googleusercontent.com';
