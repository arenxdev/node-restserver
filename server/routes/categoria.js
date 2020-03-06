const express = require('express');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const app = express();

let Categoria = require('../models/categoria');

// Mostrar todas las categorías
app.get('/categoria', verificaToken, (req, res) => {
  const desde = Number(req.query.desde) || 0;
  const limite = Number(req.query.limite) || 5;

  Categoria.find({})
    .skip(desde)
    .limit(limite)
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    // .populate('otro join ', 'campo1 campo2')
    .exec((err, categorias) => {
      if (err) return res.status(400).json({ ok: false, err });
      Categoria.count({}, (err, total) => {
        if (err) return res.status(400).json({ ok: false, err });
        res.json({ ok: true, categorias, total });
      });
    });
});

// Mostrar una categoría por id
app.get('/categoria/:id', verificaToken, (req, res) => {
  const id = req.params.id;
  Categoria.findById(id, (err, categoriaDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!categoriaDB) return res.status(400).json({ ok: false, err: { message: 'Categoría no existe' } });
    res.json({ ok: true, categoria: categoriaDB });
  });
});

//  Crear categoría
app.post('/categoria', verificaToken, (req, res) => {
  const body = req.body;
  const categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id,
  });
  categoria.save((err, categoriaDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!categoriaDB) return res.status(400).json({ ok: false, err: { message: 'No fue posible crear la categoría' } });
    res.json({ ok: true, categoria: categoriaDB });
  });
});

//  Actualiza categoría
app.put('/categoria/:id', verificaToken, (req, res) => {
  const id = req.params.id;
  let descripcion = { descripcion: req.body.descripcion };
  Categoria.findByIdAndUpdate(id, descripcion, { new: true, runValidators: true }, (err, categoriaDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!categoriaDB)
      return res.status(400).json({ ok: false, err: { message: 'No fue posible actualizar la categoría' } });
    res.json({ ok: true, categoria: categoriaDB });
  });
});

// Mostrar una categoría por id
app.delete('/categoria/:id', verificaToken, verificaAdminRol, (req, res) => {
  const id = req.params.id;
  Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!categoriaDB) return res.status(400).json({ ok: false, err: { message: 'categoria no encontrada' } });
    res.json({ ok: true, message: 'Categoria borrada' });
  });
});

module.exports = app;
