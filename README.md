# 🎨 Frontend — E-Commerce App

Interfaz de usuario construida con **React 18**, diseño **mobile-first** y CSS puro sin librerías de UI externas.

---

## 📁 Estructura

```
frontend/
├── public/
│   └── index.html              # HTML base con fuente Inter de Google Fonts
├── src/
│   ├── index.js                # Punto de entrada React
│   ├── App.js                  # Router principal con todas las rutas
│   ├── index.css               # Sistema de diseño completo (mobile-first)
│   ├── services/
│   │   └── api.js              # Axios + interceptors JWT automáticos
│   ├── context/
│   │   ├── AuthContext.js      # Estado global de autenticación
│   │   └── CartContext.js      # Estado global del carrito
│   ├── components/
│   │   └── common/
│   │       ├── Navbar.js       # Navegación con menú hamburguesa en móvil
│   │       ├── ProductCard.js  # Tarjeta de producto reutilizable
│   │       └── ProtectedRoute.js # Guard de rutas privadas y de admin
│   └── pages/
│       ├── Home.js             # Inicio: hero, categorías y productos destacados
│       ├── Catalog.js          # Catálogo con búsqueda, filtros y paginación
│       ├── ProductDetail.js    # Detalle de producto con selector de cantidad
│       ├── Cart.js             # Carrito con actualización de cantidades
│       ├── Checkout.js         # Formulario de envío y pago
│       ├── Login.js            # Inicio de sesión
│       ├── Register.js         # Registro de usuario
│       ├── Profile.js          # Perfil y historial de pedidos
│       ├── OrderDetail.js      # Detalle de pedido con descarga de factura
│       └── Admin.js            # Panel de administración (productos, pedidos, usuarios)
├── .env                        # Variables de entorno
├── Dockerfile
└── package.json
```

---

## ⚙️ Instalación

```bash
cd frontend
npm install
```

### Variables de entorno (`.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción en `/build` |

---

## 📄 Páginas

| Ruta | Página | Auth | Descripción |
|------|--------|------|-------------|
| `/` | Home | ❌ | Hero, categorías y 8 productos destacados |
| `/catalog` | Catalog | ❌ | Todos los productos con filtros y paginación |
| `/product/:id` | ProductDetail | ❌ | Imagen, descripción, precio, stock y selector de cantidad |
| `/cart` | Cart | ✅ | Items del carrito, cantidades y resumen |
| `/checkout` | Checkout | ✅ | Dirección de envío y datos de tarjeta |
| `/login` | Login | ❌ | Formulario de acceso |
| `/register` | Register | ❌ | Formulario de registro |
| `/profile` | Profile | ✅ | Editar perfil e historial de pedidos |
| `/orders/:id` | OrderDetail | ✅ | Detalle del pedido y descarga de factura PDF |
| `/admin` | Admin | 🔐 admin | Gestión de productos, pedidos y usuarios |

---

## 🔄 Estado global

### AuthContext

Gestiona la sesión del usuario con persistencia en `localStorage`.

```js
const { user, login, register, logout, updateUser, isAdmin } = useAuth();
```

| Valor / Función | Descripción |
|-----------------|-------------|
| `user` | Objeto con `id`, `name`, `email`, `role` o `null` |
| `isAdmin` | `true` si `user.role === 'admin'` |
| `login(credentials)` | POST `/auth/login` → guarda token y user |
| `register(userData)` | POST `/auth/register` → guarda token y user |
| `logout()` | Limpia localStorage y resetea estado |
| `updateUser(data)` | Actualiza user en estado y localStorage |

### CartContext

Carrito sincronizado con la API en tiempo real.

```js
const { items, total, count, addItem, updateItem, removeItem, clearCart } = useCart();
```

| Valor / Función | Descripción |
|-----------------|-------------|
| `items` | Array de items con producto incluido |
| `total` | Suma total calculada en el cliente |
| `count` | Cantidad total de unidades |
| `addItem(productId, qty)` | POST `/cart` |
| `updateItem(id, qty)` | PUT `/cart/:id` — si qty ≤ 0 elimina el item |
| `removeItem(id)` | DELETE `/cart/:id` |
| `clearCart()` | DELETE `/cart/clear` |

