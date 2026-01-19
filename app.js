// ============================================
// SISTEMA DE GESTIÓN - GONZÀLEZ BROTHER´S
// SastreControl: Gestión de Producción
// ============================================

// Estado Global
let currentUser = null;
let currentRole = null;
let modoOscuro = localStorage.getItem('modoOscuro') === 'true' || false;
let notificacionesActivas = [];

// Prevenir cierre accidental de la app
window.addEventListener('beforeunload', function (e) {
    if (currentUser) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Perderás la sesión actual.';
        return e.returnValue;
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    cargarModoSincronizacion();
    // Crear respaldo automático cada 5 minutos
    setInterval(crearRespaldoAutomatico, 300000);
});

async function initializeApp() {
    // IMPORTANTE: Nunca sobrescribir datos existentes
    // Solo crear estructuras si NO existen
    
    // Cargar datos de Firebase si está configurado
    await cargarDatosDeFirebase();
    
    // Crear configuración inicial si no existe
    if (!localStorage.getItem('config')) {
        const defaultConfig = {
            adminPin: '1234',
            ownerPin: '0000',
            salud: 4,
            pension: 4,
            nombreSede: 'Sede Principal',
            primerUso: true
        };
        localStorage.setItem('config', JSON.stringify(defaultConfig));
    }
    
    // Aplicar modo oscuro si está activado
    if (modoOscuro) {
        document.body.classList.add('dark-mode');
    }
    
    // Iniciar sistema de notificaciones
    iniciarSistemaNotificaciones();

    // Lista de sastres - SOLO crear si no existe
    if (!localStorage.getItem('sastres')) {
        localStorage.setItem('sastres', JSON.stringify([]));
    }

    // Lista de señaladores - SOLO crear si no existe
    if (!localStorage.getItem('senaladores')) {
        localStorage.setItem('senaladores', JSON.stringify([]));
    }

    // Lista de empleados - SOLO crear si no existe
    if (!localStorage.getItem('empleados')) {
        localStorage.setItem('empleados', JSON.stringify([]));
    }
    
    // Verificar y reportar datos existentes
    console.log('📊 Datos cargados:', {
        empleados: JSON.parse(localStorage.getItem('empleados') || '[]').length,
        sastres: JSON.parse(localStorage.getItem('sastres') || '[]').length,
        senaladores: JSON.parse(localStorage.getItem('senaladores') || '[]').length,
        prendas: JSON.parse(localStorage.getItem('prendas') || '[]').length,
        facturas: JSON.parse(localStorage.getItem('facturas') || '[]').length,
        clientes: JSON.parse(localStorage.getItem('clientes') || '[]').length
    });

    // Crear estructura de datos si no existe
    if (!localStorage.getItem('prendas')) {
        localStorage.setItem('prendas', JSON.stringify([]));
    }

    if (!localStorage.getItem('facturas')) {
        localStorage.setItem('facturas', JSON.stringify([]));
    }

    if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify([]));
    }

    if (!localStorage.getItem('periodosCerrados')) {
        localStorage.setItem('periodosCerrados', JSON.stringify([]));
    }

    if (!localStorage.getItem('historialMensual')) {
        localStorage.setItem('historialMensual', JSON.stringify({}));
    }

    // Contador de facturas
    if (!localStorage.getItem('contadorFacturas')) {
        localStorage.setItem('contadorFacturas', '1');
    }

    // Pre-cargar select de sastres para que esté listo
    setTimeout(() => {
        const select = document.getElementById('sastreSelect');
        if (select) {
            cargarSastresSelect();
        }
    }, 100);

    showScreen('loginScreen');
}

// ============================================
// SISTEMA DE NAVEGACIÓN
// ============================================

function showScreen(screenId) {
    console.log('showScreen llamado con ID:', screenId); // Debug
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        console.log('Removiendo active de:', screen.id); // Debug
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Pantalla activada:', screenId); // Debug
        console.log('Clases de la pantalla:', targetScreen.className); // Debug
    } else {
        console.error('ERROR: No se encontró la pantalla con ID:', screenId); // Debug
    }
}

function selectRole(role) {
    currentRole = role;
    showScreen('authScreen');
    
    // Mostrar formulario correspondiente
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });

    if (role === 'domiciliario') {
        document.getElementById('authTitle').textContent = 'Domiciliario - Iniciar Sesión';
        document.getElementById('domiciliarioAuth').style.display = 'block';
        cargarTrabajadoresSelect('Domiciliario');
    } else if (role === 'senalador') {
        document.getElementById('authTitle').textContent = 'Señalador - Iniciar Sesión';
        document.getElementById('senaladorAuth').style.display = 'block';
        cargarTrabajadoresSelect('Señalador');
    } else if (role === 'sastre') {
        document.getElementById('authTitle').textContent = 'Sastre - Iniciar Sesión';
        document.getElementById('sastreAuth').style.display = 'block';
        cargarTrabajadoresSelect('Sastre');
    } else if (role === 'admin') {
        document.getElementById('authTitle').textContent = 'Administrador - Iniciar Sesión';
        document.getElementById('adminAuth').style.display = 'block';
    } else if (role === 'owner') {
        document.getElementById('authTitle').textContent = 'Dueño - Iniciar Sesión';
        document.getElementById('ownerAuth').style.display = 'block';
    }
}

function cargarTrabajadoresSelect(rol) {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const trabajadores = empleados.filter(e => e.rol === rol && e.activo !== false);
    
    console.log(`Cargando trabajadores con rol ${rol}:`, trabajadores);
    
    let selectId;
    if (rol === 'Sastre') selectId = 'sastreSelect';
    else if (rol === 'Domiciliario') selectId = 'domiciliarioSelect';
    else if (rol === 'Señalador') selectId = 'senaladorSelect';
    
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`Select de ${rol} no encontrado`);
        return;
    }
    
    if (trabajadores.length === 0) {
        select.innerHTML = `<option value="">-- No hay ${rol}s registrados --</option>`;
        console.warn(`No hay ${rol}s registrados en el sistema`);
    } else {
        select.innerHTML = '<option value="">-- Seleccionar --</option>' +
            trabajadores.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
        console.log(`Select actualizado con ${trabajadores.length} ${rol}s:`, trabajadores.map(t => t.nombre).join(', '));
    }
}

function loginTrabajador(rol) {
    let selectId, pinId, screenDestino, initFunction;
    
    if (rol === 'Sastre') {
        selectId = 'sastreSelect';
        pinId = 'sastrePin';
        screenDestino = 'sastreScreen';
        initFunction = initSastreScreen;
    } else if (rol === 'Domiciliario') {
        selectId = 'domiciliarioSelect';
        pinId = 'domiciliarioPin';
        screenDestino = 'domiciliarioScreen';
        initFunction = initDomiciliarioScreen;
    } else if (rol === 'Señalador') {
        selectId = 'senaladorSelect';
        pinId = 'senaladorPin';
        screenDestino = 'senaladorScreen';
        initFunction = initSenaladorScreen;
    }
    
    const trabajadorId = document.getElementById(selectId).value;
    const pin = document.getElementById(pinId).value;
    
    if (!trabajadorId) {
        alert(`Selecciona un ${rol}`);
        return;
    }
    
    if (!pin) {
        alert('Ingresa tu PIN');
        return;
    }
    
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const trabajador = empleados.find(e => e.id == trabajadorId);
    
    if (!trabajador) {
        alert('Trabajador no encontrado');
        return;
    }
    
    if (pin !== trabajador.pin) {
        alert('PIN incorrecto');
        return;
    }
    
    if (trabajador.activo === false) {
        alert('⚠️ Tu cuenta está inactiva. Contacta al Administrador.');
        return;
    }
    
    // Si es señalador, agregarlo a la lista de señaladores
    if (rol === 'Señalador') {
        const senaladores = JSON.parse(localStorage.getItem('senaladores') || '[]');
        if (!senaladores.includes(trabajador.nombre)) {
            senaladores.push(trabajador.nombre);
            localStorage.setItem('senaladores', JSON.stringify(senaladores));
        }
    }
    
    currentUser = trabajador.nombre;
    showScreen(screenDestino);
    if (initFunction) initFunction();
}

function backToLogin() {
    showScreen('loginScreen');
    currentRole = null;
}

function logout() {
    currentUser = null;
    currentRole = null;
    showScreen('loginScreen');
}

// ============================================
// SISTEMA DE RESPALDO Y PERSISTENCIA
// ============================================

function crearRespaldoAutomatico() {
    try {
        const timestamp = new Date().toISOString();
        const datosCompletos = {
            timestamp: timestamp,
            version: '1.0',
            config: localStorage.getItem('config'),
            sastres: localStorage.getItem('sastres'),
            senaladores: localStorage.getItem('senaladores'),
            empleados: localStorage.getItem('empleados'),
            prendas: localStorage.getItem('prendas'),
            facturas: localStorage.getItem('facturas'),
            clientes: localStorage.getItem('clientes'),
            periodosCerrados: localStorage.getItem('periodosCerrados'),
            historialMensual: localStorage.getItem('historialMensual'),
            contadorFacturas: localStorage.getItem('contadorFacturas')
        };
        
        // Guardar en localStorage con clave de respaldo
        localStorage.setItem('respaldo_automatico', JSON.stringify(datosCompletos));
        localStorage.setItem('ultima_fecha_respaldo', timestamp);
        
        console.log('✅ Respaldo automático creado:', timestamp);
    } catch (error) {
        console.error('Error al crear respaldo automático:', error);
    }
}

function exportarDatos() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const datosCompletos = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            config: localStorage.getItem('config'),
            sastres: localStorage.getItem('sastres'),
            senaladores: localStorage.getItem('senaladores'),
            empleados: localStorage.getItem('empleados'),
            prendas: localStorage.getItem('prendas'),
            facturas: localStorage.getItem('facturas'),
            clientes: localStorage.getItem('clientes'),
            periodosCerrados: localStorage.getItem('periodosCerrados'),
            historialMensual: localStorage.getItem('historialMensual'),
            contadorFacturas: localStorage.getItem('contadorFacturas')
        };
        
        const dataStr = JSON.stringify(datosCompletos, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Respaldo_GonzalezBrothers_${timestamp}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('✅ Datos exportados exitosamente');
    } catch (error) {
        alert('❌ Error al exportar datos: ' + error.message);
    }
}

