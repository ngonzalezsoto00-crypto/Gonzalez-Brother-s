// Configuración de Firebase para González Brother's Sastrería
// Configuración activa y lista para usar

const firebaseConfig = {
    apiKey: "AIzaSyA21eZVrafNgsBJO34HDEGP2d6YU9e3RfY",
    authDomain: "sastreria-gonzalez.firebaseapp.com",
    projectId: "sastreria-gonzalez",
    storageBucket: "sastreria-gonzalez.firebasestorage.app",
    messagingSenderId: "381370519950",
    appId: "1:381370519950:web:1697855bd4d01cf02394df",
    measurementId: "G-R0V6SG6EY6"
};

// Inicializar Firebase
let db = null;
let modoSincronizacion = localStorage.getItem('modoSincronizacion') || 'firebase'; // 'local', 'firebase', 'servidor'

// Obtener el nombre de la sede actual
function obtenerNombreSede() {
    const config = JSON.parse(localStorage.getItem('config') || '{}');
    return config.nombreSede || 'Sede Principal';
}

// Obtener el nombre de colección con prefijo de sede
function obtenerColeccionConSede(nombreColeccion) {
    const sede = obtenerNombreSede().replace(/\s+/g, '_').toLowerCase(); // "Sede Principal" -> "sede_principal"
    return `${sede}_${nombreColeccion}`;
}

function inicializarFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log('✅ Firebase inicializado correctamente');
            
            // Activar sincronización en tiempo real
            activarSincronizacionTiempoReal();
            actualizarIndicadorSync('conectado');
            
            return true;
        }
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        actualizarIndicadorSync('error');
        return false;
    }
    return false;
}

// Funciones de sincronización con Firebase
async function guardarEnFirebase(coleccion, datos) {
    if (modoSincronizacion !== 'firebase' || !db) return false;
    
    try {
        const coleccionConSede = obtenerColeccionConSede(coleccion);
        await db.collection(coleccionConSede).doc('datos').set(datos);
        console.log(`💾 Datos guardados en Firebase [${coleccionConSede}]:`, Object.keys(datos)[0]);
        return true;
    } catch (error) {
        console.error('Error guardando en Firebase:', error);
        return false;
    }
}

async function cargarDeFirebase(coleccion) {
    if (modoSincronizacion !== 'firebase' || !db) return null;
    
    try {
        const coleccionConSede = obtenerColeccionConSede(coleccion);
        let doc = await db.collection(coleccionConSede).doc('datos').get();
        
        // Si no existe con prefijo de sede, intentar cargar datos antiguos SIN prefijo
        if (!doc.exists) {
            console.log(`⚠️ No hay datos en [${coleccionConSede}], buscando en [${coleccion}] (datos antiguos)...`);
            doc = await db.collection(coleccion).doc('datos').get();
            
            if (doc.exists) {
                console.log(`📦 Encontrados datos antiguos en [${coleccion}], migrando a [${coleccionConSede}]...`);
                const datosAntiguos = doc.data();
                
                // Migrar datos antiguos al nuevo formato con sede
                await db.collection(coleccionConSede).doc('datos').set(datosAntiguos);
                console.log(`✅ Migración completada: [${coleccion}] → [${coleccionConSede}]`);
                
                return datosAntiguos;
            }
        } else {
            console.log(`📥 Datos cargados de Firebase [${coleccionConSede}]`);
            return doc.data();
        }
        
        return null;
    } catch (error) {
        console.error('Error cargando de Firebase:', error);
        return null;
    }
}

// Sincronización en tiempo real
function escucharCambiosFirebase(coleccion, callback) {
    if (modoSincronizacion !== 'firebase' || !db) return;
    
    db.collection(coleccion).doc('datos').onSnapshot((doc) => {
        if (doc.exists) {
            callback(doc.data());
        }
    });
}

// Funciones de sincronización híbrida (localStorage + Firebase/Servidor)
function guardarDatos(clave, datos) {
    // Siempre guardar en localStorage como backup
    localStorage.setItem(clave, JSON.stringify(datos));
    
    // Sincronizar según el modo
    if (modoSincronizacion === 'firebase') {
        guardarEnFirebase(clave, datos);
    } else if (modoSincronizacion === 'servidor') {
        guardarEnServidor(clave, datos);
    }
}

async function cargarDatos(clave) {
    let datos = null;
    
    // Intentar cargar según el modo
    if (modoSincronizacion === 'firebase') {
        datos = await cargarDeFirebase(clave);
    } else if (modoSincronizacion === 'servidor') {
        datos = await cargarDeServidor(clave);
    }
    
    // Si no hay datos en la nube, usar localStorage
    if (!datos) {
        const local = localStorage.getItem(clave);
        datos = local ? JSON.parse(local) : null;
    }
    
    return datos;
}

