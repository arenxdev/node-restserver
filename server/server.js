require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/usuario', function(req, res) {
  res.json('getUsuario');
});

app.post('/usuario', function(req, res) {
  let body = req.body;
  if (body.nombre === undefined) {
    res.status(400).json({
      ok: false,
      mensaje: 'El nombre es necesario',
    });
  } else {
    res.json({ body });
  }
});

app.put('/usuario/:id', function(req, res) {
  const id = req.params.id;
  res.json({ id });
});

app.delete('/usuario', function(req, res) {
  res.json('deleteUsuario');
});

app.listen(process.env.PORT, () => console.log(`Escuchando puerto ${process.env.PORT}`));
