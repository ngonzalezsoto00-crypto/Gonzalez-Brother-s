# Guía de Sincronización - González Brother's Sastrería

## 📋 Opciones de Sincronización

Tu aplicación ahora tiene **3 modos de sincronización**:

### 1. 💾 Solo este dispositivo (SIN sincronización)
- **Uso**: Datos solo en este navegador
- **Configuración**: Ninguna
- **Ventajas**: Simple, sin configuración
- **Desventajas**: No comparte datos entre dispositivos

### 2. ☁️ Sincronización en la nube (Firebase)
- **Uso**: Todos los dispositivos comparten datos por internet
- **Configuración**: Requiere cuenta de Firebase (gratis)

#### Pasos para configurar Firebase:

1. **Crear proyecto Firebase** (gratis):
   - Ve a https://console.firebase.google.com
   - Clic en "Agregar proyecto"
   - Nombre: "Sastreria-Gonzalez"
   - Desactiva Google Analytics (opcional)

2. **Habilitar Firestore**:
   - En el menú, selecciona "Firestore Database"
   - Clic en "Crear base de datos"
   - Modo: "Empezar en modo de prueba"
   - Ubicación: "southamerica-east1" (São Paulo - más cerca)

3. **Obtener configuración**:
   - Ve a "Configuración del proyecto" (⚙️)
   - En "Tus apps", clic en el icono web (</>) 
   - Registra tu app con un nombre
   - Copia la configuración que aparece

4. **Pegar configuración**:
   - Abre el archivo `firebase-config.js`
   - Reemplaza los valores en `firebaseConfig` con los tuyos:
   ```javascript
   const firebaseConfig = {
       apiKey: "TU_API_KEY",
       authDomain: "tu-proyecto.firebaseapp.com",
       projectId: "tu-proyecto-id",
       // ... etc
   };
   ```

5. **Listo**: Selecciona modo "☁️ Firebase" en la pantalla de login

### 3. 🌐 Sincronización en red local (Servidor)
- **Uso**: Todos los dispositivos en la MISMA RED WiFi comparten datos
- **Configuración**: Requiere instalar Node.js y ejecutar servidor

#### Pasos para configurar servidor local:

1. **Instalar Node.js**:
   - Descarga desde https://nodejs.org (versión LTS)
   - Instala con opciones por defecto

2. **Instalar dependencias**:
   - Abre PowerShell en la carpeta del proyecto
   - Ejecuta:
   ```powershell
   npm install
   ```

3. **Iniciar servidor**:
   ```powershell
   npm start
   ```
   
   Verás un mensaje como:
   ```
   Servidor en puerto: 3000
   Accede desde: http://192.168.1.X:3000
   ```

4. **Configurar dispositivos**:
   - En cada computadora/tablet que use la app
   - Pantalla de login, selecciona "🌐 Servidor local"
   - Ingresa la IP del servidor (ej: `http://192.168.1.5:3000`)
   - Clic en "Probar Conexión"

5. **Listo**: Todos los dispositivos en la red compartirán datos

## 🔄 ¿Cuál usar?

| Característica | Solo local | Firebase | Servidor Local |
|----------------|------------|----------|----------------|
| Internet | ❌ No necesita | ✅ Requiere | ❌ No necesita |
| Costo | Gratis | Gratis hasta 50K lecturas/día | Gratis |
| Configuración | Ninguna | Media | Media |
| Velocidad | Muy rápida | Rápida | Muy rápida |
| Dispositivos | 1 | Ilimitados | Solo en misma red WiFi |
| Acceso remoto | ❌ No | ✅ Desde cualquier lugar | ❌ Solo red local |

## 📝 Recomendaciones:

- **1 computadora**: Usa "Solo local"
- **Varias computadoras con internet**: Usa "Firebase"
- **Varias computadoras SIN internet confiable**: Usa "Servidor local"

## 🔄 Actualizaciones Automáticas

La aplicación ahora detecta y aplica actualizaciones automáticamente:

- **Cada 30 segundos** verifica si hay una nueva versión
- **Notifica al usuario** cuando hay actualizaciones disponibles
- **Se actualiza automáticamente** al aceptar o cerrar/reabrir la app

### Si la app no se actualiza:

1. **Cerrar completamente** la aplicación y volver a abrirla
2. **Limpiar caché** del navegador:
   - Chrome: Ctrl + Shift + Supr → "Imágenes y archivos en caché"
   - En móvil: Configuración → Privacidad → Borrar datos
3. **Reinstalar la PWA** si está instalada en el escritorio/inicio

📖 **Más información**: Ver archivo `COMO_ACTUALIZAR.md`

## 🆘 Soporte:

Si tienes problemas:
1. Verifica que el modo esté seleccionado correctamente
2. En modo servidor, verifica que todas las PCs estén en la misma red WiFi
3. En modo Firebase, verifica tu configuración en `firebase-config.js`
4. Para problemas de actualización, consulta `COMO_ACTUALIZAR.md`
