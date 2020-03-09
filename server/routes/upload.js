const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const app = express();

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
  let { tipo, id } = req.params;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ ok: false, err: { message: 'No se ha seleccionado ningún archivo.' } });
  }

  // Validar tipo
  let tiposValidos = ['productos', 'usuarios'];
  if (!tiposValidos.includes(tipo)) {
    return res
      .status(400)
      .json({ ok: false, err: { message: `Los tipos válidos son ${tiposValidos.join(', ')}`, tipo } });
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let archivo = req.files.archivo;

  // Extensiones permitidas
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
  let extension = archivo.name
    .split('.')
    .slice(-1)
    .pop();

  if (!extensionesValidas.includes(extension)) {
    return res.status(400).json({
      ok: false,
      err: { message: `Las extensiones validas son ${extensionesValidas.join(', ')}`, ext: extension },
    });
  }

  // Cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
  archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, err => {
    if (err) {
      eliminaArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({ ok: false, err });
    }
    //Imagen cargada
    switch (tipo) {
      case 'usuarios':
        imagenUsuario(id, res, nombreArchivo);
        break;
      case 'productos':
        imagenProducto(id, res, nombreArchivo);
        break;
      default:
        break;
    }
  });
});

const imagenUsuario = (id, res, nombreArchivo) => {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      eliminaArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({ ok: false, err });
    }
    if (!usuarioDB) {
      eliminaArchivo(nombreArchivo, 'usuarios');
      return res.status(400).json({ ok: false, err: { message: 'Usuario no existe' } });
    }

    eliminaArchivo(usuarioDB.img, 'usuarios');

    usuarioDB.img = nombreArchivo;
    usuarioDB.save(() => {
      res.json({ ok: true, usuario: { usuario: 'Usuario guardado' }, img: nombreArchivo });
    });
  });
};
const imagenProducto = (id, res, nombreArchivo) => {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      eliminaArchivo(nombreArchivo, 'productos');
      return res.status(500).json({ ok: false, err });
    }
    if (!productoDB) {
      eliminaArchivo(nombreArchivo, 'productos');
      return res.status(400).json({ ok: false, err: { message: 'Producto no existe' } });
    }

    eliminaArchivo(productoDB.img, 'productos');

    productoDB.img = nombreArchivo;
    productoDB.save(() => {
      res.json({ ok: true, producto: { producto: 'Producto guardado' }, img: nombreArchivo });
    });
  });
};

const eliminaArchivo = (nombreImagen, tipo) => {
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
};

module.exports = app;