function importarDatos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const datos = JSON.parse(event.target.result);
                
                if (!confirm('⚠️ ADVERTENCIA: Esto reemplazará todos los datos actuales. ¿Estás seguro?')) {
                    return;
                }
                
                // Restaurar todos los datos
                if (datos.config) localStorage.setItem('config', datos.config);
                if (datos.sastres) localStorage.setItem('sastres', datos.sastres);
                if (datos.senaladores) localStorage.setItem('senaladores', datos.senaladores);
                if (datos.empleados) localStorage.setItem('empleados', datos.empleados);
                if (datos.prendas) localStorage.setItem('prendas', datos.prendas);
                if (datos.facturas) localStorage.setItem('facturas', datos.facturas);
                if (datos.clientes) localStorage.setItem('clientes', datos.clientes);
                if (datos.periodosCerrados) localStorage.setItem('periodosCerrados', datos.periodosCerrados);
                if (datos.historialMensual) localStorage.setItem('historialMensual', datos.historialMensual);
                if (datos.contadorFacturas) localStorage.setItem('contadorFacturas', datos.contadorFacturas);
                
                alert('✅ Datos importados exitosamente. La página se recargará.');
                location.reload();
            } catch (error) {
                alert('❌ Error al importar datos: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function restaurarRespaldo() {
    try {
        const respaldo = localStorage.getItem('respaldo_automatico');
        if (!respaldo) {
            alert('No hay respaldo automático disponible');
            return;
        }
        
        if (!confirm('⚠️ Esto restaurará el último respaldo automático. ¿Continuar?')) {
            return;
        }
        
        const datos = JSON.parse(respaldo);
        
        // Restaurar todos los datos
        if (datos.config) localStorage.setItem('config', datos.config);
        if (datos.sastres) localStorage.setItem('sastres', datos.sastres);
        if (datos.senaladores) localStorage.setItem('senaladores', datos.senaladores);
        if (datos.empleados) localStorage.setItem('empleados', datos.empleados);
        if (datos.prendas) localStorage.setItem('prendas', datos.prendas);
        if (datos.facturas) localStorage.setItem('facturas', datos.facturas);
        if (datos.clientes) localStorage.setItem('clientes', datos.clientes);
        if (datos.periodosCerrados) localStorage.setItem('periodosCerrados', datos.periodosCerrados);
        if (datos.historialMensual) localStorage.setItem('historialMensual', datos.historialMensual);
        if (datos.contadorFacturas) localStorage.setItem('contadorFacturas', datos.contadorFacturas);
        
        const fechaRespaldo = localStorage.getItem('ultima_fecha_respaldo');
        alert(`✅ Respaldo restaurado exitosamente.\nFecha: ${new Date(fechaRespaldo).toLocaleString()}\nLa página se recargará.`);
        location.reload();
    } catch (error) {
        alert('❌ Error al restaurar respaldo: ' + error.message);
    }
}

// ============================================
// NOTIFICACIÓN WHATSAPP
// ============================================

function enviarNotificacionWhatsApp(factura, prenda) {
    // Obtener el celular del cliente desde la factura
    const celular = factura.cliente?.celular || factura.celular;
    
    if (!celular) {
        console.log('No se pudo enviar WhatsApp: cliente sin número');
        return;
    }
    
    // Limpiar el número (quitar espacios, guiones, etc.)
    const numeroLimpio = celular.replace(/\D/g, '');
    
    // Crear mensaje personalizado
    const mensaje = `🎉 *¡Buenas noticias!*\n\n` +
        `Su prenda ya está lista en *González Brother's Sastrería*\n\n` +
        `📋 *Detalles:*\n` +
        `• Factura: #${factura.numero}\n` +
        `• Cliente: ${factura.cliente?.nombre || factura.nombre}\n` +
        `• Trabajo: ${prenda.tipo === 'garantia' ? 'Garantía' : 'Normal'}\n` +
        `• Completado por: ${prenda.sastre}\n\n` +
        `✅ *Puede pasar a recoger su prenda*\n\n` +
        `📍 Hecho a Medida - Desde 2026\n` +
        `¡Gracias por confiar en nosotros!`;
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear URL de WhatsApp (formato internacional sin +)
    const urlWhatsApp = `https://wa.me/57${numeroLimpio}?text=${mensajeCodificado}`;
    
    // Mostrar confirmación y abrir WhatsApp
    if (confirm(`📱 ¿Deseas enviar notificación por WhatsApp a ${factura.cliente?.nombre || factura.nombre}?\n\nNúmero: ${celular}`)) {
        // Usar location.href para que no cierre la app en celular
        window.location.href = urlWhatsApp;
    }
}

// ============================================
// AUTENTICACIÓN
// ============================================

// Las funciones de login se eliminan y se reemplazan por loginTrabajador()
// loginSenalador y loginSastre ya no son necesarias

function loginAdmin() {
    const pin = document.getElementById('adminPin').value;
    const config = JSON.parse(localStorage.getItem('config'));
    
    if (pin === config.adminPin) {
        currentUser = 'Administrador';
        showScreen('adminScreen');
        initAdminScreen();
    } else {
        alert('PIN incorrecto');
    }
}

function loginOwner() {
    const pin = document.getElementById('ownerPin').value;
    const config = JSON.parse(localStorage.getItem('config'));
    
    if (pin === config.ownerPin) {
        currentUser = 'Dueño';
        showScreen('ownerScreen');
        initOwnerScreen();
    } else {
        alert('PIN incorrecto');
    }
}

// ============================================
// SISTEMA DE PERIODOS Y COLORES
// ============================================

function getPeriodoActual() {
    const now = new Date();
    const dia = now.getDate();
    
    if (dia >= 1 && dia <= 10) {
        return { nombre: 'Primer Decenio (1-10)', color: 'azul', codigo: 'azul' };
    } else if (dia >= 11 && dia <= 20) {
        return { nombre: 'Segundo Decenio (11-20)', color: 'amarillo', codigo: 'amarillo' };
    } else {
        return { nombre: 'Tercer Decenio (21-30/31)', color: 'verde', codigo: 'verde' };
    }
}

function getColorPrenda(tipo, fecha) {
    if (tipo === 'garantia') {
        return 'rojo';
    }
    
    const dia = new Date(fecha).getDate();
    if (dia >= 1 && dia <= 10) {
        return 'azul';
    } else if (dia >= 11 && dia <= 20) {
        return 'amarillo';
    } else {
        return 'verde';
    }
}

function isPeriodoCerrado(color) {
    const periodosCerrados = JSON.parse(localStorage.getItem('periodosCerrados') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    return periodosCerrados.some(p => 
        p.mes === mesActual && p.color === color
    );
}

// ============================================
// DASHBOARD DEL DOMICILIARIO
// ============================================

function initDomiciliarioScreen() {
    console.log('Inicializando pantalla domiciliario para:', currentUser);
    document.getElementById('domiciliarioNameDisplay').textContent = currentUser;
    cargarSenaladores('domSenaladorAsignado');
}

function cargarSenaladores(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const senaladores = empleados.filter(e => e.rol === 'Señalador' && e.estado === 'activo');
    
    senaladores.forEach(s => {
        const option = document.createElement('option');
        option.value = s.nombre;
        option.textContent = s.nombre;
        select.appendChild(option);
    });
}

function buscarClientePorCedulaDom() {
    const cedula = document.getElementById('domClienteCedula').value.trim();
    if (!cedula) {
        alert('Por favor, ingresa una cédula');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const cliente = clientes.find(c => c.cedula === cedula);
    
    if (cliente) {
        document.getElementById('domClienteNombre').value = cliente.nombre;
        document.getElementById('domClienteCelular').value = cliente.celular;
        document.getElementById('domClienteDireccion').value = cliente.direccion;
        alert('¡Cliente encontrado!');
    } else {
        alert('Cliente no encontrado. Por favor, ingresa los datos manualmente.');
    }
}

function registrarFacturaDomiciliario(event) {
    event.preventDefault();
    
    // Obtener datos del cliente
    const cedula = document.getElementById('domClienteCedula').value.trim();
    const nombre = document.getElementById('domClienteNombre').value.trim();
    const celular = document.getElementById('domClienteCelular').value.trim();
    const direccion = document.getElementById('domClienteDireccion').value.trim();
    const senalador = document.getElementById('domSenaladorAsignado').value;
    
    // Obtener datos del trabajo
    const descripcion = document.getElementById('domTrabajoDescripcion').value.trim();
    const precioTotal = parseFloat(document.getElementById('domPrecioTotal').value);
    const abono = parseFloat(document.getElementById('domAbono').value);
    const estadoPago = document.getElementById('domEstadoPago').value;
    
    // Validaciones
    if (!cedula || !nombre || !celular || !direccion || !senalador) {
        alert('Por favor, completa todos los datos del cliente');
        return;
    }
    
    if (!descripcion || !precioTotal) {
        alert('Por favor, completa los detalles del trabajo');
        return;
    }
    
    // Guardar o actualizar cliente
    let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const clienteExistente = clientes.findIndex(c => c.cedula === cedula);
    
    const clienteData = {
        cedula,
        nombre,
        celular,
        direccion,
        fechaRegistro: new Date().toISOString()
    };
    
    if (clienteExistente !== -1) {
        clientes[clienteExistente] = clienteData;
    } else {
        clientes.push(clienteData);
    }
    guardarYSincronizar('clientes', clientes);
    
    // Crear factura
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const numeroFactura = facturas.length + 1;
    const saldo = precioTotal - abono;
    
    const factura = {
        id: Date.now(),
        numero: numeroFactura,
        fecha: new Date().toISOString(),
        cliente: {
            cedula,
            nombre,
            celular,
            direccion
        },
        senalador: senalador,
        descripcion: descripcion,
        precioTotal: precioTotal,
        abono: abono,
        saldo: saldo,
        estadoPago: estadoPago,
        creadoPor: currentUser,
        rolCreador: 'domiciliario',
        completada: false,
        prendas: []
    };
    
    facturas.push(factura);
    guardarYSincronizar('facturas', facturas);
    
    alert(`✅ ¡Factura #${numeroFactura} creada exitosamente!\nCliente: ${nombre}\nTotal: $${precioTotal.toLocaleString('es-CO')}\nAbono: $${abono.toLocaleString('es-CO')}\nSaldo: $${saldo.toLocaleString('es-CO')}`);
    
    // Limpiar formulario
    event.target.reset();
    document.getElementById('domEstadoPago').value = 'pendiente';
}

function cargarEstadisticasDomiciliario() {
    console.log('Cargando estadísticas del domiciliario');
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    const facturasCompletadas = facturas.filter(f => 
        f.completada && 
        f.fecha.slice(0, 7) === mesActual
    ).length;
    
    console.log('Facturas completadas:', facturasCompletadas);
}

// ============================================
// DASHBOARD DEL SEÑALADOR
// ============================================

function initSenaladorScreen() {
    document.getElementById('senaladorNameDisplay').textContent = currentUser;
    cargarEstadisticasSenalador();
}

function cargarEstadisticasSenalador() {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    const misFacturas = facturas.filter(f => 
        f.senalador === currentUser && 
        f.fecha.slice(0, 7) === mesActual
    );
    
    const totalFacturas = misFacturas.length;
    const totalRecepcionado = misFacturas.reduce((sum, f) => sum + f.precio, 0);
    
    document.getElementById('totalFacturasSenalador').textContent = totalFacturas;
    document.getElementById('totalRecepcionadoSenalador').textContent = formatearPesos(totalRecepcionado);
}

function generarNumeroFactura() {
    const contador = parseInt(localStorage.getItem('contadorFacturas') || '1');
    const numero = `FAC-${String(contador).padStart(6, '0')}`;
    localStorage.setItem('contadorFacturas', (contador + 1).toString());
    return numero;
}

function buscarFacturas() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    buscarFacturasGeneral(query, 'resultadosBusqueda');
}

function buscarFacturasGeneral(query, containerId) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    
    if (!query) {
        document.getElementById(containerId).innerHTML = '<p style="text-align: center; color: #999;">Ingresa un término de búsqueda</p>';
        return;
    }
    
    const resultados = facturas.filter(f => 
        f.numero.toLowerCase().includes(query) ||
        f.nombre.toLowerCase().includes(query) ||
        f.cedula.includes(query) ||
        f.celular.includes(query)
    );
    
    mostrarResultadosFacturas(resultados, containerId);
}

function mostrarResultadosFacturas(facturas, containerId) {
    const container = document.getElementById(containerId);
    
    if (facturas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron resultados</p>';
        return;
    }
    
    let tabla = `
        <table>
            <thead>
                <tr>
                    <th>Factura</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Trabajo</th>
                    <th>Precio</th>
                    <th>Saldo</th>
                    <th>Estado Prenda</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    facturas.forEach(f => {
        const fecha = new Date(f.fecha);
        const estadoPrenda = f.estado || 'Recibida';
        const colorEstado = {
            'Recibida': '#2196F3',
            'En Proceso': '#FF9800',
            'Lista': '#4CAF50',
            'Entregada': '#9C27B0'
        }[estadoPrenda] || '#666';
        
        tabla += `
            <tr>
                <td><strong>${f.numero}</strong></td>
                <td>${fecha.toLocaleDateString()}</td>
                <td>
                    ${f.nombre}
                    <button onclick="verHistorialCliente('${f.cedula}')" style="margin-left: 5px; padding: 2px 6px; font-size: 0.8em; background: #E3F2FD; border: 1px solid #2196F3; border-radius: 4px; cursor: pointer;">📋</button>
                </td>
                <td style="max-width: 200px;">${f.trabajo}</td>
                <td>${formatearPesos(f.precio)}</td>
                <td>${formatearPesos(f.saldo)}</td>
                <td>
                    <select onchange="cambiarEstadoPrenda('${f.numero}', this.value)" style="padding: 4px; border: 2px solid ${colorEstado}; border-radius: 5px; background: ${colorEstado}; color: white; font-weight: bold; cursor: pointer;">
                        <option value="Recibida" ${estadoPrenda === 'Recibida' ? 'selected' : ''}>📦 Recibida</option>
                        <option value="En Proceso" ${estadoPrenda === 'En Proceso' ? 'selected' : ''}>🔧 En Proceso</option>
                        <option value="Lista" ${estadoPrenda === 'Lista' ? 'selected' : ''}>✅ Lista</option>
                        <option value="Entregada" ${estadoPrenda === 'Entregada' ? 'selected' : ''}>🎁 Entregada</option>
                    </select>
                </td>
                <td style="white-space: nowrap; position: relative; z-index: 10; pointer-events: auto;">
                    <button onclick="abrirFacturaCompleta('${f.numero}'); event.stopPropagation();" class="btn-ver" style="padding: 10px 18px; margin: 2px; background: #2196F3; color: white; border: 2px solid #1976D2; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; position: relative; z-index: 100; pointer-events: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="Ver detalles">👁️ VER</button>
                    <button onclick="enviarPorWhatsApp('${f.numero}'); event.stopPropagation();" class="btn-whatsapp" style="padding: 10px 18px; margin: 2px; background: #25D366; color: white; border: 2px solid #20BA5A; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; position: relative; z-index: 100; pointer-events: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="Enviar por WhatsApp">💬</button>
                    <button onclick="generarQRFactura('${f.numero}'); event.stopPropagation();" class="btn-qr" style="padding: 10px 18px; margin: 2px; background: #9C27B0; color: white; border: 2px solid #7B1FA2; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; position: relative; z-index: 100; pointer-events: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="Generar QR">📱</button>
                </td>
            </tr>
        `;
    });
    
    tabla += `</tbody></table>`;
    container.innerHTML = tabla;
}

function imprimirFactura(factura) {
    // Ahora en lugar de descargar automáticamente, mostramos vista previa
    facturaActualParaDescargar = factura;
    
    const fecha = new Date(factura.fecha);
    const contenido = `
╔════════════════════════════════════════╗
║   GONZÀLEZ BROTHER'S - SASTRERÍA      ║
║           FACTURA                      ║
╚════════════════════════════════════════╝

Factura #: ${factura.numero}
Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}

─────────── DATOS DEL CLIENTE ───────────
Nombre:     ${factura.nombre}
Cédula:     ${factura.cedula}
Celular:    ${factura.celular}
Dirección:  ${factura.direccion}

──────────── DESCRIPCIÓN ────────────────
${factura.trabajo}

──────────── VALORES ────────────────────
Precio Total:      ${formatearPesos(factura.precio)} COP
Abono:             ${formatearPesos(factura.abono)} COP
Saldo:             ${formatearPesos(factura.saldo)} COP
Estado de Pago:    ${factura.estadoPago.toUpperCase()}

──────────────────────────────────────────
Recepcionado por: ${factura.senalador || 'N/A'}


__________________________________________
Firma del Cliente

    `;
    
    // Mostrar en modal en lugar de descargar automáticamente
    document.getElementById('facturaPreview').textContent = contenido;
    document.getElementById('facturaModal').style.display = 'flex';
}

function imprimirFacturaPorNumero(numero) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numero);
    if (factura) {
        imprimirFactura(factura);
    }
}

function verFacturaDetalle(numero) {
    abrirFacturaCompleta(numero);
}

// ============================================
// DASHBOARD DEL SASTRE
// ============================================

function initSastreScreen() {
    document.getElementById('sastreNameDisplay').textContent = currentUser;
    
    // Cargar select de sastres
    cargarSastresSelect();
    
    // Mostrar periodo actual
    const periodo = getPeriodoActual();
    const periodoDiv = document.getElementById('periodoActual');
    periodoDiv.querySelector('.periodo-color').style.backgroundColor = getColorValue(periodo.codigo);
    periodoDiv.querySelector('.periodo-text').textContent = periodo.nombre;
    
    // Listener para tipo de trabajo
    document.getElementById('tipoTrabajo').addEventListener('change', function() {
        const garantiaNote = document.getElementById('garantiaNote');
        if (this.value === 'garantia') {
            garantiaNote.style.display = 'block';
            document.getElementById('notaGarantia').required = true;
        } else {
            garantiaNote.style.display = 'none';
            document.getElementById('notaGarantia').required = false;
        }
    });
    
    actualizarProduccionSastre();
}

function buscarFacturaInfo() {
    const numeroFactura = document.getElementById('facturaInput').value.trim();
    if (!numeroFactura) {
        alert('Ingresa un número de factura');
        return;
    }
    
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero.toLowerCase() === numeroFactura.toLowerCase());
    
    if (!factura) {
        alert('❌ Factura no encontrada. Verifica el número.');
        document.getElementById('infoFactura').style.display = 'none';
        return;
    }
    
    document.getElementById('infoCliente').textContent = `${factura.nombre} (${factura.cedula})`;
    document.getElementById('infoTrabajo').textContent = factura.trabajo;
    document.getElementById('infoPrecio').textContent = formatearPesos(factura.precio);
    document.getElementById('infoFactura').style.display = 'block';
}

function registrarTrabajoSastre(event) {
    event.preventDefault();
    
    const numeroFactura = document.getElementById('facturaInput').value.trim();
    const tipo = document.getElementById('tipoTrabajo').value;
    const notaGarantia = document.getElementById('notaGarantia').value.trim();
    
    // Validar garantía
    if (tipo === 'garantia' && !notaGarantia) {
        alert('Debes ingresar una nota explicando qué falló en la garantía');
        return;
    }
    
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero.toLowerCase() === numeroFactura.toLowerCase());
    
    if (!factura) {
        alert('❌ Factura no encontrada. Busca la factura primero.');
        return;
    }
    
    const fecha = new Date().toISOString();
    const color = getColorPrenda(tipo, fecha);
    
    // Verificar si el periodo está cerrado
    if (isPeriodoCerrado(color)) {
        alert('Este periodo ya está cerrado. No puedes agregar más trabajos.');
        return;
    }
    
    const prenda = {
        id: Date.now(),
        factura: numeroFactura,
        precio: factura.precio,
        tipo,
        color,
        fecha,
        sastre: currentUser,
        notaGarantia: tipo === 'garantia' ? notaGarantia : null,
        clienteNombre: factura.nombre,
        clienteCedula: factura.cedula
    };
    
    // Guardar prenda
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    prendas.push(prenda);
    guardarYSincronizar('prendas', prendas);
    
    // Marcar factura como completada
    factura.completada = true;
    factura.sastreAsignado = currentUser;
    factura.fechaCompletado = fecha;
    guardarYSincronizar('facturas', facturas);
    
    // Enviar notificación por WhatsApp
    enviarNotificacionWhatsApp(factura, prenda);
    
    // Limpiar formulario
    document.getElementById('facturaInput').value = '';
    document.getElementById('tipoTrabajo').value = 'normal';
    document.getElementById('notaGarantia').value = '';
    document.getElementById('garantiaNote').style.display = 'none';
    document.getElementById('infoFactura').style.display = 'none';
    
    // Actualizar vista
    actualizarProduccionSastre();
    
    alert('✅ Trabajo registrado exitosamente');
}

function registrarPrenda(event) {
    event.preventDefault();
    
    const factura = document.getElementById('facturaInput').value.trim();
    const precio = parseFloat(document.getElementById('precioInput').value);
    const tipo = document.getElementById('tipoTrabajo').value;
    const notaGarantia = document.getElementById('notaGarantia').value.trim();
    
    // Validar garantía
    if (tipo === 'garantia' && !notaGarantia) {
        alert('Debes ingresar una nota explicando qué falló en la garantía');
        return;
    }
    
    const fecha = new Date().toISOString();
    const color = getColorPrenda(tipo, fecha);
    
    // Verificar si el periodo está cerrado
    if (isPeriodoCerrado(color)) {
        alert('Este periodo ya está cerrado. No puedes agregar más prendas.');
        return;
    }
    
    const prenda = {
        id: Date.now(),
        factura,
        precio,
        tipo,
        color,
        fecha,
        sastre: currentUser,
        notaGarantia: tipo === 'garantia' ? notaGarantia : null
    };
    
    // Guardar prenda
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    prendas.push(prenda);
    localStorage.setItem('prendas', JSON.stringify(prendas));
    
    // Limpiar formulario
    document.getElementById('facturaInput').value = '';
    document.getElementById('precioInput').value = '';
    document.getElementById('tipoTrabajo').value = 'normal';
    document.getElementById('notaGarantia').value = '';
    document.getElementById('garantiaNote').style.display = 'none';
    
    // Actualizar vista
    actualizarProduccionSastre();
    
    alert('✅ Prenda registrada exitosamente');
}

function actualizarProduccionSastre() {
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    // Filtrar prendas del sastre actual y mes actual
    const prendasSastre = prendas.filter(p => 
        p.sastre === currentUser && 
        p.fecha.slice(0, 7) === mesActual
    );
    
    // Calcular por color
    const stats = {
        azul: { cantidad: 0, monto: 0 },
        amarillo: { cantidad: 0, monto: 0 },
        verde: { cantidad: 0, monto: 0 },
        rojo: { cantidad: 0, monto: 0 }
    };
    
    prendasSastre.forEach(p => {
        stats[p.color].cantidad++;
        stats[p.color].monto += p.precio;
    });
    
    // Actualizar UI
    document.getElementById('totalAzul').textContent = stats.azul.cantidad;
    document.getElementById('montoAzul').textContent = formatearPesos(stats.azul.monto);
    
    document.getElementById('totalAmarillo').textContent = stats.amarillo.cantidad;
    document.getElementById('montoAmarillo').textContent = formatearPesos(stats.amarillo.monto);
    
    document.getElementById('totalVerde').textContent = stats.verde.cantidad;
    document.getElementById('montoVerde').textContent = formatearPesos(stats.verde.monto);
    
    document.getElementById('totalRojo').textContent = stats.rojo.cantidad;
    document.getElementById('montoRojo').textContent = formatearPesos(stats.rojo.monto);
    
    const totalMes = stats.azul.monto + stats.amarillo.monto + stats.verde.monto;
    document.getElementById('totalMesActual').textContent = formatearPesos(totalMes);
    
    // Actualizar listado
    mostrarListadoPrendas(prendasSastre);
}

function mostrarListadoPrendas(prendas) {
    const container = document.getElementById('listaPrendasSastre');
    
    if (prendas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay trabajos registrados</p>';
        return;
    }
    
    // Ordenar por fecha descendente
    prendas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let tabla = `
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Factura</th>
                    <th>Cliente</th>
                    <th>Precio</th>
                    <th>Tipo</th>
                    <th>Periodo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    prendas.forEach(p => {
        const fecha = new Date(p.fecha);
        const bloqueado = isPeriodoCerrado(p.color);
        const puedeEditar = p.sastre === currentUser;
        
        tabla += `
            <tr>
                <td>${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString().slice(0,5)}</td>
                <td><strong>${p.factura}</strong></td>
                <td>${p.clienteNombre}</td>
                <td>$ ${formatearPesos(p.precio)}</td>
                <td>${p.tipo === 'garantia' ? '⚠️ Garantía' : 'Normal'}</td>
                <td>
                    <span class="color-badge" style="background: ${getColorValue(p.color)};"></span>
                    ${p.color.charAt(0).toUpperCase() + p.color.slice(1)}
                </td>
                <td>
                    <button onclick="eliminarPrenda(${p.id})" 
                            ${bloqueado || !puedeEditar ? 'disabled' : ''}
                            style="padding: 4px 8px; border: none; background: ${bloqueado || !puedeEditar ? '#ccc' : '#F44336'}; color: white; border-radius: 4px; cursor: ${bloqueado || !puedeEditar ? 'not-allowed' : 'pointer'}; font-size: 0.85em;">
                        ${bloqueado ? '🔒' : !puedeEditar ? '🚫' : '❌'}
                    </button>
                </td>
            </tr>
            ${p.tipo === 'garantia' ? `
                <tr style="background: #FFEBEE;">
                    <td colspan="7" style="font-size: 0.85em; color: #D32F2F; padding: 8px;">
                        📝 Nota: ${p.notaGarantia}
                    </td>
                </tr>
            ` : ''}
        `;
    });
    
    tabla += `</tbody></table>`;
    container.innerHTML = tabla;
}

