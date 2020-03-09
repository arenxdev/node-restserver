const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
  let { tipo, img } = req.params;
  let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
  if (fs.existsSync(pathImg) === false) {
    pathImg = path.resolve(__dirname, `../assets/no-image.jpg`);
  }
  res.sendFile(pathImg);
});

module.exports = app;
