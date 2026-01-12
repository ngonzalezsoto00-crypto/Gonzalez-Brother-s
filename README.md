# 🧵 SastreControl - Gonzàlez Brother´s

## Sistema de Gestión de Producción para Sastrería

Aplicación web completa y descargable para Android/iPhone para digitalizar el flujo de trabajo de la sastrería Gonzàlez Brother´s, con sistema de colores por periodos, base de datos de clientes, gestión de facturas, liquidación automática y control de garantías.

---

## 📋 Características Principales

### ✅ Sistema de Semáforo por Periodos
- **Azul**: Días 1-10 del mes
- **Amarillo**: Días 11-20 del mes
- **Verde**: Días 21-30/31 del mes
- **Rojo**: Garantías (con nota obligatoria)

### ✅ Cuatro Roles de Usuario

#### 📝 **Señalador** (NUEVO)
- Recepción de clientes con datos completos
- Registro de: Cédula, Nombre, Celular, Dirección
- Descripción detallada del trabajo a realizar
- Control de precios, abonos y saldos
- Base de datos de clientes buscable
- Generación automática de facturas numeradas
- Impresión de facturas
- Comisión de $2,000 COP por cada recepción
- Vista de sus recepciones mensuales

#### 👔 **Sastre**
- Registro simplificado: Solo número de factura
- El precio se obtiene automáticamente de la factura
- Búsqueda de información de factura antes de registrar
- Visualización de producción con vista Excel
- Sistema de colores automático según el día
- Historial de trabajos en formato tabla
- Solo puede editar sus propios trabajos
- Solo lectura de periodos cerrados

#### ⚙️ **Administrador**
- Gestión completa de facturas (búsqueda avanzada)
- Vista de producción de todos los sastres en formato Excel
- Vista de recepciones de todos los señaladores
- Pestañas por periodo (Azul, Amarillo, Verde, Garantías, Todos)
- Cálculo automático de liquidación con deducciones:
  - Salud (4%)
  - Pensión (4%)
  - Préstamos
  - Otros descuentos
- Generación de volantes de pago (descargables)
- Cierre de periodos (bloquea edición)
- Puede editar/eliminar cualquier registro
- Gestión de historial mensual

#### 👑 **Dueño**
- Estadísticas generales del negocio
- Reportes detallados por sastre y señalador
- Análisis de garantías
- Configuración del sistema (PINs, porcentajes)
- Acceso total al historial
- Control total de todas las operaciones

### ✅ Base de Datos de Clientes
- 📇 Almacenamiento de datos de clientes
- 🔍 Búsqueda por: Nombre, Cédula, Celular o Número de factura
- 📄 Facturas numeradas automáticamente (FAC-000001, FAC-000002...)
- 💳 Control de pagos: Pendiente, Abonado, Pagado
- 📊 Historial completo de cada cliente

### ✅ Sistema de Facturas Completo
- Número de factura único y automático
- Datos del cliente completos
- Descripción del trabajo (dictado por el señalador)
- Precio, abono y saldo
- Estado de pago
- Nombre del receptor (señalador)
- Fecha y hora de recepción
- Impresión en formato texto

### ✅ Funcionalidades Especiales
- 🔒 Bloqueo automático de periodos cerrados
- 📊 Historial mensual guardado permanentemente
- 📱 Diseño responsive para móviles
- 💾 Almacenamiento local (sin necesidad de servidor)
- 📄 Exportación de volantes y facturas
- 🎨 Colores corporativos: Azul Éter y Dorado
- 📲 **Descargable para Android e iPhone (PWA)**
- 🌐 Funciona sin internet una vez instalada

---

## 🚀 Cómo Usar la Aplicación

### Paso 1: Abrir la Aplicación
1. Haz doble clic en el archivo `index.html`
2. Se abrirá automáticamente en tu navegador predeterminado

### Paso 2: Instalar en Móvil (Android/iPhone)

#### En Android:
1. Abre la aplicación en Chrome
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma y la app se instalará como una aplicación nativa
4. Abre desde el ícono en tu pantalla de inicio

#### En iPhone:
1. Abre la aplicación en Safari
2. Toca el botón de compartir (⎙)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma y la app se instalará
5. Abre desde el ícono en tu pantalla de inicio

