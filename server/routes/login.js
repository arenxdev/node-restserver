const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/usuario');

const app = express();
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {
  const body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (!usuarioDB) return res.status(400).json({ ok: false, err: { message: '(Usuario) o contraseña incorrectos' } });
    if (!bcrypt.compareSync(body.password, usuarioDB.password))
      return res.status(400).json({ ok: false, err: { message: 'Usuario o (contraseña) incorrectos' } });
    const token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    return res.json({ ok: true, usuario: usuarioDB, token });
  });
});

// Configuraciones de google
const verify = async token => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
};

app.post('/google', async (req, res) => {
  let token = req.body.idtoken;
  let googleUser = await verify(token).catch(err => res.status(403).json({ ok: false, err }));
  console.log(googleUser);

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) return res.status(500).json({ ok: false, err });
    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({ ok: false, err: { message: 'Debe usar su autenticación normal' } });
      } else {
        const token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        return res.json({ ok: true, usuario: usuarioDB, token });
      }
    } else {
      // Si el usuario no existe en la base de datos
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';
      usuario.save((err, usuarioDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        const token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        return res.json({ ok: true, usuario: usuarioDB, token });
      });
    }
  });
});

module.exports = app;
