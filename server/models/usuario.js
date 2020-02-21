const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const rolesValidos = {
  values: ['ADMIN_ROL', 'USER_ROL'],
  message: '{VALUE} no es un rol vádilo',
};

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es necesario'],
  },
  email: {
    type: String,
    required: [true, 'El correo es necesario'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
  },
  img: {
    type: String,
    required: false,
  },
  rol: {
    type: String,
    default: 'USER_ROL',
    enum: rolesValidos,
  },
  estado: {
    type: Boolean,
    default: true,
  },
  google: {
    type: Boolean,
    default: false,
  },
});

usuarioSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);