### Paso 3: Seleccionar Rol
En la pantalla de inicio verás cuatro opciones:

#### Para Señaladores:
1. Clic en **"Señalador"**
2. Ingresa tu nombre
3. Clic en **"Ingresar"**

#### Para Sastres:
1. Clic en **"Sastre"**
2. Ingresa tu nombre
3. Clic en **"Ingresar"**

#### Para Administradores:
1. Clic en **"Administrador"**
2. Ingresa el PIN: **1234** (predeterminado)
3. Clic en **"Ingresar"**

#### Para Dueños:
1. Clic en **"Dueño"**
2. Ingresa el PIN: **0000** (predeterminado)
3. Clic en **"Ingresar"**

---

## 📝 Uso para Señaladores

### Recepcionar un Cliente
1. Ve a la pestaña **"📝 Recepción"**
2. Completa el formulario:
   - **Cédula**: Si el cliente ya existe, haz clic en "🔍 Buscar" para autocompletar
   - **Nombre Completo**
   - **Celular**
   - **Dirección**
   - **Descripción del Trabajo**: Detalla todo lo que hay que hacerle a la prenda
   - **Precio Total**
   - **Abono**: Cantidad que paga el cliente (puede ser 0)
   - **Estado de Pago**: Pendiente/Abonado/Pagado
3. Clic en **"✅ Crear Factura"**
4. La factura se descargará automáticamente
5. Entrega la factura al cliente

### Buscar un Cliente o Factura
1. Ve a la pestaña **"🔍 Buscar Cliente"**
2. Escribe: nombre, cédula, celular o número de factura
3. Clic en **"🔍 Buscar"**
4. Verás los resultados en formato tabla
5. Puedes ver detalles o imprimir la factura nuevamente

### Ver tus Recepciones
1. Ve a la pestaña **"📊 Mis Facturas"**
2. Verás:
   - Total de recepciones del mes
   - Tu comisión acumulada ($2,000 por recepción)
   - Tabla con todas tus facturas del mes

---

## 👔 Uso para Sastres

### Registrar un Trabajo Completado
1. Ingresa el número de factura (ej: FAC-000001)
2. Haz clic en **"🔍 Buscar"**
3. Se mostrará la información del cliente y el trabajo
4. Selecciona si es garantía o no
5. Si es garantía, explica qué falló
6. Clic en **"✅ Registrar Trabajo Completado"**

### Visualizar tu Producción
- Las tarjetas de colores muestran cuántas prendas y cuánto dinero has generado en cada periodo
- El total del mes se muestra en la tarjeta superior
- El historial muestra todos los trabajos en formato Excel

### Importante para Sastres
- ✅ Solo puedes editar/eliminar tus propios trabajos
- ✅ No puedes modificar trabajos de otros sastres
- ❌ No puedes eliminar trabajos de periodos cerrados

---

## ⚙️ Uso para Administradores

### Gestionar Facturas
1. Ve a la pestaña **"📄 Facturas"**
2. Busca facturas por cualquier criterio
3. Puedes ver detalles e imprimir facturas

### Ver Producción de Sastres
1. Ve a la pestaña **"👔 Sastres"**
2. Selecciona el periodo: Azul, Amarillo, Verde, Garantías o Todos
3. Verás una tabla Excel con todos los trabajos
4. Puedes eliminar cualquier registro (si el periodo no está cerrado)

### Ver Señaladores
1. Ve a la pestaña **"📝 Señaladores"**
2. Verás tabla con:
   - Recepciones totales
   - Total ingresado
   - Comisión ganada

### Calcular Liquidación
1. Ve a la pestaña **"💰 Liquidación"**
2. Selecciona un sastre
3. El sistema calcula automáticamente:
   - **Suma Bruta**: Total producido
   - **Salud (4%)**: Descuento automático
   - **Pensión (4%)**: Descuento automático
   - **Préstamos**: Ingresa si aplica
   - **Otros Descuentos**: Ingresa monto y concepto
   - **Pago Neto**: Resultado final
4. Clic en **"Generar Volante de Pago"**

