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
        await db.collection(coleccion).doc('datos').set(datos);
        console.log(`Datos guardados en Firebase: ${coleccion}`);
        return true;
    } catch (error) {
        console.error('Error guardando en Firebase:', error);
        return false;
    }
}

async function cargarDeFirebase(coleccion) {
    if (modoSincronizacion !== 'firebase' || !db) return null;
    
    try {
        const doc = await db.collection(coleccion).doc('datos').get();
        if (doc.exists) {
            console.log(`Datos cargados de Firebase: ${coleccion}`);
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

// Sincronización en tiempo real
function activarSincronizacionTiempoReal() {
    if (!db || modoSincronizacion !== 'firebase') return;
    
    console.log('🔄 Activando sincronización en tiempo real...');
    
    // Escuchar cambios en facturas
    db.collection('facturas').doc('datos').onSnapshot((doc) => {
        if (doc.exists) {
            const datosFirebase = doc.data();
            if (datosFirebase && datosFirebase.facturas) {
                const facturasActuales = JSON.parse(localStorage.getItem('facturas') || '[]');
                
                // Solo actualizar si hay cambios
                if (JSON.stringify(facturasActuales) !== JSON.stringify(datosFirebase.facturas)) {
                    localStorage.setItem('facturas', JSON.stringify(datosFirebase.facturas));
                    console.log('📥 Facturas sincronizadas:', datosFirebase.facturas.length);
                    
                    // Recargar la vista si está en la pantalla de facturas
                    if (typeof cargarTodasLasFacturas === 'function') {
                        cargarTodasLasFacturas();
                    }
                    
                    actualizarIndicadorSync('sincronizado');
                    actualizarUltimaSync();
                }
            }
        }
    }, (error) => {
        console.error('❌ Error en sincronización en tiempo real:', error);
        actualizarIndicadorSync('error');
    });
    
    // Escuchar cambios en clientes
    db.collection('clientes').doc('datos').onSnapshot((doc) => {
        if (doc.exists) {
            const datosFirebase = doc.data();
            if (datosFirebase && datosFirebase.clientes) {
                localStorage.setItem('clientes', JSON.stringify(datosFirebase.clientes));
                console.log('📥 Clientes sincronizados:', datosFirebase.clientes.length);
            }
        }
    });
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
