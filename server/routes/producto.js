const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');

let app = express();

// ==============================
// Obtener productos
// ==============================
app.get('/producto', (req, res) => {
  // Trae todos los productos
  // Populate usuario y categoría
  // Paginado
  const desde = Number(req.query.desde) || 0;
  const limite = Number(req.query.limite) || 5;
  Producto.find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .sort('nombre')
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {
      if (err) return res.status(500).json({ ok: false, err });
      if (!productos) return res.status(400).json({ ok: false, err: { message: 'No se encontraron productos' } });
      Producto.count({ disponible: true }, (err, total) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!total) return res.status(400).json({ ok: false, err: { message: 'Error buscando total' } });
        res.json({ ok: true, productos, total });
      });
    });
});

// ==============================
// Obtener productos por id
// ==============================
app.get('/producto/:id', (req, res) => {
  // Populate usuario y categoría
  let id = req.params.id;
  Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoDB) => {
      if (err) return res.status(500).json({ ok: false, err });
      if (!productoDB) return res.status(400).json({ ok: false, err: { message: 'Producto no existe' } });
      res.json({ ok: true, producto: productoDB });
    });
});

// ==============================
// Buscar productos
// ==============================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regexp = new RegExp(termino, 'i');
  Producto.find({ nombre: regexp })
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {
      if (err) return res.status(500).json({ ok: false, err });
      if (!productos) return res.status(400).json({ ok: false, err: { message: 'No se encontraron productos' } });
      res.json({ ok: true, productos });
    });
});

// ==============================
// Crear un nuevo producto
// ==============================
app.post('/producto', verificaToken, (req, res) => {
  // Grabar el usuario
  // Grabar una categoría del listado de categorías
  // Crear el producto
  let { producto } = req.body;
  !producto && res.status(400).json({ ok: false, err: { message: 'El campo producto es obligatorio' } });
  let { categoria } = producto;
  !categoria && res.status(400).json({ ok: false, err: { message: 'El campo categoria es obligatorio' } });
  let usuario = req.usuario;
  let productoMongo = new Producto({
    nombre: producto.nombre,
    precioUni: producto.precio,
    descripcion: producto.descripcion,
    disponible: true,
    categoria: categoria.id,
    usuario: usuario._id,
  });
  productoMongo.save((err, productoDB) => {
    if (err) res.status(500).json({ ok: false, err });
    if (!productoDB) res.status(400).json({ ok: false, err: { message: 'Error creando producto' } });
    res.json({ ok: true, producto: productoDB });
  });
});

// ==============================
// Actualizar producto
// ==============================
app.put('/producto/:id', verificaToken, (req, res) => {
  // Grabar el usuario
  // Grabar una categoría del listado de categorías
  // Crear el producto
  let id = req.params.id;
  let { producto } = req.body;
  let { categoria } = producto;
  let productoMongo = {};
  producto.nombre && (productoMongo.nombre = producto.nombre);
  producto.precio && (productoMongo.precioUni = producto.precio);
  producto.descripcion && (productoMongo.nombre = producto.descripcion);
  categoria && (productoMongo.categoria = categoria.id);
  Producto.findByIdAndUpdate(id, productoMongo, { new: true, runValidators: true }, (err, productoDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!productoDB)
      return res.status(400).json({ ok: false, err: { message: 'No fue posible actualizar el producto' } });
    return res.json({ ok: true, producto: productoDB });
  });
});

// ==============================
// Borrar producto
// ==============================
app.delete('/producto/:id', (req, res) => {
  // Al eliminar el campo disponible debe ser false
  let id = req.params.id;
  let cambiaDisponible = { disponible: false };
  Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!productoDB) res.status(400).json({ ok: false, err: { message: 'Producto no encontrado' } });
    return res.status(200).json({ ok: true, message: 'Producto eliminado' });
  });
});

module.exports = app;