### Cerrar un Periodo
1. Ve a la pestaña **"📅 Periodos"**
2. Verás el periodo actual y periodos cerrados
3. Clic en **"Cerrar Periodo Actual"**
4. ⚠️ **IRREVERSIBLE**: Bloqueará todos los registros de ese color

---

## 👑 Uso para Dueños

### Estadísticas Generales
Al entrar verás 4 tarjetas con:
- Producción total del mes
- Sastres activos
- Garantías del mes
- Prendas procesadas

### Reportes Detallados
1. Sección **"📈 Reportes"**
2. Producción detallada de cada sastre
3. Garantías con explicaciones

### Configuración del Sistema
1. Clic en **"⚙️ Configuración"**
2. Cambia:
   - PIN del Administrador
   - PIN del Dueño
   - % Salud (predeterminado 4%)
   - % Pensión (predeterminado 4%)
3. Guardar Configuración

---

## 🔐 Credenciales Predeterminadas

| Rol | PIN/Acceso | Modificable |
|-----|------------|-------------|
| Señalador | Solo nombre | - |
| Sastre | Solo nombre | - |
| Administrador | 1234 | ✅ Sí |
| Dueño | 0000 | ✅ Sí |

---

## 💡 Flujo de Trabajo Completo

```
1. RECEPCIÓN (Señalador)
   └─> Cliente llega a la sastrería
   └─> Señalador registra datos del cliente
   └─> Señalador describe el trabajo a realizar
   └─> Se genera factura automática
   └─> Cliente recibe factura impresa
   └─> Señalador gana comisión de $2,000

2. PRODUCCIÓN (Sastre)
   └─> Sastre recibe la prenda con factura
   └─> Realiza el trabajo descrito
   └─> Registra solo el número de factura
   └─> Sistema asigna color automáticamente

3. SEGUIMIENTO (Administrador)
   └─> Revisa trabajos por periodo
   └─> Busca facturas de clientes
   └─> Controla producción

4. LIQUIDACIÓN (Días 10, 20, 30/31)
   └─> Administrador calcula liquidaciones
   └─> Genera volantes de pago
   └─> Cierra el periodo

5. PAGO
   └─> Sastres reciben su pago
   └─> Señaladores reciben comisiones
   └─> Sistema guarda en historial

---

## 📋 Características Principales

### ✅ Sistema de Semáforo por Periodos
- **Azul**: Días 1-10 del mes
- **Amarillo**: Días 11-20 del mes
- **Verde**: Días 21-30/31 del mes
- **Rojo**: Garantías (con nota obligatoria)

### ✅ Tres Roles de Usuario

#### 👔 **Sastre**
- Registro rápido de prendas con número de factura y precio
- Visualización de producción diaria y mensual
- Sistema de colores automático según el día
- Historial de prendas trabajadas
- Solo lectura de periodos cerrados

#### ⚙️ **Administrador**
- Vista de producción de todos los sastres
- Cálculo automático de liquidación con deducciones:
  - Seguro Social (configurable)
  - Préstamos
  - Otros descuentos
- Generación de volantes de pago (descargables)
- Cierre de periodos (bloquea edición)
- Gestión de historial mensual

#### 👑 **Dueño**
- Estadísticas generales del negocio
- Reportes detallados por sastre
- Análisis de garantías
- Configuración del sistema (PINs, porcentajes)
- Acceso total al historial

### ✅ Funcionalidades Especiales
- 🔒 Bloqueo automático de periodos cerrados
- 📊 Historial mensual guardado permanentemente
- 📱 Diseño responsive para móviles
- 💾 Almacenamiento local (sin necesidad de servidor)
- 📄 Exportación de volantes de pago

---

## 🚀 Cómo Usar la Aplicación

### Paso 1: Abrir la Aplicación
1. Haz doble clic en el archivo `index.html`
2. Se abrirá automáticamente en tu navegador predeterminado

### Paso 2: Seleccionar Rol
En la pantalla de inicio verás tres opciones:

#### Para Sastres:
1. Clic en **"Sastre"**
2. Ingresa tu nombre
3. Clic en **"Ingresar"**

#### Para Administradores:
1. Clic en **"Administrador"**
2. Ingresa el PIN: **1234** (predeterminado)
3. Clic en **"Ingresar"**

#### Para Dueños:
1. Clic en **"Dueño"**
2. Ingresa el PIN: **0000** (predeterminado)
3. Clic en **"Ingresar"**

---

## 📱 Uso para Sastres

### Registrar una Prenda
1. Completa el formulario de registro rápido:
   - **Número de Factura**: Ej. FAC-001
   - **Precio**: Monto en Bs
   - **Tipo de Trabajo**: Normal o Garantía
2. Si es garantía, aparecerá un campo para explicar qué falló (obligatorio)
3. Clic en **"Registrar Prenda"**

### Visualizar tu Producción
- Las tarjetas de colores muestran cuántas prendas y cuánto dinero has generado en cada periodo
- El total del mes se muestra en la tarjeta morada
- El historial muestra todas las prendas registradas

### Ver Historial Mensual
- Clic en el botón **"📊 Historial Mensual"** en la parte inferior
- Verás el resumen de todos los meses anteriores

### Eliminar una Prenda
- Solo puedes eliminar prendas de periodos no cerrados
- Clic en **"❌ Eliminar"** junto a la prenda
- Las prendas bloqueadas muestran un candado 🔒

---

## ⚙️ Uso para Administradores

### Ver Producción de Sastres
1. Ve a la pestaña **"Sastres"**
2. Verás un resumen de cada sastre con sus totales por color

### Calcular Liquidación
1. Ve a la pestaña **"Liquidación"**
2. Selecciona un sastre del menú desplegable
3. El sistema calcula automáticamente:
   - **Suma Bruta**: Total producido en el mes
   - **Seguro Social**: Según el porcentaje configurado
   - **Préstamos**: Ingresa el monto si aplica
   - **Otros Descuentos**: Ingresa monto y concepto
   - **Pago Neto**: Resultado final
4. Clic en **"Generar Volante de Pago"** para descargar el documento

### Cerrar un Periodo
1. Ve a la pestaña **"Periodos"**
2. Verás el periodo actual y los periodos cerrados
3. Clic en **"Cerrar Periodo Actual"**
4. ⚠️ **IMPORTANTE**: Esta acción es irreversible y bloqueará todos los registros de ese color

### Ver Historial
- Ve a la pestaña **"Historial"**
- Consulta el resumen de todos los meses guardados

---

## 👑 Uso para Dueños

### Estadísticas Generales
Al entrar verás 4 tarjetas con:
- Producción total del mes
- Sastres activos
- Garantías del mes
- Prendas procesadas

### Reportes Detallados
1. Sección **"📈 Reportes"** (activa por defecto)
2. Muestra producción detallada de cada sastre
3. Resalta las garantías con su explicación

### Configuración del Sistema
1. Clic en **"⚙️ Configuración"**
2. Puedes cambiar:
   - PIN del Administrador
   - PIN del Dueño
   - Porcentaje de Seguro Social
3. Clic en **"Guardar Configuración"**

### Historial Completo
- Clic en **"📊 Historial"**
- Consulta todos los meses guardados con detalles completos

---

## 🔐 Credenciales Predeterminadas

| Rol | PIN | Modificable |
|-----|-----|-------------|
| Sastre | Solo nombre | - |
| Administrador | 1234 | ✅ Sí (desde panel del Dueño) |
| Dueño | 0000 | ✅ Sí (desde panel del Dueño) |

---

## 💡 Consejos y Buenas Prácticas

### Para Sastres
- ✅ Registra las prendas apenas las termines
- ✅ Revisa tus totales diariamente
- ✅ Si es garantía, explica claramente qué falló
- ❌ No intentes eliminar prendas de periodos cerrados

### Para Administradores
- ✅ Cierra los periodos al finalizar cada decenio (día 10, 20 y 30/31)
- ✅ Genera los volantes antes de cerrar el periodo
- ✅ Verifica las deducciones antes de generar el volante
- ⚠️ El cierre de periodo es irreversible

### Para Dueños
- ✅ Revisa las garantías semanalmente para identificar patrones
- ✅ Cambia los PINs predeterminados por seguridad
- ✅ Consulta el historial para analizar tendencias
- ✅ Ajusta el porcentaje de seguro social según la ley vigente

---

## 📊 Flujo de Trabajo Recomendado

```
1. RECEPCIÓN DE PRENDA
   └─> Se etiqueta con número de factura