---

## 🌐 Servicio API (`services/api.js`)

Instancia de Axios con:
- **Base URL** desde `REACT_APP_API_URL`
- **Interceptor de request** — agrega `Authorization: Bearer <token>` automáticamente
- **Interceptor de response** — redirige a `/login` si recibe 401

```js
import { authAPI, productsAPI, cartAPI, ordersAPI } from './services/api';
```

| Módulo | Métodos |
|--------|---------|
| `authAPI` | `register`, `login`, `getProfile`, `updateProfile` |
| `productsAPI` | `getAll(params)`, `getOne(id)`, `create`, `update`, `delete` |
| `categoriesAPI` | `getAll`, `create`, `update`, `delete` |
| `cartAPI` | `getCart`, `addItem`, `updateItem`, `removeItem`, `clearCart` |
| `ordersAPI` | `create`, `getMyOrders`, `getOne`, `getAll`, `updateStatus` |
| `usersAPI` | `getAll`, `update`, `delete` |

---

## 🎨 Sistema de diseño

CSS puro en `index.css` con variables CSS y enfoque **mobile-first**.

### Variables

```css
--primary: #6366f1      /* Indigo */
--primary-dark: #4f46e5
--secondary: #f59e0b    /* Amber */
--success: #10b981
--danger: #ef4444
--gray: #64748b
--light: #f8fafc
--border: #e2e8f0
--radius: 12px
```

### Breakpoints

| Breakpoint | Ancho | Cambios principales |
|------------|-------|---------------------|
| Móvil (base) | < 640px | 1 columna, menú hamburguesa |
| Tablet | ≥ 640px | 2 columnas en grids |
| Desktop | ≥ 900px | 4 columnas, layouts de 2 paneles |

### Clases principales

| Clase | Uso |
|-------|-----|
| `.container` | Wrapper centrado máx. 1200px |
| `.card` | Tarjeta con sombra y border-radius |
| `.btn`, `.btn-primary`, `.btn-outline`... | Botones |
| `.grid`, `.grid-2`, `.grid-3`, `.grid-4` | Grids responsivos |
| `.badge`, `.badge-success`... | Etiquetas de estado |
| `.form-control`, `.form-group` | Inputs de formulario |
| `.cart-layout` | Grid carrito (1 col móvil / 2 col desktop) |
| `.checkout-layout` | Grid checkout (1 col móvil / 2 col desktop) |
| `.product-detail-layout` | Grid detalle (1 col móvil / 2 col desktop) |
| `.filters` | Grid de filtros (1→2→4 columnas) |
| `.spinner` | Indicador de carga animado |

---

## 🧭 Navbar responsive

- **Desktop**: links horizontales en la barra
- **Móvil**: botón hamburguesa (☰) que despliega menú vertical con animación
- Badge con contador de items en el carrito
- Se cierra automáticamente al navegar

---

## 🔐 Rutas protegidas

`ProtectedRoute` redirige a `/login` si no hay sesión activa.

```jsx
<Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
<Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
```

Con `adminOnly={true}` redirige a `/` si el usuario no es admin.

---

## 🛠️ Panel de administración (`/admin`)

Accesible solo con rol `admin`. Tres pestañas:

**Productos**
- Tabla con nombre, categoría, precio y stock
- Formulario inline para crear y editar
- Botón de eliminar con confirmación

**Pedidos**
- Tabla con cliente, total, estado y fecha
- Selector de estado para actualizar en tiempo real

**Usuarios**
- Tabla con nombre, email, rol y estado
- Botón para activar / desactivar cuenta

---

## 📦 Dependencias principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | ^18.2.0 | UI |
| react-router-dom | ^6.21.0 | Enrutamiento SPA |
| axios | ^1.6.2 | Cliente HTTP |
| react-hot-toast | ^2.4.1 | Notificaciones |
