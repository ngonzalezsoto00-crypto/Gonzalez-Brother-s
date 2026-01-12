# 📏✂ SastreControl: Gestión de Producción

Sistema de control digital para **Gonzàlez Brother's** - Sastrería profesional.

## 🎨 Características de Diseño

- **Colores Corporativos**: Azul Éter (#4FC3F7) y Dorado (#FFD700)
- **Elementos Decorativos**: Tijeras (✂), Metros (📏), Camisas (👔), Hilos (🧵) y Alfileres (📍)
- **PWA**: Instalable como aplicación en Android/iPhone
- **Tablas Estilo Excel**: Visualización profesional de datos

## 👥 Roles del Sistema

### 1. 🚗 Domiciliario
- **Funciones duales**: Señalamiento y Recepción
- **Acceso**: Nombre simple
- **Tareas**:
  - Realizar señalamientos de trabajos
  - Recepcionar prendas terminadas
  - Ver resumen de tareas del mes

### 2. 📍 Señalador
- **Solo visualización**: No puede crear facturas
- **Acceso**: Nombre simple
- **Información que ve**:
  - Total de facturas asignadas (mes actual)
  - Total recepcionado en pesos
  - **Comisión**: Porcentaje del total recepcionado (configurable por dueño)
  - Lista de sus facturas

### 3. 👔 Sastre
- **Acceso**: Dropdown + PIN de 4 dígitos
- **Registro**: Solo el administrador puede crear sastres y asignar PINs
- **Funciones**:
  - Ver trabajos asignados por periodo (Azul/Amarillo/Verde/Rojo)
  - Registrar prendas terminadas
  - Marcar garantías
  - Ver estadísticas personales
  - **Restricción**: Solo puede editar sus propias prendas

### 4. 🔧 Administrador
- **Acceso**: PIN (default: 1234)
- **Funciones principales**:
  - **Crear Facturas**: Asignar señalador a cada factura
  - **Gestión de Sastres**: Agregar sastres con PIN, eliminarlos, cambiar PINs
  - Buscar facturas
  - Ver producción de sastres
  - Ver estadísticas de señaladores
  - Gestión de periodos
  - Historial completo

### 5. 👑 Dueño
- **Acceso**: PIN (default: 0000)
- **Funciones**:
  - Reportes completos
  - Configuración del sistema:
    - PINs de Admin y Dueño
    - Porcentajes de Salud y Pensión
    - **Porcentaje de Comisión para Señaladores**
  - Historial mensual completo

## 📊 Sistema de Períodos

Las prendas se organizan por fecha de recepción en 4 períodos:

- **🔵 Azul**: Días 1-10 del mes
- **🟡 Amarillo**: Días 11-20 del mes
- **🟢 Verde**: Días 21-30/31 del mes
- **🔴 Rojo**: Garantías (sin periodo específico)

Los administradores pueden cerrar periodos para evitar modificaciones.

## 💰 Sistema de Pagos

- **Moneda**: Pesos Colombianos (COP)
- **Estados**: Pendiente, Abonado, Pagado
- **Comisión Señalador**: Porcentaje configurable (default: 5%)

## 🔐 Credenciales Default

| Rol           | Usuario/Método        | PIN/Contraseña |
|---------------|-----------------------|----------------|
| Domiciliario  | Nombre libre          | -              |
| Señalador     | Nombre libre          | -              |
| Sastre        | Creado por Admin      | Asignado 4 dígitos |
| Administrador | -                     | 1234           |
| Dueño         | -                     | 0000           |

## 🚀 Flujo de Trabajo

### 1. Recepción (Administrador)
- Administrador recibe al cliente
- Crea factura con todos los datos:
  - Cédula, nombre, celular, dirección
  - Descripción del trabajo
  - Precio total y abono
- **Asigna señalador responsable**

### 2. Señalamiento (Domiciliario/Señalador)
- El señalador visualiza sus facturas asignadas
- Ve su comisión (% del total recepcionado)
- El domiciliario puede señalar y recepcionar trabajos

### 3. Gestión de Sastres (Administrador)
- Administrador agrega cada sastre al sistema
- Le asigna un PIN único de 4 dígitos
- Puede cambiar PINs o eliminar sastres

### 4. Producción (Sastre)
- Sastre ingresa con su nombre + PIN
- Ve trabajos de su periodo
- Registra prendas terminadas con precio
- No puede editar trabajos de otros sastres

### 5. Seguimiento (Admin/Dueño)
- Admin supervisa producción en tiempo real
- Dueño ve reportes completos
- Configura parámetros del sistema

## 📱 Instalación PWA

1. Abre el navegador en tu celular
2. Accede a la aplicación
3. Toca "Agregar a pantalla de inicio"
4. ¡Listo! Úsala como app nativa

## 💾 Almacenamiento

Toda la información se guarda localmente en el dispositivo usando `localStorage`:
- **Facturas**: Todas las órdenes de trabajo
- **Clientes**: Base de datos de clientes
- **Prendas**: Registro de producción
- **Sastres**: Con PINs seguros
- **Señaladores**: Lista de señaladores activos
- **Configuración**: Parámetros del sistema
- **Historial**: Archivos mensuales

## 🎨 Personalización (Dueño)

El dueño puede configurar:
- **PINs de seguridad**: Admin y Dueño
- **Porcentajes de descuentos**: Salud (4%) y Pensión (4%)
- **Porcentaje de comisión para señaladores**: Default 5%

## 🔧 Cambios Recientes

### Nueva Estructura de Roles:
1. **Administrador crea facturas** (antes lo hacía el señalador)
2. **Señalador solo visualiza** su comisión y facturas
3. **Domiciliario** nuevo rol con funciones duales
4. **Sastres con PIN**: Mayor seguridad
5. **Comisión por porcentaje**: Más flexible que monto fijo

### Nuevo Diseño:
- Colores corporativos: Azul Éter y Dorado
- Elementos decorativos de sastrería
- Gradientes y sombras doradas
- Interfaz más profesional

---

**Gonzàlez Brother's** - Control Digital de Producción 2024