// Funciones para servidor local (implementar después)
async function guardarEnServidor(clave, datos) {
    const servidorURL = localStorage.getItem('servidorURL') || 'http://localhost:3000';
    
    try {
        const response = await fetch(`${servidorURL}/api/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clave, datos })
        });
        
        if (response.ok) {
            console.log(`Datos guardados en servidor: ${clave}`);
            return true;
        }
    } catch (error) {
        console.error('Error guardando en servidor:', error);
    }
    return false;
}

async function cargarDeServidor(clave) {
    const servidorURL = localStorage.getItem('servidorURL') || 'http://localhost:3000';
    
    try {
        const response = await fetch(`${servidorURL}/api/cargar/${clave}`);
        
        if (response.ok) {
            const datos = await response.json();
            console.log(`Datos cargados de servidor: ${clave}`);
            return datos;
        }
    } catch (error) {
        console.error('Error cargando de servidor:', error);
    }
    return null;
}

function cambiarModoSincronizacion(modo) {
    if (['local', 'firebase', 'servidor'].includes(modo)) {
        modoSincronizacion = modo;
        localStorage.setItem('modoSincronizacion', modo);
        
        if (modo === 'firebase') {
            inicializarFirebase();
        }
        
        console.log(`Modo de sincronización cambiado a: ${modo}`);
        return true;
    }
    return false;
}

// Sincronización en tiempo real para TODAS las colecciones
function activarSincronizacionTiempoReal() {
    if (!db || modoSincronizacion !== 'firebase') return;
    
    const sede = obtenerNombreSede();
    console.log(`🔄 Activando sincronización en tiempo real para: ${sede}`);
    
    // Función auxiliar para sincronizar una colección
    const sincronizarColeccion = (nombreColeccion, claveLocal, funcionRecargar) => {
        const coleccionConSede = obtenerColeccionConSede(nombreColeccion);
        db.collection(coleccionConSede).doc('datos').onSnapshot((doc) => {
            if (doc.exists) {
                const datosFirebase = doc.data();
                const claveDatos = Object.keys(datosFirebase)[0]; // Primera clave del objeto
                
                if (datosFirebase && datosFirebase[claveDatos]) {
                    const datosActuales = JSON.parse(localStorage.getItem(claveLocal) || '[]');
                    
                    // Solo actualizar si hay cambios
                    if (JSON.stringify(datosActuales) !== JSON.stringify(datosFirebase[claveDatos])) {
                        localStorage.setItem(claveLocal, JSON.stringify(datosFirebase[claveDatos]));
                        console.log(`📥 ${nombreColeccion} sincronizados:`, datosFirebase[claveDatos].length);
                        
                        // Recargar vista si existe la función
                        if (funcionRecargar && typeof window[funcionRecargar] === 'function') {
                            window[funcionRecargar]();
                        }
                        
                        actualizarIndicadorSync('sincronizado');
                        actualizarUltimaSync();
                    }
                }
            }
        }, (error) => {
            console.error(`❌ Error en sincronización de ${nombreColeccion}:`, error);
            actualizarIndicadorSync('error');
        });
    };
    
    // Sincronizar todas las colecciones
    sincronizarColeccion('facturas', 'facturas', 'cargarTodasLasFacturas');
    sincronizarColeccion('clientes', 'clientes', null);
    sincronizarColeccion('empleados', 'empleados', 'cargarListaEmpleados');
    sincronizarColeccion('sastres', 'sastres', 'cargarTrabajadoresSelect');
    sincronizarColeccion('senaladores', 'senaladores', 'cargarTrabajadoresSelect');
    sincronizarColeccion('prendas', 'prendas', null);
    
    // Sincronizar configuración
    const configColeccion = obtenerColeccionConSede('config');
    db.collection(configColeccion).doc('datos').onSnapshot((doc) => {
        if (doc.exists) {
            const configFirebase = doc.data();
            if (configFirebase) {
                localStorage.setItem('config', JSON.stringify(configFirebase));
                console.log('📥 Configuración sincronizada');
                actualizarIndicadorSync('sincronizado');
                actualizarUltimaSync();
            }
        }
    });
    
    console.log('✅ Sincronización en tiempo real activada para TODAS las colecciones');
}

function actualizarIndicadorSync(estado) {
    const indicador = document.getElementById('indicadorSync');
    if (!indicador) return;
    
    switch(estado) {
        case 'conectado':
            indicador.style.background = '#4CAF50'; // Verde
            indicador.title = 'Conectado a Firebase';
            break;
        case 'sincronizado':
            indicador.style.background = '#2196F3'; // Azul
            indicador.title = 'Sincronizado';
            setTimeout(() => {
                indicador.style.background = '#4CAF50';
                indicador.title = 'Conectado a Firebase';
            }, 2000);
            break;
        case 'sincronizando':
            indicador.style.background = '#FFC107'; // Amarillo
            indicador.title = 'Sincronizando...';
            break;
        case 'error':
            indicador.style.background = '#F44336'; // Rojo
            indicador.title = 'Error de conexión';
            break;
        default:
            indicador.style.background = '#ccc'; // Gris
            indicador.title = 'Sin sincronización';
    }
}

function actualizarUltimaSync() {
    const elemento = document.getElementById('ultimaSync');
    if (elemento) {
        const ahora = new Date();
        elemento.textContent = `Última sincronización: ${ahora.toLocaleTimeString('es-CO')}`;
    }
}

// Auto-inicializar Firebase
if (modoSincronizacion === 'firebase') {
    document.addEventListener('DOMContentLoaded', function() {
        inicializarFirebase();
    });
}
