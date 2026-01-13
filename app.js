// ============================================
// SISTEMA DE GESTIÓN - GONZÀLEZ BROTHER´S
// SastreControl: Gestión de Producción
// ============================================

// Estado Global
let currentUser = null;
let currentRole = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Crear configuración inicial si no existe
    if (!localStorage.getItem('config')) {
        const defaultConfig = {
            adminPin: '1234',
            ownerPin: '0000',
            salud: 4,
            pension: 4
        };
        localStorage.setItem('config', JSON.stringify(defaultConfig));
    }

    // Lista de sastres
    if (!localStorage.getItem('sastres')) {
        localStorage.setItem('sastres', JSON.stringify([]));
    }

    // Lista de señaladores
    if (!localStorage.getItem('senaladores')) {
        localStorage.setItem('senaladores', JSON.stringify([]));
    }

    // Lista de empleados
    if (!localStorage.getItem('empleados')) {
        localStorage.setItem('empleados', JSON.stringify([]));
    }

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
    } else if (role === 'senalador') {
        document.getElementById('authTitle').textContent = 'Señalador - Iniciar Sesión';
        document.getElementById('senaladorAuth').style.display = 'block';
    } else if (role === 'sastre') {
        document.getElementById('authTitle').textContent = 'Sastre - Iniciar Sesión';
        document.getElementById('sastreAuth').style.display = 'block';
        cargarSastresSelect();
    } else if (role === 'admin') {
        document.getElementById('authTitle').textContent = 'Administrador - Iniciar Sesión';
        document.getElementById('adminAuth').style.display = 'block';
    } else if (role === 'owner') {
        document.getElementById('authTitle').textContent = 'Dueño - Iniciar Sesión';
        document.getElementById('ownerAuth').style.display = 'block';
    }
}

function cargarSastresSelect() {
    const sastres = JSON.parse(localStorage.getItem('sastres') || '[]');
    const select = document.getElementById('sastreSelect');
    select.innerHTML = '<option value="">-- Seleccionar --</option>' +
        sastres.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
}

function loginDomiciliario() {
    const name = document.getElementById('domiciliarioName').value.trim();
    console.log('Login Domiciliario - Nombre:', name);
    
    if (!name) {
        alert('Por favor, ingresa tu nombre');
        return;
    }
    
    // Verificar que el usuario esté registrado como empleado
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const empleadoEncontrado = empleados.find(e => 
        e.nombre.toLowerCase() === name.toLowerCase() && 
        e.rol === 'Domiciliario' && 
        e.estado === 'activo'
    );
    
    if (!empleadoEncontrado) {
        alert('⚠️ Acceso Denegado\n\nNo estás registrado como Domiciliario o tu cuenta está inactiva.\n\nContacta al Administrador para que te registre.');
        return;
    }
    
    currentUser = empleadoEncontrado.nombre;
    console.log('Mostrando pantalla domiciliario para:', currentUser);
    showScreen('domiciliarioScreen');
    initDomiciliarioScreen();
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

function loginSenalador() {
    const name = document.getElementById('senaladorName').value.trim();
    
    if (!name) {
        alert('Por favor, ingresa tu nombre');
        return;
    }
    
    // Verificar que el usuario esté registrado como empleado
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const empleadoEncontrado = empleados.find(e => 
        e.nombre.toLowerCase() === name.toLowerCase() && 
        e.rol === 'Señalador' && 
        e.estado === 'activo'
    );
    
    if (!empleadoEncontrado) {
        alert('⚠️ Acceso Denegado\n\nNo estás registrado como Señalador o tu cuenta está inactiva.\n\nContacta al Administrador para que te registre.');
        return;
    }
    
    currentUser = empleadoEncontrado.nombre;
    
    // Agregar a lista de señaladores si no existe
    const senaladores = JSON.parse(localStorage.getItem('senaladores') || '[]');
    if (!senaladores.includes(currentUser)) {
        senaladores.push(currentUser);
        localStorage.setItem('senaladores', JSON.stringify(senaladores));
    }
    
    showScreen('senaladorScreen');
    initSenaladorScreen();
}

function loginSastre() {
    const sastreId = document.getElementById('sastreSelect').value;
    const pin = document.getElementById('sastrePin').value;
    
    if (!sastreId) {
        alert('Selecciona un sastre');
        return;
    }
    
    const sastres = JSON.parse(localStorage.getItem('sastres') || '[]');
    const sastre = sastres.find(s => s.id == sastreId);
    
    if (!sastre) {
        alert('Sastre no encontrado');
        return;
    }
    
    if (pin !== sastre.pin) {
        alert('PIN incorrecto');
        return;
    }
    
    currentUser = sastre.nombre;
    showScreen('sastreScreen');
    initSastreScreen();
}

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
    localStorage.setItem('clientes', JSON.stringify(clientes));
    
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
    localStorage.setItem('facturas', JSON.stringify(facturas));
    
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
                    <th>Cédula</th>
                    <th>Trabajo</th>
                    <th>Precio</th>
                    <th>Abono</th>
                    <th>Saldo</th>
                    <th>Estado</th>
                    <th>Señalador</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    facturas.forEach(f => {
        const fecha = new Date(f.fecha);
        tabla += `
            <tr>
                <td><strong>${f.numero}</strong></td>
                <td>${fecha.toLocaleDateString()}</td>
                <td>${f.nombre}</td>
                <td>${f.cedula}</td>
                <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${f.trabajo}</td>
                <td>$ ${formatearPesos(f.precio)}</td>
                <td>$ ${formatearPesos(f.abono)}</td>
                <td>$ ${formatearPesos(f.saldo)}</td>
                <td><span class="factura-estado ${f.estadoPago}">${f.estadoPago.toUpperCase()}</span></td>
                <td>📏 ${f.senalador}</td>
                <td>
                    <button onclick="verFacturaDetalle('${f.numero}')" class="btn-ver" style="padding: 4px 8px; margin: 2px;">👁️</button>
                    <button onclick="imprimirFacturaPorNumero('${f.numero}')" class="btn-imprimir" style="padding: 4px 8px; margin: 2px;">🖨️</button>
                </td>
            </tr>
        `;
    });
    
    tabla += `</tbody></table>`;
    container.innerHTML = tabla;
}

