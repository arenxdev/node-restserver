const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');

app.get('/usuario', function(req, res) {
  const desde = Number(req.query.desde) || 0;
  const limite = Number(req.query.limite) || 5;
  const filtro = { estado: true };

  Usuario.find(filtro, 'nombre email rol estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) return res.status(400).json({ ok: false, err });
      Usuario.count(filtro, (err, total) => {
        if (err) return res.status(400).json({ ok: false, err });
        res.json({ ok: true, usuarios, total });
      });
    });
});

app.post('/usuario', function(req, res) {
  const body = req.body;
  const usuario = new Usuario({ ...body, password: bcrypt.hashSync(body.password, 10) });
  usuario.save((err, usuarioDB) => {
    if (err) return res.status(400).json({ ok: false, err });
    res.json({ ok: true, usuario: usuarioDB });
  });
});

app.put('/usuario/:id', function(req, res) {
  const id = req.params.id;
  const body = {};
  ['nombre', 'emial', 'img', 'rol', 'estado'].forEach(prop => (body[prop] = req.body[prop]));
  console.log(body);
  Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
    if (err) return res.status(400).json({ ok: false, err });
    res.json({ ok: true, usuario: usuarioDB });
  });
});

app.delete('/usuario/:id', function(req, res) {
  const id = req.params.id;
  const cambiaEstado = { estado: false };
  // Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
  Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioDB) => {
    if (err) return res.status(400).json({ ok: false, err });
    if (!usuarioDB) return res.status(400).json({ ok: false, err: { message: 'usuario no encontrado' } });
    res.json({ ok: true, usuario: usuarioDB });
  });
});

module.exports = app;