2. PRODUCCIÓN
   └─> Sastre trabaja la prenda

3. REGISTRO
   └─> Sastre abre la app
   └─> Registra factura y precio
   └─> Sistema asigna color automáticamente

4. CORTE DE PERIODO (Días 10, 20, 30/31)
   └─> Administrador revisa totales
   └─> Calcula liquidaciones
   └─> Genera volantes de pago
   └─> Cierra el periodo

5. PAGO
   └─> Se entrega volante al sastre
   └─> Se realiza el pago

6. CIERRE DE MES
   └─> Sistema guarda automáticamente en historial
   └─> Listo para el siguiente mes
```

---

## 🔧 Solución de Problemas

### "No puedo eliminar una prenda"
- El periodo está cerrado. Solo el administrador puede cerrar periodos.

### "No veo mi producción"
- Verifica que hayas iniciado sesión con tu nombre exacto.
- La producción se muestra solo del mes actual.

### "El volante no se descarga"
- Asegúrate de que tu navegador permita descargas.
- Revisa la carpeta de Descargas.

### "Olvidé el PIN"
- **Administrador/Dueño**: Abre el archivo `app.js` y busca las líneas:
  ```javascript
  adminPin: '1234',
  ownerPin: '0000',
  ```

### "Quiero reiniciar todo"
- Abre la consola del navegador (F12)
- Escribe: `localStorage.clear()`
- Presiona Enter
- Recarga la página (F5)

---

## 📱 Uso en Móvil

La aplicación está optimizada para celulares:

1. **Opción A**: Abre `index.html` desde el explorador de archivos del celular
2. **Opción B**: Sube los archivos a un servidor web gratuito como:
   - GitHub Pages
   - Netlify
   - Vercel
3. **Opción C**: Usa una app como "HTML Viewer" para Android

---

## 💾 Respaldo de Datos

Los datos se guardan en el navegador. Para hacer respaldo:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **"Application"** o **"Almacenamiento"**
3. En el menú lateral, clic en **"Local Storage"**
4. Copia todo el contenido
5. Guárdalo en un archivo de texto

Para restaurar:
1. Pega el contenido en **"Local Storage"**
2. Recarga la página

---

## 🎨 Personalización

### Cambiar Colores
Edita el archivo `styles.css` en las líneas:
```css
:root {
    --color-azul: #2196F3;
    --color-amarillo: #FFC107;
    --color-verde: #4CAF50;
    --color-rojo: #F44336;
}
```

### Cambiar Periodos
Edita el archivo `app.js` en la función `getPeriodoActual()`:
```javascript
if (dia >= 1 && dia <= 10) {
    return { nombre: 'Primer Decenio (1-10)', color: 'azul', codigo: 'azul' };
}
```

---

## 📄 Archivos del Sistema

```
📁 Sastreria_Gonzalez_Brother's/
├── 📄 index.html      (Estructura de la aplicación)
├── 📄 styles.css      (Estilos y diseño)
├── 📄 app.js          (Lógica y funcionalidad)
└── 📄 README.md       (Este archivo)
```

---

## 🆘 Soporte

Para ayuda adicional o reportar problemas:
- Revisa esta guía completa
- Verifica la consola del navegador (F12) para errores
- Prueba en otro navegador (Chrome, Firefox, Edge)

---

## 📝 Notas Importantes

- ⚠️ Los datos se guardan solo en el navegador actual
- ⚠️ No borres el caché/cookies del navegador o perderás los datos
- ⚠️ Haz respaldos periódicos del localStorage
- ✅ La aplicación funciona 100% sin internet
- ✅ No hay límite de sastres o prendas
- ✅ El historial se guarda permanentemente

---

## 🎉 ¡Listo para Usar!

La aplicación está completamente funcional. Solo abre `index.html` en tu navegador y comienza a usarla.

**¡Éxito con Gonzàlez Brother´s! 🧵👔**
