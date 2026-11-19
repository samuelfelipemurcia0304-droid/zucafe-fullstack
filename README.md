# ☕ Zucafé — Un sabor para no olvidar

Aplicación web full stack para el emprendimiento de café colombiano **Zucafé**: landing, catálogo, formulario de pedido, panel de administración con login y chatbot de atención.

## Qué cumple (checklist del proyecto final)

| Requisito | Dónde está |
|---|---|
| 01 Landing / inicio | `frontend/src/components/Hero.jsx`, `Origen.jsx`, `Navbar.jsx` |
| 02 Catálogo | `Catalogo.jsx` (datos desde MongoDB) |
| 03 Contacto real | `FormularioPedido.jsx` → `POST /api/pedidos` → MongoDB |
| 04 Panel admin | `PanelAdmin.jsx` (login JWT, pedidos, CRUD de productos) |
| 05 IA aplicada | `ChatbotIA.jsx` + `backend/routes/chat.js` |
| 06 Publicación | Frontend en GitHub Pages, backend en Render, base en MongoDB Atlas |
| Responsive | `index.css` (media queries, menú hamburguesa) |
| Animaciones (librería permitida) | `framer-motion` |
| Git + mínimo 15 commits | ver plan de commits abajo |

## Estructura

```
zucafe-fullstack/
├── backend/    Node.js + Express + MongoDB (puerto 3000)
└── frontend/   React + Vite (.jsx) + CSS personalizado
```

## Cómo correrlo en tu computador

Necesitas Node 18+ y MongoDB (local o Atlas).

```bash
# 1) Backend
cd backend
cp .env.example .env      # edita MONGODB_URI, ADMIN_USER, ADMIN_PASS, JWT_SECRET
npm install
npm run dev               # http://localhost:3000

# 2) Frontend (otra terminal)
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm install
npm run dev               # http://localhost:5173
```

El catálogo inicial (café tradicional y de especialidad con tus precios) se crea solo la primera vez.

## ⚠️ Cambia estos datos antes de publicar

1. `frontend/src/config.js` → `WHATSAPP_NEGOCIO` (hoy es un número de ejemplo).
2. `backend/.env` → `NEGOCIO_HORARIO`, `NEGOCIO_UBICACION`, `NEGOCIO_WHATSAPP` (el chatbot responde con esto).
3. Foto de la bolsa: guarda tu imagen como `frontend/public/zucafe-bolsa.jpg` (si no existe, se muestra una bolsa ilustrada).
4. `ADMIN_PASS` y `JWT_SECRET` en producción: claves largas y propias.

## Chatbot (IA)

Responde horarios, precios (lee los precios reales de la base de datos), ubicación, origen del café y cómo pedir. Funciona por reglas sin costo. Si agregas `ANTHROPIC_API_KEY` en el `.env` del backend, usa un modelo de IA real y, si falla, vuelve a las reglas.

## Publicación

### 1) Base de datos: MongoDB Atlas
Crea un cluster gratis, un usuario, permite acceso de red (0.0.0.0/0 para empezar) y copia la cadena de conexión.

### 2) Backend: Render (u otro hosting de Node)
- New → Web Service → conecta tu repositorio.
- Root Directory: `backend` · Build: `npm install` · Start: `npm start`
- Variables de entorno: las del `.env.example` (`MONGODB_URI`, `ADMIN_USER`, `ADMIN_PASS`, `JWT_SECRET`, `CORS_ORIGIN=https://TUUSUARIO.github.io`, etc.).
- Copia la URL pública que te dan (ej. `https://zucafe-api.onrender.com`).

> En el plan gratis el servidor "se duerme" y la primera petición tarda ~1 minuto. Por eso el frontend trae un catálogo de respaldo. Ábrelo antes de la defensa para despertarlo.

### 3) Frontend: GitHub Pages
En `frontend/.env` (o en el momento del build) pon la URL del backend:

```bash
cd frontend
echo "VITE_API_URL=https://zucafe-api.onrender.com" > .env
npm install
npm run deploy            # compila y publica la carpeta dist en la rama gh-pages
```

Luego en GitHub: Settings → Pages → Source: rama `gh-pages` (carpeta `/root`). Tu sitio queda en `https://TUUSUARIO.github.io/NOMBRE-REPO/`.

## Git: plan de 15+ commits

```bash
git init
git branch -M main
```

Haz un commit por cada paso (mensajes en español, claros):

1. `chore: estructura inicial y .gitignore`
2. `feat(backend): servidor Express y conexión a MongoDB`
3. `feat(backend): modelos Producto y Pedido`
4. `feat(backend): rutas de productos (CRUD)`
5. `feat(backend): rutas de pedidos`
6. `feat(backend): login de admin con JWT`
7. `feat(backend): chatbot de atención`
8. `feat(frontend): proyecto React con Vite`
9. `style: paleta de colores, tipografías y base de estilos`
10. `feat(frontend): navbar y hero`
11. `feat(frontend): sección de origen`
12. `feat(frontend): catálogo conectado a la API`
13. `feat(frontend): formulario de pedido`
14. `feat(frontend): chatbot flotante`
15. `feat(frontend): panel admin con login y pedidos`
16. `feat(frontend): gestión de productos en el admin`
17. `style: diseño responsive y animaciones`
18. `docs: README con instrucciones de despliegue`
19. `chore: despliegue en GitHub Pages`

Subir a GitHub:

```bash
git remote add origin https://github.com/TUUSUARIO/zucafe-fullstack.git
git push -u origin main
```

## API

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login` | público |
| GET | `/api/productos` | público |
| POST / PUT / DELETE | `/api/productos[/:id]` | admin |
| POST | `/api/pedidos` | público |
| GET / PATCH / DELETE | `/api/pedidos[/:id]` | admin |
| POST | `/api/chat` | público |

## Para la defensa

Prepárate para explicar: qué hace cada carpeta, cómo viaja un pedido (formulario → fetch → Express → Mongoose → MongoDB → panel admin), cómo funciona el login con JWT y el middleware `verificarAdmin`, y cómo responde el chatbot. Si trabajan en pareja, ambos deben dominar todo el código.