function imprimirFactura(factura) {
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
Precio Total:      $ ${formatearPesos(factura.precio)} COP
Abono:             $ ${formatearPesos(factura.abono)} COP
Saldo:             $ ${formatearPesos(factura.saldo)} COP
Estado de Pago:    ${factura.estadoPago.toUpperCase()}

──────────────────────────────────────────
Recepcionado por: ${factura.senalador}


__________________________________________
Firma del Cliente

    `;
    
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${factura.numero}.txt`;
    a.click();
}

function imprimirFacturaPorNumero(numero) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numero);
    if (factura) {
        imprimirFactura(factura);
    }
}

function verFacturaDetalle(numero) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
    const factura = facturas.find(f => f.numero === numero);
    if (factura) {
        alert(`
FACTURA: ${factura.numero}

Cliente: ${factura.nombre}
Cédula: ${factura.cedula}
Celular: ${factura.celular}
Dirección: ${factura.direccion}

Trabajo:
${factura.trabajo}

Precio: $ ${formatearPesos(factura.precio)}
Abono: $ ${formatearPesos(factura.abono)}
Saldo: $ ${formatearPesos(factura.saldo)}

Estado: ${factura.estadoPago}
Recepcionado por: ${factura.senalador}
Fecha: ${new Date(factura.fecha).toLocaleString()}
        `);
    }
}

// ============================================
// DASHBOARD DEL SASTRE
// ============================================

function initSastreScreen() {
    document.getElementById('sastreNameDisplay').textContent = currentUser;
    
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
    localStorage.setItem('prendas', JSON.stringify(prendas));
    
    // Marcar factura como completada
    factura.completada = true;
    factura.sastreAsignado = currentUser;
    factura.fechaCompletado = fecha;
    localStorage.setItem('facturas', JSON.stringify(facturas));
    
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
    select.innerHTML = '<option value="">-- Seleccionar --</option>' +
        senaladores.map(s => `<option value="${s}">${s}</option>`).join('');
}

function agregarSastre(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nuevoSastreNombre').value.trim();
    const pin = document.getElementById('nuevoSastrePin').value.trim();
    
    if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
        alert('El PIN debe ser de 4 dígitos numéricos');
        return;
    }
    
    const sastres = JSON.parse(localStorage.getItem('sastres') || '[]');
    
    if (sastres.some(s => s.nombre.toLowerCase() === nombre.toLowerCase())) {
        alert('Ya existe un sastre con ese nombre');
        return;
    }
    
    const nuevoSastre = {
        id: Date.now(),
        nombre,
        pin,
        fechaCreacion: new Date().toISOString()
    };
    
    sastres.push(nuevoSastre);
    localStorage.setItem('sastres', JSON.stringify(sastres));
    
    document.getElementById('nuevoSastreNombre').value = '';
    document.getElementById('nuevoSastrePin').value = '';
    
    alert('✅ Sastre agregado exitosamente');
    cargarTablaSastres();
}

