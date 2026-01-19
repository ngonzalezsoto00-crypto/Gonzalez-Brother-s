# 🆘 Guía de Recuperación de Datos Perdidos

## ❓ ¿Qué Pasó?

Si acabas de perder los trabajadores que agregaste, **NO TE PREOCUPES**. Los datos probablemente están en uno de estos lugares:

### 🔍 Posibles Causas

1. **Actualización automática**: El sistema se actualizó y recargó la página
2. **Caché del navegador**: La versión en caché no tiene tus datos más recientes
3. **Modo incógnito**: Si abriste en modo privado, los datos están en la ventana normal
4. **Navegador diferente**: Los datos están en otro navegador (Chrome vs Edge vs Firefox)
5. **Sincronización**: Si cambiaste el modo de sincronización, puede haber conflicto

---

## 🔧 SOLUCIONES PASO A PASO

### ✅ Solución 1: Verificar Respaldos Automáticos (MÁS RÁPIDO)

La aplicación ahora crea respaldos automáticos antes de cada actualización.

**Pasos:**

1. Abre este archivo en tu navegador:
   ```
   recuperar-datos.html
   ```

2. Verás todos los respaldos disponibles con fechas

3. Busca el respaldo de **ANTES** de perder los datos

4. Haz clic en **"Ver Detalles"** para confirmar que tiene tus trabajadores

5. Haz clic en **"Restaurar Este Respaldo"**

6. Recarga la aplicación principal (`index.html`)

---

### ✅ Solución 2: Verificar en la Consola del Navegador

**Pasos:**

1. Abre la aplicación (`index.html`)

2. Presiona **F12** para abrir las herramientas de desarrollador

3. Ve a la pestaña **"Console"** (Consola)

4. Escribe este comando y presiona Enter:
   ```javascript
   JSON.parse(localStorage.getItem('empleados'))
   ```

5. **¿Aparecen tus trabajadores?**
   - **SÍ**: Los datos están ahí. Refresca la página (Ctrl + R)
   - **NO**: Pasa a la siguiente solución

6. También prueba:
   ```javascript
   JSON.parse(localStorage.getItem('sastres'))
   JSON.parse(localStorage.getItem('senaladores'))
   ```

---

### ✅ Solución 3: Limpiar Caché y Recargar

El navegador puede estar mostrando una versión antigua en caché.

**Pasos:**

1. Presiona **Ctrl + Shift + Supr** (Chrome/Edge) o **Ctrl + Shift + Delete** (Firefox)

2. Selecciona:
   - ✅ Imágenes y archivos en caché
   - ❌ NO marques "Cookies y datos de sitios" (perderías los datos reales)

3. Haz clic en **"Borrar datos"**

4. Cierra COMPLETAMENTE el navegador

5. Vuelve a abrir y entra a la aplicación

---

### ✅ Solución 4: Verificar en Otro Navegador/Ventana

**Pasos:**

1. ¿Habías abierto la aplicación en otro navegador antes?
   - Chrome, Edge, Firefox, etc. tienen datos SEPARADOS

2. ¿Estás en modo incógnito?
   - Abre una ventana NORMAL del navegador

3. ¿Abriste desde un acceso directo instalado?
   - Abre directamente el archivo `index.html`

---

### ✅ Solución 5: Revisar Respaldos Manuales

Si habías exportado datos antes:

1. Busca archivos `.json` con nombres como:
   - `sastrecontrol_backup_2026-01-18.json`
   - `respaldo_sastreria.json`

2. Abre `recuperar-datos.html` en el navegador

3. **(Próximamente)** Habrá un botón "Importar desde archivo"

**Importación manual:**

1. Abre el navegador y presiona **F12**

2. Ve a **Console**

3. Pega este código (reemplaza `...` con el contenido del archivo JSON):
   ```javascript
   const datos = {...contenido del archivo...};
   Object.entries(datos).forEach(([key, value]) => {
       localStorage.setItem(key, value);
   });
   location.reload();
   ```

---

## 🛡️ PREVENCIÓN FUTURA

### ✅ Protecciones Implementadas AHORA:

1. **Respaldo automático** antes de cada actualización
2. **Sistema de recuperación** (`recuperar-datos.html`)
3. **Logs en consola** para ver qué datos hay cargados
4. **Confirmación** antes de actualizar
5. **Mantiene 5 respaldos** automáticos

### 📋 Recomendaciones:

1. **Exporta regularmente**:
   - Abre `recuperar-datos.html`
   - Clic en "Exportar Todo (JSON)"
   - Guarda el archivo en un lugar seguro (USB, Drive, etc.)