function eliminarPrenda(id) {
    if (!confirm('¿Estás seguro de eliminar esta prenda?')) {
        return;
    }
    
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const prenda = prendas.find(p => p.id === id);
    
    if (prenda && isPeriodoCerrado(prenda.color)) {
        alert('No puedes eliminar esta prenda porque el periodo ya está cerrado');
        return;
    }
    
    const nuevasPrendas = prendas.filter(p => p.id !== id);
    localStorage.setItem('prendas', JSON.stringify(nuevasPrendas));
    
    actualizarProduccionSastre();
    alert('Prenda eliminada');
}

function getColorValue(color) {
    const colors = {
        azul: '#2196F3',
        amarillo: '#FFC107',
        verde: '#4CAF50',
        rojo: '#F44336'
    };
    return colors[color] || '#999';
}

function formatearPesos(cantidad) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(cantidad).replace('COP', '').trim();
}

// ============================================
// DASHBOARD DEL ADMINISTRADOR
// ============================================

function initAdminScreen() {
    showAdminTab('crearFactura');
    cargarSeñaladoresParaSelect();
}

function cargarSeñaladoresParaSelect() {
    const senaladores = JSON.parse(localStorage.getItem('senaladores') || '[]');
    const select = document.getElementById('senaladorAsignado');
    if (select) {
        select.innerHTML = '<option value="">-- Seleccionar --</option>' +
            senaladores.map(s => `<option value="${s}">${s}</option>`).join('');
    }
}

// ============================================
// FUNCIONES OBSOLETAS (Sistema antiguo de sastres separados)
// Estas funciones ya no se usan. Ahora todos los trabajadores 
// (sastres, domiciliarios, señaladores) se gestionan en "empleados"
// ============================================

/*
function agregarSastre(event) { ... }
function cargarTablaSastres() { ... }
function eliminarSastre(id) { ... }
function cambiarPinSastre(id) { ... }
*/

// ============================================
// GESTIÓN UNIFICADA DE TRABAJADORES/EMPLEADOS
// ============================================


function agregarEmpleado(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nuevoEmpleadoNombre').value.trim();
    const rol = document.getElementById('nuevoEmpleadoRol').value;
    const pin = document.getElementById('nuevoEmpleadoPin').value.trim();
    const cedula = document.getElementById('nuevoEmpleadoCedula').value.trim();
    const telefono = document.getElementById('nuevoEmpleadoTelefono').value.trim();
    
    if (!nombre || !rol || !pin) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
        alert('El PIN debe ser de 4 dígitos numéricos');
        return;
    }
    
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    
    if (empleados.some(e => e.nombre.toLowerCase() === nombre.toLowerCase() && e.rol === rol)) {
        alert(`Ya existe un ${rol} con ese nombre`);
        return;
    }
    
    const nuevoEmpleado = {
        id: Date.now(),
        nombre,
        rol,
        pin,
        cedula,
        telefono,
        fechaRegistro: new Date().toISOString(),
        activo: true
    };
    
    empleados.push(nuevoEmpleado);
    guardarYSincronizar('empleados', empleados);
    
    // Si es señalador, agregarlo a la lista de señaladores
    if (rol === 'Señalador') {
        const senaladores = JSON.parse(localStorage.getItem('senaladores') || '[]');
        if (!senaladores.includes(nombre)) {
            senaladores.push(nombre);
            guardarYSincronizar('senaladores', senaladores);
        }
    }
    
    document.getElementById('nuevoEmpleadoNombre').value = '';
    document.getElementById('nuevoEmpleadoRol').value = '';
    document.getElementById('nuevoEmpleadoPin').value = '';
    document.getElementById('nuevoEmpleadoCedula').value = '';
    document.getElementById('nuevoEmpleadoTelefono').value = '';
    
    alert('✅ Trabajador agregado exitosamente');
    cargarTablaEmpleados();
}

function cargarTablaEmpleados() {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const container = document.getElementById('tablaEmpleadosRegistrados');
    
    if (empleados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay empleados registrados</p>';
        return;
    }
    
    const rolesEmojis = {
        'domiciliario': '🏍️',
        'senalador': '�',
        'cortador': '✂️',
        'planchador': '🧵',
        'auxiliar': '🔧',
        'bodeguero': '📦',
        'limpieza': '🧹'
    };
    
    let tabla = `
        <table>
            <thead style="background: linear-gradient(135deg, #4FC3F7, #FFD700);">
                <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Cédula</th>
                    <th>Teléfono</th>
                    <th>Fecha Registro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    empleados.forEach(e => {
        const fecha = new Date(e.fechaRegistro);
        const emoji = rolesEmojis[e.rol] || '👤';
        const estadoBadge = e.activo 
            ? '<span style="background: #4CAF50; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.85em;">✓ Activo</span>'
            : '<span style="background: #F44336; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.85em;">✗ Inactivo</span>';
        
        tabla += `
            <tr>
                <td>${emoji} ${e.nombre}</td>
                <td>${e.rol.charAt(0).toUpperCase() + e.rol.slice(1)}</td>
                <td>${e.cedula}</td>
                <td>${e.telefono || 'N/A'}</td>
                <td>${fecha.toLocaleDateString()}</td>
                <td>${estadoBadge}</td>
                <td>
                    ${e.activo 
                        ? `<button onclick="toggleEstadoEmpleado(${e.id}, false)" style="padding: 4px 8px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 2px;">⏸ Desactivar</button>`
                        : `<button onclick="toggleEstadoEmpleado(${e.id}, true)" style="padding: 4px 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 2px;">▶ Activar</button>`
                    }
                    <button onclick="eliminarEmpleado(${e.id})" style="padding: 4px 8px; background: #F44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 2px;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    
    tabla += `</tbody></table>`;
    container.innerHTML = tabla;
}

function toggleEstadoEmpleado(id, nuevoEstado) {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const empleado = empleados.find(e => e.id === id);
    
    if (empleado) {
        empleado.activo = nuevoEstado;
        localStorage.setItem('empleados', JSON.stringify(empleados));
        alert(nuevoEstado ? '✅ Empleado activado' : '⏸ Empleado desactivado');
        cargarTablaEmpleados();
    }
}

function eliminarEmpleado(id) {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const nuevosEmpleados = empleados.filter(e => e.id !== id);
    localStorage.setItem('empleados', JSON.stringify(nuevosEmpleados));
    
    alert('Empleado eliminado');
    cargarTablaEmpleados();
}

function buscarClientePorCedulaAdmin() {
    const cedula = document.getElementById('adminClienteCedula').value.trim();
    if (!cedula) return;
    
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const cliente = clientes.find(c => c.cedula === cedula);
    
    if (cliente) {
        document.getElementById('adminClienteNombre').value = cliente.nombre;
        document.getElementById('adminClienteCelular').value = cliente.celular;
        document.getElementById('adminClienteDireccion').value = cliente.direccion;
    }
}

function registrarFacturaAdmin(event) {
    event.preventDefault();
    
    const cedula = document.getElementById('adminClienteCedula').value.trim();
    const nombre = document.getElementById('adminClienteNombre').value.trim();
    const celular = document.getElementById('adminClienteCelular').value.trim();
    const direccion = document.getElementById('adminClienteDireccion').value.trim();
    const senalador = document.getElementById('senaladorAsignado').value;
    const trabajo = document.getElementById('adminTrabajoDescripcion').value.trim();
    const precio = parseFloat(document.getElementById('adminPrecioTotal').value);
    const abono = parseFloat(document.getElementById('adminAbono').value) || 0;
    const estadoPago = document.getElementById('adminEstadoPago').value;
    const fechaEntrega = document.getElementById('adminFechaEntrega').value;
    
    if (!senalador) {
        alert('Debes seleccionar un señalador');
        return;
    }
    
    const numeroFactura = generarNumeroFactura();
    const fecha = new Date().toISOString();
    
    const factura = {
        id: Date.now(),
        numero: numeroFactura,
        fecha,
        cedula,
        nombre,
        celular,
        direccion,
        trabajo,
        precio,
        abono,
        saldo: precio - abono,
        estadoPago,
        senalador,
        estado: 'Recibida', // Nuevo: estado de la prenda
        completada: false,
        creadoPor: 'Administrador',
        fechaEntrega: fechaEntrega || null,
        notificacionEnviada: false
    };
    
    // Guardar cliente
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const clienteExistente = clientes.find(c => c.cedula === cedula);
    
    if (!clienteExistente) {
        clientes.push({ cedula, nombre, celular, direccion });
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }
    
    // Guardar factura
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    facturas.push(factura);
    localStorage.setItem('facturas', JSON.stringify(facturas));
    
    // Limpiar formulario
    document.getElementById('adminClienteCedula').value = '';
    document.getElementById('adminClienteNombre').value = '';
    document.getElementById('adminClienteCelular').value = '';
    document.getElementById('adminClienteDireccion').value = '';
    document.getElementById('senaladorAsignado').value = '';
    document.getElementById('adminTrabajoDescripcion').value = '';
    document.getElementById('adminPrecioTotal').value = '';
    document.getElementById('adminAbono').value = '0';
    document.getElementById('adminFechaEntrega').value = '';
    
    alert(`✅ Factura ${numeroFactura} creada exitosamente`);
    imprimirFactura(factura);
    
    // Verificar notificaciones después de crear factura
    verificarNotificaciones();
}

function showAdminTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById('adminTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    
    // Cargar datos según tab
    if (tabName === 'crearFactura') {
        cargarSeñaladoresParaSelect();
    } else if (tabName === 'facturas') {
        buscarFacturasAdmin();
    } else if (tabName === 'busquedaAvanzada') {
        cargarSastresParaFiltro();
        limpiarFiltros();
        cargarTodasLasFacturas();
    } else if (tabName === 'dashboard') {
        cargarDashboard();
    } else if (tabName === 'gestionEmpleados') {
        cargarTablaEmpleados();
    } else if (tabName === 'sastres') {
        cargarListadoSastres();
        showPeriodoTab('azul');
    } else if (tabName === 'senaladores') {
        cargarListadoSenaladores();
    } else if (tabName === 'periodos') {
        cargarPeriodos();
    } else if (tabName === 'historial') {
        cargarHistorialAdmin();
    } else if (tabName === 'liquidacion') {
        cargarTodosLosTrabjadoresLiquidacion();
    }
}

function cargarSastresParaFiltro() {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const sastres = empleados.filter(e => e.rol === 'Sastre' && e.activo);
    const select = document.getElementById('filtroSastre');
    
    select.innerHTML = '<option value="">Todos los sastres</option>';
    sastres.forEach(s => {
        select.innerHTML += `<option value="${s.nombre}">${s.nombre}</option>`;
    });
}

