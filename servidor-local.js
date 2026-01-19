const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Crear/conectar base de datos SQLite
const db = new sqlite3.Database('./sastreria.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite');
        inicializarDB();
    }
});

// Crear tablas si no existen
function inicializarDB() {
    db.run(`
        CREATE TABLE IF NOT EXISTS datos (
            clave TEXT PRIMARY KEY,
            valor TEXT NOT NULL,
            fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creando tabla:', err);
        } else {
            console.log('Base de datos inicializada');
        }
    });
}

// API REST

// Guardar datos
app.post('/api/guardar', (req, res) => {
    const { clave, datos } = req.body;
    
    if (!clave || !datos) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }
    
    const valor = JSON.stringify(datos);
    
    db.run(
        `INSERT OR REPLACE INTO datos (clave, valor, fecha_actualizacion) 
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [clave, valor],
        function(err) {
            if (err) {
                console.error('Error guardando datos:', err);
                return res.status(500).json({ error: 'Error al guardar' });
            }
            res.json({ 
                success: true, 
                clave,
                mensaje: 'Datos guardados correctamente'
            });
        }
    );
});

// Cargar datos
app.get('/api/cargar/:clave', (req, res) => {
    const { clave } = req.params;
    
    db.get(
        'SELECT valor FROM datos WHERE clave = ?',
        [clave],
        (err, row) => {
            if (err) {
                console.error('Error cargando datos:', err);
                return res.status(500).json({ error: 'Error al cargar' });
            }
            
            if (row) {
                res.json(JSON.parse(row.valor));
            } else {
                res.status(404).json({ error: 'Datos no encontrados' });
            }
        }
    );
});

// Obtener todas las claves disponibles
app.get('/api/claves', (req, res) => {
    db.all('SELECT clave, fecha_actualizacion FROM datos', [], (err, rows) => {
        if (err) {
            console.error('Error obteniendo claves:', err);
            return res.status(500).json({ error: 'Error al obtener claves' });
        }
        res.json(rows);
    });
});

// Sincronizar todo (obtener todos los datos)
app.get('/api/sincronizar', (req, res) => {
    db.all('SELECT clave, valor FROM datos', [], (err, rows) => {
        if (err) {
            console.error('Error sincronizando:', err);
            return res.status(500).json({ error: 'Error al sincronizar' });
        }
        
        const datos = {};
        rows.forEach(row => {
            datos[row.clave] = JSON.parse(row.valor);
        });
        
        res.json(datos);
    });
});

// Eliminar datos
app.delete('/api/eliminar/:clave', (req, res) => {
    const { clave } = req.params;
    
    db.run('DELETE FROM datos WHERE clave = ?', [clave], function(err) {
        if (err) {
            console.error('Error eliminando datos:', err);
            return res.status(500).json({ error: 'Error al eliminar' });
        }
        
        res.json({ 
            success: true, 
            mensaje: 'Datos eliminados',
            eliminados: this.changes
        });
    });
});

// Health check
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'OK', 
        servidor: 'González Brother\'s Sastrería',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   Servidor González Brother's Sastrería          ║
║   Puerto: ${PORT}                                    ║
║   Sincronización en red local activa              ║
╚═══════════════════════════════════════════════════╝

Accede desde otros dispositivos en:
http://[IP-DE-ESTA-PC]:${PORT}

Para detener el servidor: Ctrl + C
    `);
});

// Manejo de cierre
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error cerrando base de datos:', err);
        }
        console.log('\nServidor detenido');
        process.exit(0);
    });
});