function cargarTablaSastres() {
    const sastres = JSON.parse(localStorage.getItem('sastres') || '[]');
    const container = document.getElementById('tablaSastresRegistrados');
    
    if (sastres.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay sastres registrados</p>';
        return;
    }
    
    let tabla = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>PIN</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sastres.forEach(s => {
        const fecha = new Date(s.fechaCreacion);
        tabla += `
            <tr>
                <td>👔 ${s.nombre}</td>
                <td>••••</td>
                <td>${fecha.toLocaleDateString()}</td>
                <td>
                    <button onclick="eliminarSastre(${s.id})" style="padding: 4px 8px; background: #F44336; color: white; border: none; border-radius: 4px; cursor: pointer;">❌ Eliminar</button>
                    <button onclick="cambiarPinSastre(${s.id})" style="padding: 4px 8px; background: #FFC107; color: #000; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">🔑 Cambiar PIN</button>
                </td>
            </tr>
        `;
    });
    
    tabla += `</tbody></table>`;
    container.innerHTML = tabla;
}

function eliminarSastre(id) {
    if (!confirm('¿Estás seguro de eliminar este sastre?')) return;
    
    const sastres = JSON.parse(localStorage.getItem('sastres') || '[]');
    const nuevosSastres = sastres.filter(s => s.id !== id);
    localStorage.setItem('sastres', JSON.stringify(nuevosSastres));
    
    alert('Sastre eliminado');
    cargarTablaSastres();
}

function cambiarPinSastre(id) {
    const nuevoPin = prompt('Ingresa el nuevo PIN (4 dígitos):');
    
    if (!nuevoPin || nuevoPin.length !== 4 || !/^[0-9]{4}$/.test(nuevoPin)) {
        alert('PIN inválido. Debe ser de 4 dígitos numéricos');
        return;
    }
    
    const sastres = JSON.parse(localStorage.getItem('sastres') || '[]');
    const sastre = sastres.find(s => s.id === id);
    
    if (sastre) {
        sastre.pin = nuevoPin;
        localStorage.setItem('sastres', JSON.stringify(sastres));
        alert('✅ PIN actualizado exitosamente');
    }
}

function agregarEmpleado(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nuevoEmpleadoNombre').value.trim();
    const rol = document.getElementById('nuevoEmpleadoRol').value;
    const cedula = document.getElementById('nuevoEmpleadoCedula').value.trim();
    const telefono = document.getElementById('nuevoEmpleadoTelefono').value.trim();
    
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    
    if (empleados.some(e => e.cedula === cedula)) {
        alert('Ya existe un empleado con esa cédula');
        return;
    }
    
    const nuevoEmpleado = {
        id: Date.now(),
        nombre,
        rol,
        cedula,
        telefono,
        fechaRegistro: new Date().toISOString(),
        activo: true
    };
    
    empleados.push(nuevoEmpleado);
    localStorage.setItem('empleados', JSON.stringify(empleados));
    
    document.getElementById('nuevoEmpleadoNombre').value = '';
    document.getElementById('nuevoEmpleadoRol').value = '';
    document.getElementById('nuevoEmpleadoCedula').value = '';
    document.getElementById('nuevoEmpleadoTelefono').value = '';
    
    alert('✅ Empleado agregado exitosamente');
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
        'domiciliario': '🚗',
        'senalador': '�',
        'cortador': '✂️',
        'planchador': '👔',
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
        estado: 'pendiente',
        completada: false,
        creadoPor: 'Administrador'
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
    
    alert(`✅ Factura ${numeroFactura} creada exitosamente`);
    imprimirFactura(factura);
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
    } else if (tabName === 'gestionSastres') {
        cargarTablaSastres();
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
    }
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
                <td>👔 ${p.sastre}</td>
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

function cargarSastresSelect() {
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const sastres = [...new Set(prendas.map(p => p.sastre))];
    
    const select = document.getElementById('sastreSelectLiquidacion');
    select.innerHTML = '<option value="">-- Seleccionar --</option>' +
        sastres.map(s => `<option value="${s}">${s}</option>`).join('');
}

