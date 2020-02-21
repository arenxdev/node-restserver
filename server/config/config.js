// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de datos

const urlDB = process.env.NODE_ENV === 'dev' ? 'mongodb://localhost:27017/cafeudemy' : process.env.MONGO_URI;

process.env.URLDB = urlDB;
