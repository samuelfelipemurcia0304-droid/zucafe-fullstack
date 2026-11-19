// Catálogo de respaldo: se muestra si el servidor está dormido o sin conexión,
// para que la página nunca se vea vacía en la revisión/defensa.
export const productosBase = [
  {
    _id: 'base-tradicional',
    nombre: 'Café Tradicional Zucafé',
    categoria: 'tradicional',
    descripcion:
      'El café de todos los días: tostado y molido, con cuerpo y aroma reconfortante para tu tinto o tu filtrado de la mañana.',
    presentaciones: [
      { etiqueta: '1/2 libra', precio: 19000 },
      { etiqueta: '1 libra', precio: 34000 },
    ],
  },
  {
    _id: 'base-especialidad',
    nombre: 'Café de Especialidad Zucafé',
    categoria: 'especialidad',
    descripcion:
      'Café de altura cultivado bajo sombra en Tena, Cundinamarca. Combina un aroma floral intenso con una taza brillante, dulce y de notas frutales cítricas, pensada para dejar una sensación fresca y memorable en cada sorbo. Bolsa kraft con ventana frontal para ver el grano.',
    origen: 'Tena, Cundinamarca, Colombia (1.750 m.s.n.m.)',
    variedad: 'Caturra',
    cultivo: 'Agroforestal bajo sombra',
    perfil: 'Aroma floral intenso; sabor frutal cítrico, dulce y brillante',
    tostion: 'Media / media alta',
    molido: 'Fino / medio',
    presentaciones: [
      { etiqueta: '1/2 libra', precio: 22000 },
      { etiqueta: '1 libra', precio: 38000 },
    ],
  },
];
