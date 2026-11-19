const mongoose = require('mongoose');

const presentacionSchema = new mongoose.Schema(
  {
    etiqueta: { type: String, required: true, trim: true, maxlength: 40 }, // "1/2 libra", "1 libra"
    precio: { type: Number, required: true, min: 0 }, // en pesos COP
  },
  { _id: false }
);

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    categoria: { type: String, enum: ['tradicional', 'especialidad'], default: 'tradicional' },
    descripcion: { type: String, trim: true, maxlength: 1000, default: '' },
    origen: { type: String, trim: true, default: '' },
    variedad: { type: String, trim: true, default: '' },
    cultivo: { type: String, trim: true, default: '' },
    perfil: { type: String, trim: true, default: '' },
    tostion: { type: String, trim: true, default: '' },
    molido: { type: String, trim: true, default: '' },
    imagen: { type: String, trim: true, default: '' },
    presentaciones: { type: [presentacionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Producto', productoSchema);