2. **Crea respaldos manuales** antes de:
   - Actualizar la aplicación
   - Cambiar configuraciones importantes
   - Limpiar caché del navegador

3. **Usa siempre el mismo navegador** para la aplicación

4. **NO uses modo incógnito** para trabajar (solo para probar)

5. **Considera usar sincronización**:
   - **Firebase**: Los datos se guardan en la nube
   - **Servidor local**: Los datos se comparten en la red
   - Ver `GUIA_SINCRONIZACION.md`

---

## 🔍 Verificación de Datos Actual

Para ver qué datos tienes AHORA MISMO:

1. Presiona **F12** en la aplicación

2. Ve a la pestaña **"Application"** (Aplicación)

3. En el menú izquierdo: **Storage → Local Storage**

4. Verás todas las claves:
   - `empleados` - Lista de todos los trabajadores
   - `sastres` - Lista de sastres (puede estar vacía si usas empleados)
   - `senaladores` - Lista de señaladores
   - `prendas` - Prendas registradas
   - `facturas` - Facturas
   - `config` - Configuración
   - `respaldo_...` - Respaldos automáticos

5. Haz clic en cada una para ver su contenido

---

## 📞 ¿Aún No Encuentras los Datos?

### Última Opción: Verificar en Historial del Navegador

1. Presiona **Ctrl + H** (Historial)

2. Busca cuándo abriste la aplicación por última vez

3. ¿Fue en:
   - Un navegador diferente?
   - Una ventana incógnito?
   - Otro dispositivo?

---

## 💡 Tips Rápidos

### ✅ Para RECUPERAR datos perdidos:
```
1. Abre: recuperar-datos.html
2. Busca el respaldo más reciente ANTES de perder los datos
3. Restaura
4. Recarga index.html
```

### ✅ Para VERIFICAR datos actuales:
```
1. F12 en la aplicación
2. Console
3. Escribe: JSON.parse(localStorage.getItem('empleados'))
4. Enter
```

### ✅ Para PREVENIR pérdida futura:
```
1. Abre: recuperar-datos.html
2. Clic en "Exportar Todo (JSON)"
3. Guarda el archivo en lugar seguro
4. Repite cada semana
```

---

## 🎯 Checklist de Recuperación

Marca lo que ya probaste:

- [ ] Abrir `recuperar-datos.html` y revisar respaldos
- [ ] Verificar en Console del navegador con `localStorage.getItem('empleados')`
- [ ] Limpiar caché (Ctrl + Shift + Supr) sin borrar cookies
- [ ] Buscar en otros navegadores (Chrome, Edge, Firefox)
- [ ] Verificar que no estás en modo incógnito
- [ ] Revisar en Application → Local Storage (F12)
- [ ] Buscar archivos .json de exportaciones anteriores
- [ ] Reiniciar el navegador completamente
- [ ] Verificar en otro dispositivo si usas sincronización

---

## ✅ Cambios Implementados para Protección

### Versión 3.0.1 (2026-01-18)

**Nuevas protecciones:**

1. ✅ Respaldo automático antes de cada actualización del Service Worker
2. ✅ Función `crearRespaldoEmergencia()` en index.html
3. ✅ Mantiene los últimos 5 respaldos automáticos
4. ✅ Logs detallados en Console sobre datos cargados
5. ✅ Herramienta de recuperación (`recuperar-datos.html`)
6. ✅ Verificación de datos en `initializeApp()`
7. ✅ Confirmación mejorada antes de actualizar
8. ✅ NUNCA sobrescribe datos existentes al inicializar

**Archivos modificados:**

- `service-worker.js` - Versión 3.0.1 con comentarios claros
- `index.html` - Sistema de respaldos automáticos
- `app.js` - Verificación de datos al iniciar
- `recuperar-datos.html` - **NUEVA** herramienta de recuperación
- `RECUPERAR_DATOS.md` - **NUEVA** esta guía

---

## 🎁 Extra: Comandos Útiles de Consola

Abre la consola (F12 → Console) y usa estos comandos:

```javascript
// Ver todos los empleados
JSON.parse(localStorage.getItem('empleados'))

// Ver configuración
JSON.parse(localStorage.getItem('config'))

// Ver todos los respaldos disponibles
Object.keys(localStorage).filter(k => k.startsWith('respaldo_'))

// Ver último respaldo
localStorage.getItem('ultimoRespaldo')

// Exportar todo a un objeto
const backup = {};
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    backup[key] = localStorage.getItem(key);
}
console.log(JSON.stringify(backup, null, 2));
```

---

**¡TUS DATOS ESTÁN PROTEGIDOS!** 💪

La aplicación ahora crea respaldos automáticos y es mucho más segura.