function calcularLiquidacion() {
    const sastreSeleccionado = document.getElementById('sastreSelectLiquidacion').value;
    
    if (!sastreSeleccionado) {
        document.getElementById('liquidacionPanel').style.display = 'none';
        return;
    }
    
    document.getElementById('liquidacionPanel').style.display = 'block';
    
    const prendas = JSON.parse(localStorage.getItem('prendas') || '[]');
    const mesActual = new Date().toISOString().slice(0, 7);
    
    const prendasSastre = prendas.filter(p => 
        p.sastre === sastreSeleccionado && 
        p.fecha.slice(0, 7) === mesActual &&
        p.tipo !== 'garantia'
    );
    
    const sumaBruta = prendasSastre.reduce((sum, p) => sum + p.precio, 0);
    
    const porcentajeSalud = parseFloat(document.getElementById('porcentajeSalud').value) || 0;
    const porcentajePension = parseFloat(document.getElementById('porcentajePension').value) || 0;
    const montoPrestamo = parseFloat(document.getElementById('montoPrestamo').value) || 0;
    const otrosDescuentos = parseFloat(document.getElementById('otrosDescuentos').value) || 0;
    
    const montoSalud = (sumaBruta * porcentajeSalud) / 100;
    const montoPension = (sumaBruta * porcentajePension) / 100;
    const pagoNeto = sumaBruta - montoSalud - montoPension - montoPrestamo - otrosDescuentos;
    
    document.getElementById('sumaBruta').textContent = formatearPesos(sumaBruta);
    document.getElementById('montoSalud').textContent = formatearPesos(montoSalud);
    document.getElementById('montoPension').textContent = formatearPesos(montoPension);
    document.getElementById('pagoNeto').textContent = formatearPesos(pagoNeto);
}

function generarVolante() {
    const sastre = document.getElementById('sastreSelectLiquidacion').value;
    
    if (!sastre) {
        alert('Selecciona un sastre');
        return;
    }
    
    const sumaBruta = document.getElementById('sumaBruta').textContent;
    const montoSalud = document.getElementById('montoSalud').textContent;
    const montoPension = document.getElementById('montoPension').textContent;
    const montoPrestamo = document.getElementById('montoPrestamo').value;
    const otrosDescuentos = document.getElementById('otrosDescuentos').value;
    const conceptoOtros = document.getElementById('conceptoOtros').value;
    const pagoNeto = document.getElementById('pagoNeto').textContent;
    
    const fecha = new Date().toLocaleDateString();
    
    const volante = `
========================================
    GONZÀLEZ BROTHER´S - SASTRERÍA
       VOLANTE DE PAGO
========================================

Sastre: ${sastre}
Fecha: ${fecha}
Periodo: ${new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}

----------------------------------------
PRODUCCIÓN
----------------------------------------
Suma Bruta:           $ ${sumaBruta} COP

----------------------------------------
DEDUCCIONES
----------------------------------------
Salud (4%):           $ ${montoSalud} COP
Pensión (4%):         $ ${montoPension} COP
Préstamos:            $ ${formatearPesos(montoPrestamo)} COP
Otros Descuentos:     $ ${formatearPesos(otrosDescuentos)} COP
${conceptoOtros ? `Concepto: ${conceptoOtros}` : ''}

----------------------------------------
PAGO NETO:            $ ${pagoNeto} COP
========================================

Firma Administrador: __________________

Firma Sastre: _________________________

    `;
    
    // Crear archivo de texto descargable
    const blob = new Blob([volante], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Volante_${sastre}_${new Date().toISOString().slice(0, 10)}.txt`;
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
                <h4>📅 ${fecha.toLocaleDateString('es', { month: 'long', year: 'numeric' })}</h4>
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
    container.innerHTML = '<p>Usa el botón "📊 Historial Mensual" en la parte inferior para ver el historial completo</p>';
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
    document.getElementById('configSalud').value = config.salud;
    document.getElementById('configPension').value = config.pension;
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
                <h4>👔 ${sastre}</h4>
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
    const adminPin = document.getElementById('configAdminPin').value;
    const ownerPin = document.getElementById('configOwnerPin').value;
    const salud = parseFloat(document.getElementById('configSalud').value);
    const pension = parseFloat(document.getElementById('configPension').value);
    
    const config = {
        adminPin,
        ownerPin,
        salud,
        pension
    };
    
    localStorage.setItem('config', JSON.stringify(config));
    alert('✅ Configuración guardada exitosamente');
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