function buscarFacturasAdmin() {
    const query = document.getElementById('searchFacturasAdmin').value.toLowerCase().trim();
    buscarFacturasGeneral(query || '', 'tablaFacturasAdmin');
}

function cargarListadoSenaladores() {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    const facturasMes = facturas.filter(f => f.fecha.slice(0, 7) === mesActual);
    
    const senaladorMap = {};
    facturasMes.forEach(f => {
        if (!senaladorMap[f.senalador]) {
            senaladorMap[f.senalador] = {
                total: 0,
                recepciones: 0,
                totalIngresado: 0
            };
        }
        senaladorMap[f.senalador].recepciones++;
        senaladorMap[f.senalador].totalIngresado += f.precio;
    });
    
    const container = document.getElementById('listaSenaladores');
    
    if (Object.keys(senaladorMap).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay señaladores activos este mes</p>';
        return;
    }
    
    let tabla = `
        <table>
            <thead style="background: linear-gradient(135deg, #4FC3F7, #FFD700); color: white;">
                <tr>
                    <th>Señalador</th>
                    <th>Facturas Asignadas</th>
                    <th>Total Acumulado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.entries(senaladorMap).forEach(([senalador, stats]) => {
        tabla += `
            <tr>
                <td>📏 ${senalador}</td>
                <td><strong style="color: #4FC3F7;">${stats.recepciones}</strong></td>
                <td><strong style="color: #FFD700;">$ ${formatearPesos(stats.totalIngresado)}</strong></td>
            </tr>
        `;
    });
    
    tabla += `</tbody></table>`;
    container.innerHTML = tabla;
}

function showPeriodoTab(periodo) {
    // Actualizar botones de periodo
    document.querySelectorAll('.periodo-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('tabPeriodo' + periodo.charAt(0).toUpperCase() + periodo.slice(1)).classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.periodo-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('periodo' + periodo.charAt(0).toUpperCase() + periodo.slice(1)).classList.add('active');
    
    // Cargar tabla del periodo
    cargarTablaPeriodo(periodo);
}

function cargarListadoSastres() {
    showPeriodoTab('azul');
}

function cargarTablaPeriodo(periodo) {
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    let prendasFiltradas = prendas.filter(p => p.fecha.slice(0, 7) === mesActual);
    
    if (periodo !== 'todos') {
        prendasFiltradas = prendasFiltradas.filter(p => p.color === periodo);
    }
    
    const containerId = 'tabla' + periodo.charAt(0).toUpperCase() + periodo.slice(1);
    const container = document.getElementById(containerId);
    
    if (prendasFiltradas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay registros en este periodo</p>';
        return;
    }
    
    // Ordenar por sastre y fecha
    prendasFiltradas.sort((a, b) => {
        if (a.sastre !== b.sastre) return a.sastre.localeCompare(b.sastre);
        return new Date(a.fecha) - new Date(b.fecha);
    });
    
    let tabla = `
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Sastre</th>
                    <th>Factura</th>
                    <th>Precio</th>
                    <th>Tipo</th>
                    <th>Periodo</th>
                    ${currentRole === 'admin' || currentRole === 'owner' ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
    `;
    
    let totalPeriodo = 0;
    
    prendasFiltradas.forEach(p => {
        const fecha = new Date(p.fecha);
        const bloqueado = isPeriodoCerrado(p.color);
        totalPeriodo += p.precio;
        
        tabla += `
            <tr>
                <td>${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString().slice(0,5)}</td>
                <td>🧵 ${p.sastre}</td>
                <td>${p.factura}</td>
                <td>$ ${formatearPesos(p.precio)}</td>
                <td>${p.tipo === 'garantia' ? '⚠️ Garantía' : 'Normal'}</td>
                <td>
                    <span class="color-badge" style="background: ${getColorValue(p.color)};"></span>
                    ${p.color.charAt(0).toUpperCase() + p.color.slice(1)}
                </td>
                ${currentRole === 'admin' || currentRole === 'owner' ? `
                    <td>
                        <button onclick="eliminarPrendaAdmin(${p.id})" 
                                ${bloqueado ? 'disabled' : ''}
                                style="padding: 4px 8px; border: none; background: ${bloqueado ? '#ccc' : '#F44336'}; color: white; border-radius: 4px; cursor: ${bloqueado ? 'not-allowed' : 'pointer'}; font-size: 0.85em;">
                            ${bloqueado ? '🔒' : '❌'}
                        </button>
                    </td>
                ` : ''}
            </tr>
            ${p.tipo === 'garantia' ? `
                <tr style="background: #FFEBEE;">
                    <td colspan="${currentRole === 'admin' || currentRole === 'owner' ? '7' : '6'}" style="font-size: 0.85em; color: #D32F2F; padding: 8px;">
                        📝 Nota: ${p.notaGarantia}
                    </td>
                </tr>
            ` : ''}
        `;
    });
    
    tabla += `
            </tbody>
            <tfoot>
                <tr style="font-weight: bold; background: #F5F5F5;">
                    <td colspan="3">TOTAL ${periodo.toUpperCase()}</td>
                    <td>$ ${formatearPesos(totalPeriodo)}</td>
                    <td colspan="${currentRole === 'admin' || currentRole === 'owner' ? '3' : '2'}">${prendasFiltradas.length} prendas</td>
                </tr>
            </tfoot>
        </table>
    `;
    
    container.innerHTML = tabla;
}

function eliminarPrendaAdmin(id) {
    if (!confirm('¿Estás seguro de eliminar esta prenda?')) return;
    
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const prenda = prendas.find(p => p.id === id);
    
    if (prenda && isPeriodoCerrado(prenda.color)) {
        alert('No puedes eliminar esta prenda porque el periodo ya está cerrado');
        return;
    }
    
    const nuevasPrendas = prendas.filter(p => p.id !== id);
    localStorage.setItem('prendas', JSON.stringify(nuevasPrendas));
    
    // Recargar la tabla del periodo actual
    const periodoActivo = document.querySelector('.periodo-tab.active').id.replace('tabPeriodo', '').toLowerCase();
    cargarTablaPeriodo(periodoActivo);
    alert('Prenda eliminada');
}

function cargarTodosLosTrabjadoresLiquidacion() {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const trabajadoresActivos = empleados.filter(e => e.activo !== false);
    
    const select = document.getElementById('trabajadorSelectLiquidacion');
    select.innerHTML = '<option value="">-- Seleccionar Trabajador --</option>' +
        trabajadoresActivos.map(t => {
            const emoji = t.rol === 'Sastre' ? '🧵' : t.rol === 'Domiciliario' ? '🏍️' : '📏';
            return `<option value="${t.id}">${emoji} ${t.nombre} (${t.rol})</option>`;
        }).join('');
}

function calcularLiquidacion() {
    const trabajadorId = document.getElementById('trabajadorSelectLiquidacion').value;
    
    if (!trabajadorId) {
        document.getElementById('liquidacionPanel').style.display = 'none';
        return;
    }
    
    document.getElementById('liquidacionPanel').style.display = 'block';
    
    // Obtener trabajador
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const trabajador = empleados.find(e => e.id == trabajadorId);
    
    if (!trabajador) return;
    
    // Cargar configuración
    const config = JSON.parse(localStorage.getItem('config'));
    const porcentajeSastre = config.porcentajeSastre || 40;
    const porcentajeSenalador = config.porcentajeSenalador || 11;
    const porcentajeDomiciliario = config.porcentajeDomiciliario || 11;
    const pagoPorDomicilio = config.pagoPorDomicilio || 20000;
    
    // Actualizar info del trabajador
    document.getElementById('trabajadorNombre').textContent = trabajador.nombre;
    document.getElementById('trabajadorRol').textContent = trabajador.rol;
    document.getElementById('trabajadorPeriodo').textContent = new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' });
    
    // Ocultar todos los cálculos
    document.getElementById('calculoSastre').style.display = 'none';
    document.getElementById('calculoSenalador').style.display = 'none';
    document.getElementById('calculoDomiciliario').style.display = 'none';
    
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    let sumaBruta = 0;
    
    // Calcular según el rol
    if (trabajador.rol === 'Sastre') {
        // Producción del sastre
        const prendasSastre = prendas.filter(p => 
            p.sastre === trabajador.nombre && 
            p.fecha.slice(0, 7) === mesActual &&
            p.tipo !== 'garantia'
        );
        
        const totalProducido = prendasSastre.reduce((sum, p) => sum + p.precio, 0);
        sumaBruta = (totalProducido * porcentajeSastre) / 100;
        
        document.getElementById('calculoSastre').style.display = 'block';
        document.getElementById('sastreTotalProducido').textContent = formatearPesos(totalProducido);
        document.getElementById('sastrePorcentaje').textContent = porcentajeSastre;
        document.getElementById('sastreSumaBruta').textContent = formatearPesos(sumaBruta);
        
    } else if (trabajador.rol === 'Señalador') {
        // Total recepcionado en la sede por todos
        const facturasDelMes = facturas.filter(f => f.fecha.slice(0, 7) === mesActual);
        const totalRecepcionado = facturasDelMes.reduce((sum, f) => sum + (f.totalPrendas || 0), 0);
        sumaBruta = (totalRecepcionado * porcentajeSenalador) / 100;
        
        document.getElementById('calculoSenalador').style.display = 'block';
        document.getElementById('senaladorTotalRecepcionado').textContent = formatearPesos(totalRecepcionado);
        document.getElementById('senaladorPorcentaje').textContent = porcentajeSenalador;
        document.getElementById('senaladorSumaBruta').textContent = formatearPesos(sumaBruta);
        
    } else if (trabajador.rol === 'Domiciliario') {
        // Recepciones del domiciliario
        const facturasDelMes = facturas.filter(f => 
            f.fecha.slice(0, 7) === mesActual &&
            f.domiciliario === trabajador.nombre
        );
        
        const totalRecepcionado = facturasDelMes.reduce((sum, f) => sum + (f.totalPrendas || 0), 0);
        const subtotalRecepcion = (totalRecepcionado * porcentajeDomiciliario) / 100;
        
        // Contar domicilios (facturas con domicilio marcado)
        const domiciliosRealizados = facturasDelMes.filter(f => f.domicilio === true).length;
        const subtotalDomicilios = domiciliosRealizados * pagoPorDomicilio;
        
        sumaBruta = subtotalRecepcion + subtotalDomicilios;
        
        document.getElementById('calculoDomiciliario').style.display = 'block';
        document.getElementById('domiciliarioTotalRecepcionado').textContent = formatearPesos(totalRecepcionado);
        document.getElementById('domiciliarioPorcentaje').textContent = porcentajeDomiciliario;
        document.getElementById('domiciliarioSubtotalRecepcion').textContent = formatearPesos(subtotalRecepcion);
        document.getElementById('domiciliosCantidad').textContent = domiciliosRealizados;
        document.getElementById('domicilioPagoUnitario').textContent = formatearPesos(pagoPorDomicilio);
        document.getElementById('domicilioSubtotalDomicilios').textContent = formatearPesos(subtotalDomicilios);
        document.getElementById('domiciliarioSumaBruta').textContent = formatearPesos(sumaBruta);
    }
    
    // Calcular deducciones
    const porcentajeSalud = parseFloat(document.getElementById('porcentajeSalud').value) || 0;
    const porcentajePension = parseFloat(document.getElementById('porcentajePension').value) || 0;
    const montoPrestamo = parseFloat(document.getElementById('montoPrestamo').value) || 0;
    const otrosDescuentos = parseFloat(document.getElementById('otrosDescuentos').value) || 0;
    
    const montoSalud = (sumaBruta * porcentajeSalud) / 100;
    const montoPension = (sumaBruta * porcentajePension) / 100;
    const totalDeducciones = montoSalud + montoPension + montoPrestamo + otrosDescuentos;
    const pagoNeto = sumaBruta - totalDeducciones;
    
    // Actualizar displays
    document.getElementById('displaySalud').textContent = porcentajeSalud;
    document.getElementById('displayPension').textContent = porcentajePension;
    document.getElementById('montoSalud').textContent = formatearPesos(montoSalud);
    document.getElementById('montoPension').textContent = formatearPesos(montoPension);
    document.getElementById('totalDeducciones').textContent = formatearPesos(totalDeducciones);
    document.getElementById('pagoNeto').textContent = formatearPesos(pagoNeto);
}

function generarVolante() {
    const trabajadorId = document.getElementById('trabajadorSelectLiquidacion').value;
    
    if (!trabajadorId) {
        alert('Selecciona un trabajador');
        return;
    }
    
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const trabajador = empleados.find(e => e.id == trabajadorId);
    
    if (!trabajador) return;
    
    const sumaBruta = document.getElementById('pagoNeto').parentElement.querySelector('.amount-display').textContent;
    const montoSalud = document.getElementById('montoSalud').textContent;
    const montoPension = document.getElementById('montoPension').textContent;
    const montoPrestamo = document.getElementById('montoPrestamo').value;
    const otrosDescuentos = document.getElementById('otrosDescuentos').value;
    const conceptoOtros = document.getElementById('conceptoOtros').value;
    const pagoNeto = document.getElementById('pagoNeto').textContent;
    
    const fecha = new Date().toLocaleDateString();
    
    let detalleProduccion = '';
    if (trabajador.rol === 'Sastre') {
        const totalProducido = document.getElementById('sastreTotalProducido').textContent;
        const porcentaje = document.getElementById('sastrePorcentaje').textContent;
        detalleProduccion = `Total Producido:      $ ${totalProducido} COP\nPorcentaje Sastre:    ${porcentaje}%\n`;
    } else if (trabajador.rol === 'Señalador') {
        const totalRecep = document.getElementById('senaladorTotalRecepcionado').textContent;
        const porcentaje = document.getElementById('senaladorPorcentaje').textContent;
        detalleProduccion = `Total Recepcionado:   $ ${totalRecep} COP\nPorcentaje Señalador: ${porcentaje}%\n`;
    } else if (trabajador.rol === 'Domiciliario') {
        const totalRecep = document.getElementById('domiciliarioTotalRecepcionado').textContent;
        const subtotalRecep = document.getElementById('domiciliarioSubtotalRecepcion').textContent;
        const domicilios = document.getElementById('domiciliosCantidad').textContent;
        const pagoUnitario = document.getElementById('domicilioPagoUnitario').textContent;
        const subtotalDom = document.getElementById('domicilioSubtotalDomicilios').textContent;
        detalleProduccion = `Recepcionado:         $ ${totalRecep} COP\nSubtotal Recepción:   $ ${subtotalRecep} COP\nDomicilios:           ${domicilios} x $ ${pagoUnitario}\nSubtotal Domicilios:  $ ${subtotalDom} COP\n`;
    }
    
    const volante = `
========================================
    GONZÀLEZ BROTHER´S - SASTRERÍA
       VOLANTE DE PAGO
========================================

Trabajador: ${trabajador.nombre}
Rol: ${trabajador.rol}
Fecha: ${fecha}
Periodo: ${new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}

----------------------------------------
DETALLE DE PRODUCCIÓN
----------------------------------------
${detalleProduccion}
Suma Bruta:           $ ${sumaBruta} COP

----------------------------------------
DEDUCCIONES
----------------------------------------
Salud:                $ ${montoSalud} COP
Pensión:              $ ${montoPension} COP
Préstamos:            $ ${formatearPesos(montoPrestamo)} COP
Otros Descuentos:     $ ${formatearPesos(otrosDescuentos)} COP
${conceptoOtros ? `Concepto: ${conceptoOtros}` : ''}

----------------------------------------
PAGO NETO:            $ ${pagoNeto} COP
========================================

Firma Administrador: __________________

Firma ${trabajador.rol}: _________________________

    `;
    
    // Crear archivo de texto descargable
    const blob = new Blob([volante], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Volante_${trabajador.nombre.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    
    alert('✅ Volante generado y descargado');
}

function cargarPeriodos() {
    const periodo = getPeriodoActual();
    const periodosCerrados = JSON.parse(localStorage.getItem('periodosCerrados') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    // Periodo actual
    const periodoDiv = document.getElementById('periodoActualAdmin');
    periodoDiv.innerHTML = `
        <div class="periodo-actual-badge" style="background-color: ${getColorValue(periodo.codigo)}; color: white;">
            ${periodo.nombre}
        </div>
        <p>Mes: ${new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}</p>
    `;
    
    // Periodos cerrados del mes
    const cerradosMes = periodosCerrados.filter(p => p.mes === mesActual);
    const listDiv = document.getElementById('periodosCerradosList');
    
    if (cerradosMes.length === 0) {
        listDiv.innerHTML = '<p style="color: #999;">No hay periodos cerrados este mes</p>';
    } else {
        listDiv.innerHTML = cerradosMes.map(p => `
            <div style="padding: 10px; margin: 5px 0; background: ${getColorValue(p.color)}; color: white; border-radius: 8px;">
                🔒 ${p.color.toUpperCase()} - Cerrado el ${new Date(p.fechaCierre).toLocaleDateString()}
            </div>
        `).join('');
    }
}

function cerrarPeriodoActual() {
    const confirmacion = confirm('¿Estás seguro de cerrar el periodo actual? Esta acción no se puede deshacer y bloqueará todos los registros de este color.');
    
    if (!confirmacion) return;
    
    const periodo = getPeriodoActual();
    const mesActual = new Date().toISOString().slice(0, 7);
    const periodosCerrados = JSON.parse(localStorage.getItem('periodosCerrados') || '[]');
    
    // Verificar si ya está cerrado
    if (periodosCerrados.some(p => p.mes === mesActual && p.color === periodo.codigo)) {
        alert('Este periodo ya está cerrado');
        return;
    }
    
    // Guardar en historial mensual antes de cerrar
    guardarEnHistorialMensual();
    
    // Cerrar periodo
    periodosCerrados.push({
        mes: mesActual,
        color: periodo.codigo,
        fechaCierre: new Date().toISOString()
    });
    
    localStorage.setItem('periodosCerrados', JSON.stringify(periodosCerrados));
    
    alert('✅ Periodo cerrado exitosamente');
    cargarPeriodos();
}

// ============================================
// HISTORIAL MENSUAL
// ============================================

function guardarEnHistorialMensual() {
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const historial = JSON.parse(localStorage.getItem('historialMensual') || '{}');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    // Agrupar por sastre
    const sastreMap = {};
    
    prendas.filter(p => p.fecha.slice(0, 7) === mesActual).forEach(p => {
        if (!sastreMap[p.sastre]) {
            sastreMap[p.sastre] = {
                azul: { cantidad: 0, monto: 0 },
                amarillo: { cantidad: 0, monto: 0 },
                verde: { cantidad: 0, monto: 0 },
                rojo: { cantidad: 0, monto: 0 },
                total: 0
            };
        }
        
        sastreMap[p.sastre][p.color].cantidad++;
        sastreMap[p.sastre][p.color].monto += p.precio;
    });
    
    // Calcular totales
    Object.keys(sastreMap).forEach(sastre => {
        const stats = sastreMap[sastre];
        stats.total = stats.azul.monto + stats.amarillo.monto + stats.verde.monto;
    });
    
    historial[mesActual] = {
        fecha: new Date().toISOString(),
        sastres: sastreMap,
        totalGeneral: Object.values(sastreMap).reduce((sum, s) => sum + s.total, 0),
        totalPrendas: prendas.filter(p => p.fecha.slice(0, 7) === mesActual).length,
        totalGarantias: prendas.filter(p => p.fecha.slice(0, 7) === mesActual && p.tipo === 'garantia').length
    };
    
    localStorage.setItem('historialMensual', JSON.stringify(historial));
}

function showHistorial() {
    document.getElementById('historialModal').classList.add('active');
    cargarHistorialGeneral();
}

function closeHistorial() {
    document.getElementById('historialModal').classList.remove('active');
}

function cargarHistorialGeneral() {
    const historial = JSON.parse(localStorage.getItem('historialMensual') || '{}');
    const container = document.getElementById('historialContent');
    
    if (Object.keys(historial).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No hay historial disponible</p>';
        return;
    }
    
    // Ordenar por mes descendente
    const meses = Object.keys(historial).sort((a, b) => b.localeCompare(a));
    
    container.innerHTML = meses.map(mes => {
        const data = historial[mes];
        const fecha = new Date(mes + '-01');
        
        return `
            <div class="mes-historial">
                <h4>�️ ${fecha.toLocaleDateString('es', { month: 'long', year: 'numeric' })}</h4>
                <p><strong>Total General:</strong> $ ${formatearPesos(data.totalGeneral)} COP</p>
                <p><strong>Prendas Procesadas:</strong> ${data.totalPrendas}</p>
                <p><strong>Garantías:</strong> ${data.totalGarantias}</p>
                
                <div style="margin-top: 10px;">
                    ${Object.entries(data.sastres).map(([sastre, stats]) => `
                        <div style="padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 6px;">
                            <strong>${sastre}:</strong> $ ${formatearPesos(stats.total)} COP
                            <div style="font-size: 0.85em; color: #666; margin-top: 3px;">
                                Azul: ${stats.azul.cantidad} ($ ${formatearPesos(stats.azul.monto)}) |
                                Amarillo: ${stats.amarillo.cantidad} ($ ${formatearPesos(stats.amarillo.monto)}) |
                                Verde: ${stats.verde.cantidad} ($ ${formatearPesos(stats.verde.monto)}) |
                                Rojo: ${stats.rojo.cantidad} ($ ${formatearPesos(stats.rojo.monto)})
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function cargarHistorialAdmin() {
    const container = document.getElementById('historialAdminPanel');
    const historial = JSON.parse(localStorage.getItem('historialMensual') || '{}');
    
    if (Object.keys(historial).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No hay historial disponible</p>';
        return;
    }
    
    cargarHistorialGeneral();
    container.innerHTML = '<p>Usa el botón "� Historial Mensual" en la parte inferior para ver el historial completo</p>';
}

// ============================================
// DASHBOARD DEL DUEÑO
// ============================================

function initOwnerScreen() {
    cargarEstadisticasOwner();
    showOwnerSection('reportes');
}

function cargarEstadisticasOwner() {
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    const prendasMes = prendas.filter(p => p.fecha.slice(0, 7) === mesActual);
    const sastres = [...new Set(prendasMes.map(p => p.sastre))];
    const garantias = prendasMes.filter(p => p.tipo === 'garantia').length;
    const produccionTotal = prendasMes.reduce((sum, p) => sum + (p.tipo !== 'garantia' ? p.precio : 0), 0);
    
    document.getElementById('produccionTotalMes').textContent = formatearPesos(produccionTotal);
    document.getElementById('sastresActivos').textContent = sastres.length;
    document.getElementById('garantiasMes').textContent = garantias;
    document.getElementById('prendasMes').textContent = prendasMes.length;
    
    cargarReportesSastres();
}

function showOwnerSection(section) {
    document.querySelectorAll('.owner-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById('owner' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
    
    if (section === 'historial') {
        cargarHistorialOwner();
    } else if (section === 'configuracion') {
        cargarConfiguracion();
    }
}

function cargarConfiguracion() {
    const config = JSON.parse(localStorage.getItem('config'));
    document.getElementById('configAdminPin').value = config.adminPin;
    document.getElementById('configOwnerPin').value = config.ownerPin;
    document.getElementById('configNombreSede').value = config.nombreSede || 'Sede Principal';
    document.getElementById('configSalud').value = config.salud;
    document.getElementById('configPension').value = config.pension;
    document.getElementById('configPorcentajeSastre').value = config.porcentajeSastre || 40;
    document.getElementById('configPorcentajeSenalador').value = config.porcentajeSenalador || 11;
    document.getElementById('configPorcentajeDomiciliario').value = config.porcentajeDomiciliario || 11;
    document.getElementById('configPagoPorDomicilio').value = config.pagoPorDomicilio || 20000;
    
    // Actualizar info de respaldo si existe
    mostrarInfoRespaldo();
}

function mostrarInfoRespaldo() {
    const infoDiv = document.getElementById('infoRespaldo');
    if (!infoDiv) return;
    
    const fechaRespaldo = localStorage.getItem('ultima_fecha_respaldo');
    const fechaSpan = document.getElementById('fechaRespaldo');
    
    if (fechaRespaldo) {
        fechaSpan.textContent = new Date(fechaRespaldo).toLocaleString();
    } else {
        fechaSpan.textContent = 'No hay respaldos automáticos aún';
    }
    
    // Mostrar u ocultar el div
    if (infoDiv.style.display === 'none' || infoDiv.style.display === '') {
        infoDiv.style.display = 'block';
    } else {
        infoDiv.style.display = 'none';
    }
}

function cargarReportesSastres() {
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    const sastreMap = {};
    
    prendas.filter(p => p.fecha.slice(0, 7) === mesActual).forEach(p => {
        if (!sastreMap[p.sastre]) {
            sastreMap[p.sastre] = {
                azul: { cantidad: 0, monto: 0 },
                amarillo: { cantidad: 0, monto: 0 },
                verde: { cantidad: 0, monto: 0 },
                rojo: { cantidad: 0, monto: 0 },
                garantias: []
            };
        }
        
        sastreMap[p.sastre][p.color].cantidad++;
        sastreMap[p.sastre][p.color].monto += p.precio;
        
        if (p.tipo === 'garantia') {
            sastreMap[p.sastre].garantias.push(p);
        }
    });
    
    const container = document.getElementById('reportesSastres');
    
    if (Object.keys(sastreMap).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No hay producción este mes</p>';
        return;
    }
    
    container.innerHTML = Object.entries(sastreMap).map(([sastre, stats]) => {
        const total = stats.azul.monto + stats.amarillo.monto + stats.verde.monto;
        
        return `
            <div class="sastre-card">
                <h4>🧵 ${sastre}</h4>
                <div class="sastre-production-grid">
                    <div class="mini-stat azul">
                        <strong>${stats.azul.cantidad}</strong>
                        <span>Azul</span>
                        <div>$ ${formatearPesos(stats.azul.monto)}</div>
                    </div>
                    <div class="mini-stat amarillo">
                        <strong>${stats.amarillo.cantidad}</strong>
                        <span>Amarillo</span>
                        <div>$ ${formatearPesos(stats.amarillo.monto)}</div>
                    </div>
                    <div class="mini-stat verde">
                        <strong>${stats.verde.cantidad}</strong>
                        <span>Verde</span>
                        <div>$ ${formatearPesos(stats.verde.monto)}</div>
                    </div>
                    <div class="mini-stat rojo">
                        <strong>${stats.rojo.cantidad}</strong>
                        <span>Rojo</span>
                        <div>$ ${formatearPesos(stats.rojo.monto)}</div>
                    </div>
                </div>
                <div style="margin-top: 15px; text-align: center; font-weight: bold; font-size: 1.1em;">
                    Total Producción: $ ${formatearPesos(total)} COP
                </div>
                ${stats.garantias.length > 0 ? `
                    <div style="margin-top: 10px; padding: 10px; background: #FFEBEE; border-radius: 8px;">
                        <strong style="color: #D32F2F;">⚠️ Garantías (${stats.garantias.length}):</strong>
                        ${stats.garantias.map(g => `
                            <div style="margin-top: 5px; font-size: 0.9em;">
                                • ${g.factura}: ${g.notaGarantia}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function guardarConfiguracion() {
    const nombreSede = document.getElementById('configNombreSede').value.trim();
    const adminPin = document.getElementById('configAdminPin').value;
    const ownerPin = document.getElementById('configOwnerPin').value;
    const salud = parseFloat(document.getElementById('configSalud').value);
    const pension = parseFloat(document.getElementById('configPension').value);
    const porcentajeSastre = parseFloat(document.getElementById('configPorcentajeSastre').value) || 40;
    const porcentajeSenalador = parseFloat(document.getElementById('configPorcentajeSenalador').value) || 11;
    const porcentajeDomiciliario = parseFloat(document.getElementById('configPorcentajeDomiciliario').value) || 11;
    const pagoPorDomicilio = parseFloat(document.getElementById('configPagoPorDomicilio').value) || 20000;
    
    const config = {
        nombreSede: nombreSede || 'Sede Principal',
        adminPin,
        ownerPin,
        salud,
        pension,
        porcentajeSastre,
        porcentajeSenalador,
        porcentajeDomiciliario,
        pagoPorDomicilio,
        primerUso: false
    };
    
    const sedeAnterior = JSON.parse(localStorage.getItem('config') || '{}').nombreSede;
    const sedeCambio = sedeAnterior !== config.nombreSede;
    
    localStorage.setItem('config', JSON.stringify(config));
    
    // Sincronizar configuración con Firebase
    if (typeof guardarEnFirebase === 'function') {
        guardarEnFirebase('config', config);
    }
    
    if (sedeCambio) {
        alert(`✅ Configuración guardada\n\n⚠️ IMPORTANTE: Cambiaste de sede\nDe: "${sedeAnterior}"\nA: "${config.nombreSede}"\n\nPresiona "Sincronizar Ahora" para cargar los datos de esta sede.`);
    } else {
        alert('✅ Configuración guardada exitosamente\nSede: ' + config.nombreSede + '\nPorcentajes de liquidación actualizados');
    }
}

function cargarHistorialOwner() {
    const container = document.getElementById('historialOwnerPanel');
    cargarHistorialGeneral();
    
    const historialContent = document.getElementById('historialContent').innerHTML;
    container.innerHTML = historialContent;
}

// ============================================
// UTILIDADES
// ============================================

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('historialModal');
    if (event.target === modal) {
        closeHistorial();
    }
}

// Autoguardar historial al final del mes
setInterval(function() {
    const dia = new Date().getDate();
    const ultimoDia = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    
    if (dia === ultimoDia) {
        guardarEnHistorialMensual();
    }
}, 86400000); // Verificar cada 24 horas

// ========== FUNCIONES DEL CHATBOT Y SUGERENCIAS ==========

function toggleChatbot() {
    const panel = document.getElementById('chatbotPanel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        panel.classList.add('chatbot-show');
        cargarSugerencias();
    } else {
        panel.style.display = 'none';
        panel.classList.remove('chatbot-show');
    }
}

function showChatbotTab(tab) {
    // Ocultar todas las tabs
    document.getElementById('chatTabAyuda').style.display = 'none';
    document.getElementById('chatTabSugerencias').style.display = 'none';
    
    // Quitar clase active de todos los botones
    const botones = document.querySelectorAll('.chatbot-tab-btn');
    botones.forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.borderBottom = 'none';
        btn.style.color = '#666';
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionada
    if (tab === 'ayuda') {
        document.getElementById('chatTabAyuda').style.display = 'block';
        const btnAyuda = document.getElementById('tabChatAyuda');
        btnAyuda.style.background = 'white';
        btnAyuda.style.borderBottom = '3px solid #159895';
        btnAyuda.style.color = '#1a5f7a';
        btnAyuda.classList.add('active');
    } else if (tab === 'sugerencias') {
        document.getElementById('chatTabSugerencias').style.display = 'block';
        const btnSug = document.getElementById('tabChatSugerencias');
        btnSug.style.background = 'white';
        btnSug.style.borderBottom = '3px solid #159895';
        btnSug.style.color = '#1a5f7a';
        btnSug.classList.add('active');
        cargarSugerencias();
    }
}

function mostrarAyuda(tema) {
    const respuestaDiv = document.getElementById('ayudaRespuesta');
    let contenido = '';
    
    switch(tema) {
        case 'login':
            contenido = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">🔐</div>
                    <h4 style="color: #1565C0; margin: 0;">Mini-Tutorial: Iniciar Sesión</h4>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #2196F3; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Selecciona tu <strong>nombre</strong> en el menú desplegable</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #2196F3; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <p style="margin: 0; line-height: 1.6;">Ingresa tu <strong>PIN de 4 dígitos</strong></p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #2196F3; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <p style="margin: 0; line-height: 1.6;">Presiona <strong>"Iniciar Sesión"</strong></p>
                    </div>
                </div>
                <div style="background: #E3F2FD; padding: 12px; border-radius: 8px; border-left: 4px solid #2196F3; margin-top: 15px;">
                    <p style="margin: 0; font-size: 0.9em; color: #1565C0;"><strong>💡 Consejo:</strong> El botón 🔄 actualiza la lista de trabajadores si acabas de ser registrado.</p>
                </div>
            `;
            break;
        case 'registrar':
            contenido = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">➕</div>
                    <h4 style="color: #2E7D32; margin: 0;">Mini-Tutorial: Registrar Trabajadores</h4>
                </div>
                <div style="background: #FFEBEE; padding: 12px; border-radius: 8px; border-left: 4px solid #F44336; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 0.9em; color: #C62828;"><strong>⚠️ Importante:</strong> Solo el <strong>Administrador</strong> puede registrar trabajadores</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #4CAF50; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Ve a la pestaña <strong>"Gestionar Trabajadores"</strong></p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #4CAF50; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <div style="margin: 0; line-height: 1.6;">
                            <p style="margin: 0 0 8px 0;">Completa el formulario:</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Nombre completo</li>
                                <li>Rol (Sastre/Domiciliario/Señalador)</li>
                                <li>PIN de 4 dígitos</li>
                                <li>Cédula y teléfono (opcional)</li>
                            </ul>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #4CAF50; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <p style="margin: 0; line-height: 1.6;">Presiona <strong>"Registrar Trabajador"</strong></p>
                    </div>
                </div>
            `;
            break;
        case 'factura':
            contenido = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">📋</div>
                    <h4 style="color: #E65100; margin: 0;">Mini-Tutorial: Crear Factura</h4>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #FF9800; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Ve a la pestaña <strong>"Facturas"</strong></p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #FF9800; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <p style="margin: 0; line-height: 1.6;">Selecciona el <strong>cliente</strong> o crea uno nuevo</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #FF9800; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <div style="margin: 0; line-height: 1.6;">
                            <p style="margin: 0 0 8px 0;">Agrega las prendas con:</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Tipo de prenda</li>
                                <li>Sastre y señalador asignados</li>
                                <li>Fecha de entrega</li>
                                <li>Valor</li>
                            </ul>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #FF9800; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">4</span>
                        <p style="margin: 0; line-height: 1.6;">Presiona <strong>"Generar Factura"</strong></p>
                    </div>
                </div>
                <div style="background: #FFF3E0; padding: 12px; border-radius: 8px; border-left: 4px solid #FF9800; margin-top: 15px;">
                    <p style="margin: 0; font-size: 0.9em; color: #E65100;"><strong>💡 Consejo:</strong> Puedes imprimir o compartir la factura desde el panel de facturas.</p>
                </div>
            `;
            break;
        case 'liquidacion':
            contenido = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">�</div>
                    <h4 style="color: #6A1B9A; margin: 0;">Mini-Tutorial: Calcular Liquidación</h4>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #9C27B0; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Ve a la pestaña <strong>"Liquidación"</strong></p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #9C27B0; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <p style="margin: 0; line-height: 1.6;">Selecciona el <strong>trabajador</strong> y el <strong>periodo</strong></p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #9C27B0; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <div style="margin: 0; line-height: 1.6;">
                            <p style="margin: 0 0 8px 0;">El sistema calcula automáticamente:</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><strong>Sastre:</strong> 40% de producción</li>
                                <li><strong>Señalador:</strong> 11% total recepción</li>
                                <li><strong>Domiciliario:</strong> 11% + $20,000/domicilio</li>
                            </ul>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #9C27B0; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">4</span>
                        <p style="margin: 0; line-height: 1.6;">Agrega <strong>descuentos</strong> si es necesario</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #9C27B0; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">5</span>
                        <p style="margin: 0; line-height: 1.6;">Genera el <strong>volante de pago</strong></p>
                    </div>
                </div>
            `;
            break;
        case 'respaldo':
            contenido = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">💾</div>
                    <h4 style="color: #00695C; margin: 0;">Mini-Tutorial: Respaldos</h4>
                </div>
                <div style="background: #E0F2F1; padding: 12px; border-radius: 8px; border-left: 4px solid #009688; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 0.9em; color: #00695C;"><strong>✅ Automático:</strong> La app guarda automáticamente cada 5 minutos</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #00695C;">📤 Para Exportar (solo Dueño):</p>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Inicia sesión como Dueño (PIN: 0000)</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <p style="margin: 0; line-height: 1.6;">Ve a "Gestión de Respaldos"</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <p style="margin: 0; line-height: 1.6;">Presiona "💾 Exportar Datos"</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">4</span>
                        <p style="margin: 0; line-height: 1.6;">Guarda el archivo JSON</p>
                    </div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #00695C;">📥 Para Restaurar:</p>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Presiona "📂 Importar Datos"</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <p style="margin: 0; line-height: 1.6;">Selecciona el archivo JSON guardado</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #009688; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <p style="margin: 0; line-height: 1.6;">Confirma la restauración</p>
                    </div>
                </div>
            `;
            break;
        case 'pin':
            contenido = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">🔑</div>
                    <h4 style="color: #C62828; margin: 0;">Mini-Tutorial: Recuperar PIN</h4>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #C62828;">🔐 PINes por Defecto:</p>
                    <div style="background: #E3F2FD; padding: 12px; border-radius: 8px; margin: 8px 0;">
                        <p style="margin: 0;"><strong>Administrador:</strong> 1234</p>
                    </div>
                    <div style="background: #F3E5F5; padding: 12px; border-radius: 8px; margin: 8px 0;">
                        <p style="margin: 0;"><strong>Dueño:</strong> 0000</p>
                    </div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #C62828;">👷 Para Trabajadores:</p>
                    <p style="margin: 0 0 10px 0; line-height: 1.6;">El PIN se asigna al registrarte. Si lo olvidaste:</p>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #F44336; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                        <p style="margin: 0; line-height: 1.6;">Contacta al <strong>Administrador</strong></p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #F44336; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                        <p style="margin: 0; line-height: 1.6;">Él puede ver tu PIN en la tabla de trabajadores</p>
                    </div>
                    <div style="display: flex; align-items: start; margin: 12px 0;">
                        <span style="background: #F44336; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                        <p style="margin: 0; line-height: 1.6;">O asignarte un nuevo PIN</p>
                    </div>
                </div>
                <div style="background: #FFEBEE; padding: 12px; border-radius: 8px; border-left: 4px solid #F44336; margin-top: 15px;">
                    <p style="margin: 0; font-size: 0.9em; color: #C62828;"><strong>⚠️ Importante:</strong> Solo el Dueño puede cambiar los PINes del Administrador y Dueño desde la configuración.</p>
                </div>
            `;
            break;
    }
    
    respuestaDiv.innerHTML = contenido;
    respuestaDiv.style.display = 'block';
    
    // Scroll suave a la respuesta
    setTimeout(() => {
        respuestaDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function enviarSugerencia(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('sugerenciaNombre').value || 'Anónimo';
    const tipo = document.getElementById('sugerenciaTipo').value;
    const texto = document.getElementById('sugerenciaTexto').value;
    
    if (!texto.trim()) {
        alert('Por favor escribe tu sugerencia.');
        return;
    }
    
    const sugerencia = {
        id: Date.now(),
        nombre: nombre,
        tipo: tipo,
        texto: texto,
        fecha: new Date().toLocaleString('es-CO')
    };
    
    // Obtener sugerencias guardadas
    let sugerencias = JSON.parse(localStorage.getItem('sugerencias') || '[]');
    sugerencias.unshift(sugerencia); // Agregar al inicio
    
    // Mantener solo las últimas 50 sugerencias
    if (sugerencias.length > 50) {
        sugerencias = sugerencias.slice(0, 50);
    }
    
    localStorage.setItem('sugerencias', JSON.stringify(sugerencias));
    
    // Limpiar formulario
    document.getElementById('sugerenciaNombre').value = '';
    document.getElementById('sugerenciaTexto').value = '';
    
    alert('✅ ¡Gracias por tu sugerencia! Ha sido guardada correctamente.');
    
    cargarSugerencias();
}

function cargarSugerencias() {
    const sugerencias = JSON.parse(localStorage.getItem('sugerencias') || '[]');
    const lista = document.getElementById('listaSugerencias');
    
    if (sugerencias.length === 0) {
        lista.innerHTML = '<p style="color: #999; font-style: italic;">No hay sugerencias aún.</p>';
        return;
    }
    
    let html = '';
    sugerencias.slice(0, 5).forEach(sug => {
        const iconos = {
            'mejora': '🔧',
            'error': '🐛',
            'nueva': '✨',
            'otro': '💭'
        };
        
        html += `
            <div style="background: #f9f9f9; padding: 10px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #4CAF50;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong>${iconos[sug.tipo]} ${sug.nombre}</strong>
                    <small style="color: #999;">${sug.fecha}</small>
                </div>
                <p style="margin: 5px 0; font-size: 0.9em;">${sug.texto}</p>
            </div>
        `;
    });
    
    lista.innerHTML = html;
}

// ========== NUEVAS FUNCIONALIDADES ==========

// 1. SISTEMA DE NOTIFICACIONES
function iniciarSistemaNotificaciones() {
    // Verificar notificaciones cada hora
    verificarNotificaciones();
    setInterval(verificarNotificaciones, 3600000); // Cada hora
}

function verificarNotificaciones() {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const hoy = new Date();
    notificacionesActivas = [];
    
    facturas.forEach(factura => {
        if (!factura.fechaEntrega || factura.estado === 'Entregada') return;
        
        const fechaEntrega = new Date(factura.fechaEntrega);
        const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias <= 2 && diferenciaDias >= 0) {
            notificacionesActivas.push({
                factura: factura.numero,
                cliente: factura.nombre,
                dias: diferenciaDias,
                tipo: 'proximo'
            });
        } else if (diferenciaDias < 0) {
            notificacionesActivas.push({
                factura: factura.numero,
                cliente: factura.nombre,
                dias: Math.abs(diferenciaDias),
                tipo: 'vencida'
            });
        }
    });
    
    actualizarBadgeNotificaciones();
}

function actualizarBadgeNotificaciones() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    if (notificacionesActivas.length > 0) {
        badge.textContent = notificacionesActivas.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function mostrarNotificaciones() {
    if (notificacionesActivas.length === 0) {
        alert('✅ No hay notificaciones pendientes');
        return;
    }
    
    let mensaje = '🔔 NOTIFICACIONES DE ENTREGA\\n\\n';
    
    notificacionesActivas.forEach(notif => {
        if (notif.tipo === 'proximo') {
            mensaje += `⚠️ Factura ${notif.factura} - ${notif.cliente}\\n`;
            mensaje += `   Entrega en ${notif.dias} día(s)\\n\\n`;
        } else {
            mensaje += `❌ Factura ${notif.factura} - ${notif.cliente}\\n`;
            mensaje += `   ¡Vencida hace ${notif.dias} día(s)!\\n\\n`;
        }
    });
    
    alert(mensaje);
}

// 2. CAMBIAR ESTADO DE PRENDA
function cambiarEstadoPrenda(numeroFactura, nuevoEstado) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numeroFactura);
    
    if (!factura) {
        alert('Factura no encontrada');
        return;
    }
    
    factura.estado = nuevoEstado;
    
    if (nuevoEstado === 'Entregada') {
        factura.completada = true;
        factura.fechaEntregaReal = new Date().toISOString();
    }
    
    localStorage.setItem('facturas', JSON.stringify(facturas));
    alert(`✅ Estado actualizado a: ${nuevoEstado}`);
    buscarFacturasAdmin();
}

// 3. BÚSQUEDA AVANZADA

function cargarTodasLasFacturas() {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const contenedor = document.getElementById('listaTodasFacturas');
    
    if (!contenedor) return;
    
    if (facturas.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">📋 No hay facturas registradas</p>';
        return;
    }
    
    // Ordenar por fecha más reciente
    const facturasOrdenadas = facturas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '<div style="display: grid; gap: 10px;">';
    
    facturasOrdenadas.forEach(factura => {
        const fecha = new Date(factura.fecha).toLocaleDateString();
        const estadoColor = {
            'Recibida': '#2196F3',
            'En Proceso': '#FF9800',
            'Lista': '#4CAF50',
            'Entregada': '#9E9E9E'
        }[factura.estado] || '#666';
        
        html += `
            <div style="
                background: white;
                border-left: 5px solid ${estadoColor};
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                display: grid;
                grid-template-columns: 1fr 1.5fr 1fr auto auto;
                gap: 15px;
                align-items: center;
            ">
                <div>
                    <div style="color: #333; font-size: 0.95em;"><strong>${factura.numero}</strong></div>
                    <div style="color: #666; font-size: 0.85em; margin-top: 3px;">${fecha}</div>
                </div>
                <div>
                    <div style="color: #333; font-size: 0.95em;">${factura.nombre}</div>
                    <div style="margin-top: 5px;">
                        <span style="
                            background: ${estadoColor};
                            color: white;
                            padding: 2px 8px;
                            border-radius: 10px;
                            font-size: 0.8em;
                        ">${factura.estado}</span>
                    </div>
                </div>
                <div>
                    <div style="color: #666; font-size: 0.9em;">CC: <strong>${factura.cedula}</strong></div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #333; font-size: 1em;"><strong>${formatearPesos(factura.precio)}</strong></div>
                    <div style="color: ${factura.saldo > 0 ? '#f44336' : '#4CAF50'}; font-size: 0.85em; margin-top: 3px;">
                        ${factura.saldo > 0 ? `Saldo: <strong>${formatearPesos(factura.saldo)}</strong>` : 'Pagado'}
                    </div>
                </div>
                <div>
                    <span onclick="abrirFacturaCompleta('${factura.numero}'); event.stopPropagation();" style="
                        color: #333;
                        cursor: pointer;
                        font-size: 0.9em;
                        text-decoration: underline;
                    ">Ver</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    contenedor.innerHTML = html;
}

let facturaActualParaDescargar = null; // Variable global para guardar factura actual

function abrirFacturaCompleta(numeroFactura) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numeroFactura);
    
    if (!factura) {
        alert('Factura no encontrada');
        return;
    }
    
    // Guardar factura actual
    facturaActualParaDescargar = factura;
    
    const fecha = new Date(factura.fecha).toLocaleString();
    const contenidoFactura = `
╔════════════════════════════════════════╗
║   GONZÀLEZ BROTHER'S - SASTRERÍA      ║
║      FACTURA COMPLETA                  ║
╚════════════════════════════════════════╝

📄 FACTURA: ${factura.numero}
📅 Fecha: ${fecha}
${factura.fechaEntrega ? `📆 Entrega: ${new Date(factura.fechaEntrega).toLocaleDateString()}` : ''}

──────────── DATOS DEL CLIENTE ──────────
👤 Nombre:     ${factura.nombre}
🆔 Cédula:     ${factura.cedula}
📱 Celular:    ${factura.celular}
📍 Dirección:  ${factura.direccion}

──────────── DESCRIPCIÓN ────────────────
${factura.trabajo}

──────────── VALORES ────────────────────
Precio Total:      $ ${formatearPesos(factura.precio)} COP
Abono:             $ ${formatearPesos(factura.abono)} COP
Saldo:             $ ${formatearPesos(factura.saldo)} COP
Estado Pago:       ${factura.estadoPago.toUpperCase()}

──────────── ESTADO ─────────────────────
Estado Prenda:     ${factura.estado}
${factura.completada ? 'Trabajo Completado' : 'En Proceso'}

──────────────────────────────────────────
${factura.senalador ? `📏 Recepcionado por: ${factura.senalador}` : ''}
${factura.creadoPor ? `👤 Creado por: ${factura.creadoPor}` : ''}
    `;
    
    // Mostrar en modal
    document.getElementById('facturaPreview').textContent = contenidoFactura;
    document.getElementById('facturaModal').style.display = 'flex';
}

function cerrarModalFactura() {
    document.getElementById('facturaModal').style.display = 'none';
    facturaActualParaDescargar = null;
}

function descargarFacturaActual() {
    if (!facturaActualParaDescargar) {
        alert('No hay factura para descargar');
        return;
    }
    
    const contenido = document.getElementById('facturaPreview').textContent;
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${facturaActualParaDescargar.numero}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Factura descargada exitosamente');
}

function imprimirFacturaActual() {
    if (!facturaActualParaDescargar) {
        alert('No hay factura para imprimir');
        return;
    }
    
    const contenido = document.getElementById('facturaPreview').textContent;
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <html>
        <head>
            <title>Factura ${facturaActualParaDescargar.numero}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    margin: 20px;
                    white-space: pre-wrap;
                    font-size: 12px;
                    line-height: 1.5;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>${contenido}</body>
        </html>
    `);
    ventanaImpresion.document.close();
    ventanaImpresion.print();
}

function busquedaAvanzada() {
    const filtros = {
        numeroFactura: document.getElementById('filtroNumero').value.toLowerCase(),
        cliente: document.getElementById('filtroCliente').value.toLowerCase(),
        sastre: document.getElementById('filtroSastre').value,
        estado: document.getElementById('filtroEstado').value,
        fechaInicio: document.getElementById('filtroFechaInicio').value,
        fechaFin: document.getElementById('filtroFechaFin').value
    };
    
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    
    const resultados = facturas.filter(f => {
        let cumple = true;
        
        if (filtros.numeroFactura && !f.numero.toLowerCase().includes(filtros.numeroFactura)) {
            cumple = false;
        }
        if (filtros.cliente && !f.nombre.toLowerCase().includes(filtros.cliente)) {
            cumple = false;
        }
        if (filtros.sastre && f.sastre !== filtros.sastre) {
            cumple = false;
        }
        if (filtros.estado && f.estado !== filtros.estado) {
            cumple = false;
        }
        if (filtros.fechaInicio) {
            const fechaFactura = new Date(f.fecha).toISOString().split('T')[0];
            if (fechaFactura < filtros.fechaInicio) {
                cumple = false;
            }
        }
        if (filtros.fechaFin) {
            const fechaFactura = new Date(f.fecha).toISOString().split('T')[0];
            if (fechaFactura > filtros.fechaFin) {
                cumple = false;
            }
        }
        
        return cumple;
    });
    
    mostrarResultadosBusqueda(resultados);
}

function mostrarResultadosBusqueda(resultados) {
    const contenedor = document.getElementById('resultadosBusqueda');
    
    if (resultados.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron resultados</p>';
        return;
    }
    
    let html = '<table class="tabla-facturas"><thead><tr><th>Factura</th><th>Cliente</th><th>Trabajo</th><th>Estado</th><th>Precio</th><th>Acciones</th></tr></thead><tbody>';
    
    resultados.forEach(f => {
        html += `
            <tr>
                <td>${f.numero}</td>
                <td>${f.nombre}</td>
                <td>${f.trabajo}</td>
                <td><span class="estado-badge ${f.estado.toLowerCase()}">${f.estado}</span></td>
                <td>${formatearPesos(f.precio)}</td>
                <td style="position: relative; z-index: 10; pointer-events: auto;">
                    <button onclick="abrirFacturaCompleta('${f.numero}'); event.stopPropagation();" class="btn-ver" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; font-size: 14px; position: relative; z-index: 100; pointer-events: auto;" onmouseover="this.style.background='#1976D2';" onmouseout="this.style.background='#2196F3';">Ver</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    contenedor.innerHTML = html;
}

// 4. MODO OSCURO
function toggleModoOscuro() {
    modoOscuro = !modoOscuro;
    localStorage.setItem('modoOscuro', modoOscuro);
    
    if (modoOscuro) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// 5. HISTORIAL DEL CLIENTE
function verHistorialCliente(cedula) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const historial = facturas.filter(f => f.cedula === cedula);
    
    if (historial.length === 0) {
        alert('Este cliente no tiene historial de trabajos');
        return;
    }
    
    const cliente = historial[0];
    const totalGastado = historial.reduce((sum, f) => sum + f.precio, 0);
    const trabajosCompletados = historial.filter(f => f.estado === 'Entregada').length;
    
    let html = `
        <div class="modal-historial">
            <h3>� Historial de ${cliente.nombre}</h3>
            <div class="stats-cliente">
                <div class="stat-box">
                    <span class="stat-numero">${historial.length}</span>
                    <span class="stat-label">Trabajos Totales</span>
                </div>
                <div class="stat-box">
                    <span class="stat-numero">${trabajosCompletados}</span>
                    <span class="stat-label">Completados</span>
                </div>
                <div class="stat-box">
                    <span class="stat-numero">${formatearPesos(totalGastado)}</span>
                    <span class="stat-label">Total Gastado</span>
                </div>
            </div>
            <div class="lista-trabajos">
                <h4>Trabajos:</h4>
    `;
    
    historial.forEach(f => {
        const fecha = new Date(f.fecha).toLocaleDateString('es-CO');
        html += `
            <div class="trabajo-item">
                <div class="trabajo-header">
                    <strong>${f.numero}</strong>
                    <span class="estado-badge ${f.estado.toLowerCase()}">${f.estado}</span>
                </div>
                <p>${f.trabajo}</p>
                <div class="trabajo-footer">
                    <span>${fecha}</span>
                    <strong>${formatearPesos(f.precio)}</strong>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            <button onclick="cerrarModal()" class="btn-cerrar">Cerrar</button>
        </div>
    `;
    
    mostrarModal(html);
}

function mostrarModal(contenido) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = contenido;
    modal.onclick = (e) => {
        if (e.target === modal) cerrarModal();
    };
    document.body.appendChild(modal);
}

function cerrarModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 6. WHATSAPP INTEGRATION
function enviarPorWhatsApp(numeroFactura) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numeroFactura);
    
    if (!factura) {
        alert('Factura no encontrada');
        return;
    }
    
    const telefono = factura.celular.replace(/\\D/g, '');
    const mensaje = `
🏪 *González Brother's - Sastrería*

� Factura: ${factura.numero}
👤 Cliente: ${factura.nombre}
🧵 Trabajo: ${factura.trabajo}
💵 Valor: ${formatearPesos(factura.precio)}
💵 Abono: ${formatearPesos(factura.abono)}
💳 Saldo: ${formatearPesos(factura.saldo)}
📈 Estado: ${factura.estado}

¡Gracias por confiar en nosotros! 🎩✨
    `.trim();
    
    const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function enviarRecordatorioWhatsApp(numeroFactura) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numeroFactura);
    
    if (!factura || !factura.fechaEntrega) {
        alert('Factura no encontrada o sin fecha de entrega');
        return;
    }
    
    const telefono = factura.celular.replace(/\\D/g, '');
    const fechaEntrega = new Date(factura.fechaEntrega).toLocaleDateString('es-CO');
    const mensaje = `
🔔 *Recordatorio de Entrega*

Hola ${factura.nombre}, 

Tu trabajo está ${factura.estado === 'Lista' ? '✅ *LISTO*' : 'en proceso'}.

� Factura: ${factura.numero}
🧵 Trabajo: ${factura.trabajo}
🗓️ Fecha de entrega: ${fechaEntrega}
💳 Saldo pendiente: ${formatearPesos(factura.saldo)}

📍 González Brother's - Sastrería
    `.trim();
    
    const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// 7. GENERAR CÓDIGO QR (usando API externa gratuita)
function generarQRFactura(numeroFactura) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(numeroFactura)}`;
    
    const modal = `
        <div class="modal-qr">
            <h3>📱 Código QR - Factura ${numeroFactura}</h3>
            <img src="${url}" alt="QR Code" style="margin: 20px auto; display: block;">
            <p style="text-align: center; color: #666;">Escanea para ver el estado de tu prenda</p>
            <button onclick="cerrarModal()" class="btn-cerrar">Cerrar</button>
        </div>
    `;
    
    mostrarModal(modal);
}

// 8. RECORDATORIOS AUTOMÁTICOS
function verificarRecordatorios() {
    const hoy = new Date();
    const dia = hoy.getDate();
    
    // Recordatorio de cierre de periodo (días 15 y último del mes)
    if (dia === 15 || dia === new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()) {
        if (!localStorage.getItem(`recordatorio_${dia}_${hoy.getMonth()}`)) {
            alert('⏰ Recordatorio: Hoy es día de cerrar el periodo de liquidación');
            localStorage.setItem(`recordatorio_${dia}_${hoy.getMonth()}`, 'true');
        }
    }
    
    // Recordatorio de respaldo semanal (domingos)
    if (hoy.getDay() === 0) {
        if (!localStorage.getItem(`respaldo_semana_${hoy.getWeek()}`)) {
            alert('💾 Recordatorio: Realiza un respaldo semanal de la información');
            localStorage.setItem(`respaldo_semana_${hoy.getWeek()}`, 'true');
        }
    }
}

// Helper para obtener número de semana
Date.prototype.getWeek = function() {
    const onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

// Ejecutar verificación de recordatorios cada 12 horas
setInterval(verificarRecordatorios, 43200000);

// 9. DASHBOARD Y ESTADÍSTICAS
function cargarDashboard() {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anoActual = hoy.getFullYear();
    
    // Facturas del mes actual
    const facturasDelMes = facturas.filter(f => {
        const fecha = new Date(f.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anoActual;
    });
    
    // Estadísticas generales
    document.getElementById('totalFacturas').textContent = facturas.length;
    document.getElementById('facturasCompletadas').textContent = facturas.filter(f => f.estado === 'Entregada').length;
    document.getElementById('facturasEnProceso').textContent = facturas.filter(f => f.estado === 'En Proceso' || f.estado === 'Lista').length;
    
    // Ingresos del mes
    const ingresosMes = facturasDelMes.reduce((sum, f) => sum + (f.abono || 0), 0);
    document.getElementById('ingresosMes').textContent = formatearPesos(ingresosMes);
    
    // Ranking de sastres
    cargarRankingSastres(facturasDelMes);
    
    // Gráfico de producción (opcional - requiere Chart.js)
    // cargarGraficoProduccion();
}

function cargarRankingSastres(facturas) {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const sastres = empleados.filter(e => e.rol === 'Sastre' && e.activo);
    
    const ranking = sastres.map(sastre => {
        const trabajos = facturas.filter(f => f.sastre === sastre.nombre);
        const completados = trabajos.filter(f => f.estado === 'Entregada').length;
        const total = trabajos.reduce((sum, f) => sum + (f.precio || 0), 0);
        
        return {
            nombre: sastre.nombre,
            trabajos: trabajos.length,
            completados: completados,
            total: total
        };
    }).sort((a, b) => b.total - a.total);
    
    const contenedor = document.getElementById('rankingSastres');
    let html = '<table style="width: 100%;"><thead><tr><th>Posición</th><th>Sastre</th><th>Trabajos</th><th>Completados</th><th>Total Producido</th></tr></thead><tbody>';
    
    ranking.forEach((sastre, index) => {
        const medalla = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`;
        html += `
            <tr>
                <td style="text-align: center; font-size: 1.5em;">${medalla}</td>
                <td><strong>${sastre.nombre}</strong></td>
                <td>${sastre.trabajos}</td>
                <td>${sastre.completados}</td>
                <td style="color: #4CAF50; font-weight: bold;">${formatearPesos(sastre.total)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    contenedor.innerHTML = html || '<p style="text-align: center; color: #999;">No hay datos de producción</p>';
}

function limpiarFiltros() {
    document.getElementById('filtroNumero').value = '';
    document.getElementById('filtroCliente').value = '';
    document.getElementById('filtroSastre').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaInicio').value = '';
    document.getElementById('filtroFechaFin').value = '';
    document.getElementById('resultadosBusqueda').innerHTML = '<p style="text-align: center; color: #999;">Usa los filtros para buscar facturas</p>';
}

function verDetalleFactura(numeroFactura) {
    abrirFacturaCompleta(numeroFactura);
}

// 10. EXPORTAR A PDF
function exportarFacturaPDF(numeroFactura) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numeroFactura);
    
    if (!factura) {
        alert('Factura no encontrada');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let y = 20;
    
    // Encabezado
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("GONZÁLEZ BROTHER'S", pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(16);
    doc.text('SASTRERÍA', pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Información de la factura
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Factura: ${factura.numero}`, margin, y);
    y += 7;
    
    doc.setFont(undefined, 'normal');
    const fecha = new Date(factura.fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Fecha: ${fecha}`, margin, y);
    y += 10;
    
    // Información del cliente
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL CLIENTE', margin, y);
    y += 7;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Cliente: ${factura.nombre}`, margin, y);
    y += 6;
    doc.text(`Cedula: ${factura.cedula}`, margin, y);
    y += 6;
    doc.text(`Celular: ${factura.celular}`, margin, y);
    y += 6;
    doc.text(`Direccion: ${factura.direccion}`, margin, y);
    y += 10;
    
    // Descripción del trabajo
    doc.setFont(undefined, 'bold');
    doc.text('DESCRIPCION DEL TRABAJO', margin, y);
    y += 7;
    
    doc.setFont(undefined, 'normal');
    const trabajoLines = doc.splitTextToSize(factura.trabajo, pageWidth - 2 * margin);
    doc.text(trabajoLines, margin, y);
    y += trabajoLines.length * 6 + 10;
    
    // Estado de la prenda
    doc.setFont(undefined, 'bold');
    doc.text(`Estado: ${factura.estado || 'Recibida'}`, margin, y);
    y += 10;
    
    // Información de pago
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACION DE PAGO', margin, y);
    y += 7;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Precio Total: ${formatearPesos(factura.precio)}`, margin, y);
    y += 6;
    doc.text(`Abono: ${formatearPesos(factura.abono)}`, margin, y);
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text(`SALDO: ${formatearPesos(factura.saldo)}`, margin, y);
    y += 15;
    
    // Fecha de entrega
    if (factura.fechaEntrega) {
        const fechaEntrega = new Date(factura.fechaEntrega).toLocaleDateString('es-CO');
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Fecha de Entrega: ${fechaEntrega}`, margin, y);
        y += 10;
    }
    
    // Pie de página
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('Gracias por su preferencia!', pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });
    
    // Guardar PDF
    doc.save(`Factura_${factura.numero}.pdf`);
    cerrarModal();
}

function exportarVolantePDF() {
    const trabajadorId = document.getElementById('trabajadorSelectLiquidacion').value;
    
    if (!trabajadorId) {
        alert('Selecciona un trabajador');
        return;
    }
    
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const trabajador = empleados.find(e => e.id == trabajadorId);
    
    if (!trabajador) return;
    
    const sumaBruta = document.getElementById('pagoNeto').parentElement.querySelector('.amount-display').textContent.replace(/[^0-9]/g, '');
    const montoSalud = document.getElementById('montoSalud').textContent.replace(/[^0-9]/g, '');
    const montoPension = document.getElementById('montoPension').textContent.replace(/[^0-9]/g, '');
    const montoPrestamo = document.getElementById('montoPrestamo').value || '0';
    const otrosDescuentos = document.getElementById('otrosDescuentos').value || '0';
    const conceptoOtros = document.getElementById('conceptoOtros').value;
    const pagoNeto = document.getElementById('pagoNeto').textContent.replace(/[^0-9]/g, '');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let y = 20;
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("VOLANTE DE LIQUIDACION", pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(14);
    doc.text("Gonzalez Brother's - Sastreria", pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Línea
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Información del empleado
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL TRABAJADOR', margin, y);
    y += 7;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${trabajador.nombre}`, margin, y);
    y += 6;
    doc.text(`Rol: ${trabajador.rol}`, margin, y);
    y += 6;
    doc.text(`Cedula: ${trabajador.cedula || 'N/A'}`, margin, y);
    y += 6;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margin, y);
    y += 6;
    doc.text(`Periodo: ${new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`, margin, y);
    y += 12;
    
    // Detalle de producción
    doc.setFont(undefined, 'bold');
    doc.text('DETALLE DE PRODUCCION', margin, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    
    if (trabajador.rol === 'Sastre') {
        const totalProducido = document.getElementById('sastreTotalProducido').textContent;
        const porcentaje = document.getElementById('sastrePorcentaje').textContent;
        doc.text(`Total Producido:`, margin, y);
        doc.text(`${totalProducido}`, pageWidth - margin - 40, y);
        y += 6;
        doc.text(`Porcentaje Sastre: ${porcentaje}%`, margin, y);
        y += 6;
    } else if (trabajador.rol === 'Senalador') {
        const totalRecep = document.getElementById('senaladorTotalRecepcionado').textContent;
        const porcentaje = document.getElementById('senaladorPorcentaje').textContent;
        doc.text(`Total Recepcionado:`, margin, y);
        doc.text(`${totalRecep}`, pageWidth - margin - 40, y);
        y += 6;
        doc.text(`Porcentaje Senalador: ${porcentaje}%`, margin, y);
        y += 6;
    } else if (trabajador.rol === 'Domiciliario') {
        const domicilios = document.getElementById('domiciliosCantidad').textContent;
        const pagoUnitario = document.getElementById('domicilioPagoUnitario').textContent;
        doc.text(`Domicilios Realizados: ${domicilios}`, margin, y);
        y += 6;
        doc.text(`Pago por Domicilio: ${pagoUnitario}`, margin, y);
        y += 6;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Suma Bruta:', margin, y);
    doc.text(formatearPesos(sumaBruta), pageWidth - margin - 40, y);
    y += 12;
    
    // Deducciones
    doc.setFont(undefined, 'bold');
    doc.text('DEDUCCIONES', margin, y);
    y += 7;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Salud (4%):`, margin, y);
    doc.text(formatearPesos(montoSalud), pageWidth - margin - 40, y);
    y += 6;
    doc.text(`Pension (4%):`, margin, y);
    doc.text(formatearPesos(montoPension), pageWidth - margin - 40, y);
    y += 6;
    doc.text(`Prestamos:`, margin, y);
    doc.text(formatearPesos(montoPrestamo), pageWidth - margin - 40, y);
    y += 6;
    doc.text(`Otros Descuentos:`, margin, y);
    doc.text(formatearPesos(otrosDescuentos), pageWidth - margin - 40, y);
    y += 6;
    
    if (conceptoOtros) {
        doc.setFontSize(10);
        doc.text(`Concepto: ${conceptoOtros}`, margin, y);
        y += 6;
        doc.setFontSize(12);
    }
    y += 6;
    
    // Línea
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    
    // Total Neto
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PAGO NETO:', margin, y);
    doc.text(formatearPesos(pagoNeto), pageWidth - margin - 40, y);
    y += 15;
    
    // Firmas
    y = doc.internal.pageSize.height - 50;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.line(margin, y, margin + 60, y);
    doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
    y += 5;
    doc.text('Firma Empleado', margin + 10, y);
    doc.text('Firma Empleador', pageWidth - margin - 50, y);
    
    // Guardar
    doc.save(`Volante_Liquidacion_${trabajador.nombre.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    alert('Volante de liquidacion exportado correctamente');
}

// ============================================
// SISTEMA DE SINCRONIZACIÓN
// ============================================

async function cargarDatosDeFirebase() {
    const modo = localStorage.getItem('modoSincronizacion') || 'firebase';
    if (modo !== 'firebase' || typeof cargarDeFirebase !== 'function') return;
    
    try {
        console.log('🔄 Cargando TODOS los datos de Firebase...');
        
        // Esperar a que Firebase se inicialice
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Cargar todas las colecciones
        const colecciones = [
            { nombre: 'facturas', clave: 'facturas' },
            { nombre: 'clientes', clave: 'clientes' },
            { nombre: 'empleados', clave: 'empleados' },
            { nombre: 'sastres', clave: 'sastres' },
            { nombre: 'senaladores', clave: 'senaladores' },
            { nombre: 'prendas', clave: 'prendas' }
        ];
        
        for (const coleccion of colecciones) {
            try {
                const datos = await cargarDeFirebase(coleccion.nombre);
                if (datos && datos[coleccion.clave]) {
                    localStorage.setItem(coleccion.clave, JSON.stringify(datos[coleccion.clave]));
                    console.log(`✅ ${coleccion.nombre} sincronizados:`, datos[coleccion.clave].length);
                }
            } catch (err) {
                console.log(`⚠️ ${coleccion.nombre} no encontrado en Firebase (usando local)`);
            }
        }
        
        // Cargar configuración
        try {
            const config = await cargarDeFirebase('config');
            if (config) {
                localStorage.setItem('config', JSON.stringify(config));
                console.log('✅ Configuración sincronizada');
            }
        } catch (err) {
            console.log('⚠️ Configuración no encontrada en Firebase (usando local)');
        }
        
        console.log('✅ Sincronización inicial completa');
    } catch (error) {
        console.error('❌ Error cargando de Firebase:', error);
    }
}

// Función auxiliar para guardar y sincronizar automáticamente
function guardarYSincronizar(clave, datos) {
    // Guardar localmente
    localStorage.setItem(clave, JSON.stringify(datos));
    
    // Sincronizar con Firebase si está activo
    const modo = localStorage.getItem('modoSincronizacion') || 'firebase';
    if (modo === 'firebase' && typeof guardarEnFirebase === 'function') {
        const objetoDatos = {};
        objetoDatos[clave] = datos;
        guardarEnFirebase(clave, objetoDatos).catch(err => {
            console.error(`Error sincronizando ${clave}:`, err);
        });
    }
}

function cargarModoSincronizacion() {
    const modo = localStorage.getItem('modoSincronizacion') || 'firebase';
    const select = document.getElementById('modoSincronizacion');
    if (select) {
        select.value = modo;
        if (modo === 'servidor') {
            document.getElementById('configServidor').style.display = 'block';
            const urlGuardada = localStorage.getItem('servidorURL');
            if (urlGuardada) {
                document.getElementById('servidorURL').value = urlGuardada;
            }
        }
        actualizarEstadoSync(modo);
    }
    
    // Actualizar indicador de sede
    const config = JSON.parse(localStorage.getItem('config') || '{}');
    const sedeEl = document.getElementById('sedeActual');
    if (sedeEl) {
        sedeEl.textContent = config.nombreSede || 'Sede Principal';
    }
}

function configurarSincronizacion() {
    const select = document.getElementById('modoSincronizacion');
    const modo = select.value;
    
    localStorage.setItem('modoSincronizacion', modo);
    
    if (modo === 'servidor') {
        document.getElementById('configServidor').style.display = 'block';
    } else {
        document.getElementById('configServidor').style.display = 'none';
    }
    
    if (modo === 'firebase') {
        if (typeof cambiarModoSincronizacion === 'function') {
            cambiarModoSincronizacion('firebase');
        }
    }
    
    actualizarEstadoSync(modo);
}

function actualizarEstadoSync(modo) {
    const estadoEl = document.getElementById('estadoSync');
    if (!estadoEl) return;
    
    const mensajes = {
        'local': '💾 Los datos se guardan solo en este dispositivo',
        'firebase': '☁️ Sincronización en la nube - Los cambios se comparten en tiempo real',
        'servidor': '🌐 Sincronización en red local - Requiere servidor activo'
    };
    
    estadoEl.textContent = mensajes[modo] || '';
    estadoEl.style.color = modo === 'local' ? '#666' : '#4CAF50';
}

async function sincronizarAhora() {
    const modo = localStorage.getItem('modoSincronizacion') || 'firebase';
    
    if (modo === 'local') {
        alert('⚠️ Sincronización desactivada. Activa Firebase o Servidor para sincronizar.');
        return;
    }
    
    if (typeof actualizarIndicadorSync === 'function') {
        actualizarIndicadorSync('sincronizando');
    }
    
    const estadoEl = document.getElementById('estadoSync');
    if (estadoEl) {
        estadoEl.textContent = '🔄 Sincronizando datos...';
        estadoEl.style.color = '#FFC107';
    }
    
    try {
        if (modo === 'firebase' && typeof guardarEnFirebase === 'function') {
            // Subir TODOS los datos locales a Firebase
            const colecciones = [
                { nombre: 'facturas', datos: JSON.parse(localStorage.getItem('facturas') || '[]') },
                { nombre: 'clientes', datos: JSON.parse(localStorage.getItem('clientes') || '[]') },
                { nombre: 'empleados', datos: JSON.parse(localStorage.getItem('empleados') || '[]') },
                { nombre: 'sastres', datos: JSON.parse(localStorage.getItem('sastres') || '[]') },
                { nombre: 'senaladores', datos: JSON.parse(localStorage.getItem('senaladores') || '[]') },
                { nombre: 'prendas', datos: JSON.parse(localStorage.getItem('prendas') || '[]') }
            ];
            
            // Guardar todas las colecciones
            for (const col of colecciones) {
                const objetoDatos = {};
                objetoDatos[col.nombre] = col.datos;
                await guardarEnFirebase(col.nombre, objetoDatos);
                console.log(`✅ ${col.nombre} subidos:`, col.datos.length);
            }
            
            // Guardar configuración
            const config = JSON.parse(localStorage.getItem('config') || '{}');
            await guardarEnFirebase('config', config);
            
            // Cargar datos actualizados de Firebase
            if (typeof cargarDeFirebase === 'function') {
                for (const col of colecciones) {
                    const datosFirebase = await cargarDeFirebase(col.nombre);
                    if (datosFirebase && datosFirebase[col.nombre]) {
                        localStorage.setItem(col.nombre, JSON.stringify(datosFirebase[col.nombre]));
                    }
                }
                
                // Recargar vistas si existen
                if (typeof cargarTodasLasFacturas === 'function') {
                    cargarTodasLasFacturas();
                }
                if (typeof cargarListaEmpleados === 'function') {
                    cargarListaEmpleados();
                }
            }
            
            if (estadoEl) {
                estadoEl.textContent = '✅ Sincronización completada';
                estadoEl.style.color = '#4CAF50';
            }
            
            if (typeof actualizarIndicadorSync === 'function') {
                actualizarIndicadorSync('sincronizado');
            }
            
            if (typeof actualizarUltimaSync === 'function') {
                actualizarUltimaSync();
            }
            
            setTimeout(() => {
                if (estadoEl) {
                    estadoEl.textContent = '☁️ Sincronización en la nube - Los cambios se comparten en tiempo real';
                }
            }, 3000);
            
        } else if (modo === 'servidor') {
            alert('⚠️ Sincronización con servidor local aún no implementada');
            if (estadoEl) {
                estadoEl.textContent = '⚠️ Servidor local no disponible';
                estadoEl.style.color = '#F44336';
            }
        }
    } catch (error) {
        console.error('Error sincronizando:', error);
        if (estadoEl) {
            estadoEl.textContent = '❌ Error al sincronizar: ' + error.message;
            estadoEl.style.color = '#F44336';
        }
        if (typeof actualizarIndicadorSync === 'function') {
            actualizarIndicadorSync('error');
        }
    }
}

async function migrarDatosAntiguos() {
    const modo = localStorage.getItem('modoSincronizacion') || 'firebase';
    
    if (modo !== 'firebase') {
        alert('⚠️ Esta función solo funciona con sincronización Firebase activa.');
        return;
    }
    
    if (!confirm('📦 Esta función migrará todos los datos antiguos (sin prefijo de sede) al formato nuevo.\n\n¿Continuar?')) {
        return;
    }
    
    const estadoEl = document.getElementById('estadoSync');
    if (estadoEl) {
        estadoEl.textContent = '📦 Migrando datos antiguos...';
        estadoEl.style.color = '#FF9800';
    }
    
    try {
        if (typeof cargarDatosDeFirebase === 'function') {
            await cargarDatosDeFirebase();
            
            if (estadoEl) {
                estadoEl.textContent = '✅ Migración completada - Recargando vistas...';
                estadoEl.style.color = '#4CAF50';
            }
            
            // Recargar todas las vistas
            if (typeof cargarTodasLasFacturas === 'function') {
                cargarTodasLasFacturas();
            }
            if (typeof cargarListaEmpleados === 'function') {
                cargarListaEmpleados();
            }
            if (typeof cargarTrabajadoresSelect === 'function') {
                cargarTrabajadoresSelect('Sastre');
                cargarTrabajadoresSelect('Señalador');
                cargarTrabajadoresSelect('Domiciliario');
            }
            
            alert('✅ Datos migrados exitosamente\n\nAhora deberías ver tus facturas y empleados.');
            
            setTimeout(() => {
                if (estadoEl) {
                    estadoEl.textContent = '☁️ Sincronización en la nube - Los cambios se comparten en tiempo real';
                }
            }, 3000);
        }
    } catch (error) {
        console.error('Error migrando datos:', error);
        if (estadoEl) {
            estadoEl.textContent = '❌ Error en la migración: ' + error.message;
            estadoEl.style.color = '#F44336';
        }
        alert('❌ Error al migrar datos. Ver consola para detalles.');
    }
}

async function probarConexion() {
    const urlInput = document.getElementById('servidorURL');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Por favor ingresa la URL del servidor');
        return;
    }
    
    // Guardar URL
    localStorage.setItem('servidorURL', url);
    
    try {
        const response = await fetch(`${url}/api/status`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(`✅ Conexión exitosa!\n\nServidor: ${data.servidor}\nVersión: ${data.version}`);
            document.getElementById('estadoSync').textContent = '✅ Conectado al servidor local';
            document.getElementById('estadoSync').style.color = '#4CAF50';
        } else {
            throw new Error('Servidor no responde');
        }
    } catch (error) {
        alert(`❌ Error de conexión:\n\n${error.message}\n\nVerifica que:\n1. El servidor esté iniciado (npm start)\n2. La URL sea correcta\n3. Estés en la misma red WiFi`);
        document.getElementById('estadoSync').textContent = '❌ No se puede conectar al servidor';
        document.getElementById('estadoSync').style.color = '#f44336';
    }
}

