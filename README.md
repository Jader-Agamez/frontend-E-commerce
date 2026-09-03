# 🎨 Frontend — E-Commerce

SPA construida con **React 18** y desplegada en **Vercel**.

🌐 **Demo en vivo:** [frontend-e-commerce-black.vercel.app](https://frontend-e-commerce-black.vercel.app)

> **Credenciales de prueba**
> | Rol | Email | Contraseña |
> |-----|-------|------------|
> | Admin | admin@ecommerce.com | admin123 |
> | Cliente | juan@example.com | cliente123 |

---

## 🧰 Tecnologías

| Paquete | Uso |
|---------|-----|
| React 18 | UI library |
| React Router v6 | Navegación SPA |
| Axios | Cliente HTTP |
| Stripe.js | Checkout de pagos |
| React Hot Toast | Notificaciones |
| Context API | Estado global (Auth, Cart) |

---

## ✨ Páginas y funcionalidades

| Página | Ruta | Descripción |
|--------|------|-------------|
| Home | `/` | Hero + productos destacados |
| Catálogo | `/catalog` | Productos con filtros y búsqueda |
| Detalle | `/products/:id` | Imagen, precio, stock, agregar al carrito |
| Carrito | `/cart` | Items, cantidades, subtotales |
| Checkout | `/checkout` | Dirección + pago con Stripe |
| Mis pedidos | `/orders` | Historial con estado |
| Detalle pedido | `/orders/:id` | Productos, total, factura PDF |
| Perfil | `/profile` | Editar datos personales |
| Seguridad | `/security` | Cambiar contraseña + 2FA |
| Admin | `/admin` | Panel completo de administración |
| Login / Register | `/login` `/register` | Autenticación |

---

## 🛡️ Panel de Administración

Accesible solo para usuarios con rol `admin`:

- **📊 Dashboard** — KPIs, gráfica de ventas mensuales, top productos, breakdown de estados
- **🔗 CJ Dropshipping** — Buscar e importar productos por código PID
- **🛍️ Productos** — Crear, editar y eliminar productos
- **📂 Categorías** — Gestión de categorías
- **📦 Pedidos** — Ver todos los pedidos y cambiar estado
- **👥 Usuarios** — Ver usuarios, cambiar roles, activar/desactivar

---

## 🚀 Correr localmente

```bash
npm install
npm start    # http://localhost:3000
```

### Variable de entorno

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_KEY=pk_test_...
```

---

## 📁 Estructura

```
src/
├── components/
│   ├── common/         # Navbar, ProductCard, ProtectedRoute
│   └── admin/          # DashboardStats, CJImporter
├── context/
│   ├── AuthContext.js  # Usuario, login, logout, roles
│   └── CartContext.js  # Carrito, agregar, eliminar, total
├── pages/              # Una página por ruta
├── services/
│   └── api.js          # Cliente Axios con interceptores JWT
└── App.js              # Router principal con rutas protegidas
```

---

## 🔐 Rutas protegidas

- `/checkout`, `/cart`, `/orders`, `/profile`, `/security` → requieren login
- `/admin` → requiere rol `admin`
- Redirección automática a `/login` si no hay sesión activa

---

## 🎨 Diseño

- CSS puro con variables CSS (sin frameworks)
- Diseño responsive mobile-first
- Componentes reutilizables
- Nginx con gzip y cache de assets estáticos en producción
