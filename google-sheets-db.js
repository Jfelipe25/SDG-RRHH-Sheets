// ========================================
// CONFIGURACIÓN GOOGLE SHEETS
// ========================================

const GOOGLE_CONFIG = {
    // API Key de Google Cloud
    apiKey: 'AIzaSyDPkE8fWZWvxQA38uP7mIgoXRzkYrLgJ6A',
    
    // ID de tu Google Sheet
    spreadsheetId: '1DIW-lB4EzWHZ4VMP-tS5a-zo8xnL53a65XFU8cPEpZI',
    
    // Nombre de la hoja/pestaña
    sheetName: 'TRABAJADORES',
    
    // Rango completo (A:AF = columnas A hasta AF, 32 columnas)
    range: 'TRABAJADORES!A:AF'
};

// ========================================
// MAPEO DE COLUMNAS
// ========================================
// Tu Sheet tiene 32 columnas en este orden:
// A=IDTRABAJADOR, B=NOMBRE, C=APELLIDOS, D=CEDULA, E=LUGAR DE EXPEDICION,
// F=GENERO, G=RH, H=FECHA DE NACIMIENTO, I=DEPARTAMENTO DE NACIMIENTO,
// J=CIUDAD DE NACIMIENTO, K=TELEFONO, L=CORREO, M=DIRECCION, N=CIUDAD,
// O=BARRIO, P=CARGO, Q=EPS, R=AFP, S=ARL, T=BANCO, U=TIPO DE CUENTA,
// V=NUMERO DE CUENTA, W=ESTADO, X=FECHA DE CREACION, Y=ALERGIAS,
// Z=ENFERMEDADES, AA=CIRUGIAS, AB=NOMBRE DE CONTACTO DE EMERGENCIA,
// AC=PARENTESCO, AD=NUMERO DE CONTACTO DE EMERGENCIA, AE=FIRMA, AF=FOTO

const COLUMN_MAPPING = {
    // Índices de columnas (0-based)
    IDTRABAJADOR: 0,
    NOMBRE: 1,
    APELLIDOS: 2,
    CEDULA: 3,
    LUGAR_EXPEDICION: 4,
    GENERO: 5,
    RH: 6,
    FECHA_NACIMIENTO: 7,
    DEPARTAMENTO_NACIMIENTO: 8,
    CIUDAD_NACIMIENTO: 9,
    TELEFONO: 10,
    CORREO: 11,
    DIRECCION: 12,
    CIUDAD: 13,
    BARRIO: 14,
    CARGO: 15,
    EPS: 16,
    AFP: 17,
    ARL: 18,
    BANCO: 19,
    TIPO_CUENTA: 20,
    NUMERO_CUENTA: 21,
    ESTADO: 22,
    FECHA_CREACION: 23,
    ALERGIAS: 24,
    ENFERMEDADES: 25,
    CIRUGIAS: 26,
    NOMBRE_CONTACTO_EMERGENCIA: 27,
    PARENTESCO: 28,
    NUMERO_CONTACTO_EMERGENCIA: 29,
    FIRMA: 30,
    FOTO: 31
};

// ========================================
// FUNCIONES DE GOOGLE SHEETS API
// ========================================

class GoogleSheetsDB {
    constructor() {
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.cache = {
            data: null,
            timestamp: null,
            ttl: 30000 // 30 segundos de cache
        };
    }

    // ========================================
    // LEER DATOS
    // ========================================
    async getTrabajadores() {
        try {
            console.log('📊 Leyendo datos de Google Sheets...');
            
            // Check cache
            if (this.cache.data && this.cache.timestamp && 
                (Date.now() - this.cache.timestamp < this.cache.ttl)) {
                console.log('✅ Usando datos del cache');
                return this.cache.data;
            }

            const url = `${this.baseUrl}/${GOOGLE_CONFIG.spreadsheetId}/values/${GOOGLE_CONFIG.range}?key=${GOOGLE_CONFIG.apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                console.log('⚠️ Sheet vacía');
                return [];
            }

            // La primera fila son los headers, ignorarla
            const rows = data.values.slice(1);
            
            // Convertir rows a objetos de trabajador
            const trabajadores = rows.map((row, index) => this.rowToTrabajador(row, index + 2)); // +2 porque empezamos en fila 2
            
            // Guardar en cache
            this.cache.data = trabajadores;
            this.cache.timestamp = Date.now();
            
            console.log(`✅ Leídos ${trabajadores.length} trabajadores`);
            return trabajadores;
            
        } catch (error) {
            console.error('❌ Error leyendo Google Sheets:', error);
            showToast('Error al cargar datos de Google Sheets: ' + error.message, 'error');
            return [];
        }
    }

    // Convertir fila de Sheet a objeto trabajador
    rowToTrabajador(row, rowNumber) {
        return {
            id: row[COLUMN_MAPPING.IDTRABAJADOR] || `row-${rowNumber}`,
            rowNumber: rowNumber, // Guardamos el número de fila para updates
            nombre: row[COLUMN_MAPPING.NOMBRE] || '',
            apellidos: row[COLUMN_MAPPING.APELLIDOS] || '',
            cedula: row[COLUMN_MAPPING.CEDULA] || '',
            lugarExpedicion: row[COLUMN_MAPPING.LUGAR_EXPEDICION] || '',
            genero: row[COLUMN_MAPPING.GENERO] || '',
            rh: row[COLUMN_MAPPING.RH] || '',
            fechaNacimiento: row[COLUMN_MAPPING.FECHA_NACIMIENTO] || '',
            departamentoNacimiento: row[COLUMN_MAPPING.DEPARTAMENTO_NACIMIENTO] || '',
            ciudadNacimiento: row[COLUMN_MAPPING.CIUDAD_NACIMIENTO] || '',
            telefono: row[COLUMN_MAPPING.TELEFONO] || '',
            correo: row[COLUMN_MAPPING.CORREO] || '',
            direccion: row[COLUMN_MAPPING.DIRECCION] || '',
            ciudad: row[COLUMN_MAPPING.CIUDAD] || '',
            barrio: row[COLUMN_MAPPING.BARRIO] || '',
            cargo: row[COLUMN_MAPPING.CARGO] || '',
            eps: row[COLUMN_MAPPING.EPS] || '',
            afp: row[COLUMN_MAPPING.AFP] || '',
            arl: row[COLUMN_MAPPING.ARL] || '',
            banco: row[COLUMN_MAPPING.BANCO] || '',
            tipoCuenta: row[COLUMN_MAPPING.TIPO_CUENTA] || '',
            numeroCuenta: row[COLUMN_MAPPING.NUMERO_CUENTA] || '',
            estado: row[COLUMN_MAPPING.ESTADO] || 'activo',
            fechaVinculacion: row[COLUMN_MAPPING.FECHA_CREACION] || '',
            alergias: row[COLUMN_MAPPING.ALERGIAS] || '',
            enfermedades: row[COLUMN_MAPPING.ENFERMEDADES] || '',
            cirugias: row[COLUMN_MAPPING.CIRUGIAS] || '',
            nombreContactoEmergencia: row[COLUMN_MAPPING.NOMBRE_CONTACTO_EMERGENCIA] || '',
            parentesco: row[COLUMN_MAPPING.PARENTESCO] || '',
            numeroContactoEmergencia: row[COLUMN_MAPPING.NUMERO_CONTACTO_EMERGENCIA] || '',
            firma: row[COLUMN_MAPPING.FIRMA] || '',
            foto: row[COLUMN_MAPPING.FOTO] || '',
            createdAt: row[COLUMN_MAPPING.FECHA_CREACION] || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Convertir objeto trabajador a fila de Sheet
    trabajadorToRow(trabajador) {
        const row = new Array(32).fill(''); // 32 columnas
        
        row[COLUMN_MAPPING.IDTRABAJADOR] = trabajador.id || this.generateUUID();
        row[COLUMN_MAPPING.NOMBRE] = trabajador.nombre || '';
        row[COLUMN_MAPPING.APELLIDOS] = trabajador.apellidos || '';
        row[COLUMN_MAPPING.CEDULA] = trabajador.cedula || '';
        row[COLUMN_MAPPING.LUGAR_EXPEDICION] = trabajador.lugarExpedicion || '';
        row[COLUMN_MAPPING.GENERO] = trabajador.genero || '';
        row[COLUMN_MAPPING.RH] = trabajador.rh || '';
        row[COLUMN_MAPPING.FECHA_NACIMIENTO] = trabajador.fechaNacimiento || '';
        row[COLUMN_MAPPING.DEPARTAMENTO_NACIMIENTO] = trabajador.departamentoNacimiento || '';
        row[COLUMN_MAPPING.CIUDAD_NACIMIENTO] = trabajador.ciudadNacimiento || '';
        row[COLUMN_MAPPING.TELEFONO] = trabajador.telefono || '';
        row[COLUMN_MAPPING.CORREO] = trabajador.correo || '';
        row[COLUMN_MAPPING.DIRECCION] = trabajador.direccion || '';
        row[COLUMN_MAPPING.CIUDAD] = trabajador.ciudad || '';
        row[COLUMN_MAPPING.BARRIO] = trabajador.barrio || '';
        row[COLUMN_MAPPING.CARGO] = trabajador.cargo || '';
        row[COLUMN_MAPPING.EPS] = trabajador.eps || '';
        row[COLUMN_MAPPING.AFP] = trabajador.afp || '';
        row[COLUMN_MAPPING.ARL] = trabajador.arl || '';
        row[COLUMN_MAPPING.BANCO] = trabajador.banco || '';
        row[COLUMN_MAPPING.TIPO_CUENTA] = trabajador.tipoCuenta || '';
        row[COLUMN_MAPPING.NUMERO_CUENTA] = trabajador.numeroCuenta || '';
        row[COLUMN_MAPPING.ESTADO] = trabajador.estado || 'activo';
        row[COLUMN_MAPPING.FECHA_CREACION] = trabajador.fechaVinculacion || trabajador.createdAt || new Date().toISOString().split('T')[0];
        row[COLUMN_MAPPING.ALERGIAS] = trabajador.alergias || '';
        row[COLUMN_MAPPING.ENFERMEDADES] = trabajador.enfermedades || '';
        row[COLUMN_MAPPING.CIRUGIAS] = trabajador.cirugias || '';
        row[COLUMN_MAPPING.NOMBRE_CONTACTO_EMERGENCIA] = trabajador.nombreContactoEmergencia || '';
        row[COLUMN_MAPPING.PARENTESCO] = trabajador.parentesco || '';
        row[COLUMN_MAPPING.NUMERO_CONTACTO_EMERGENCIA] = trabajador.numeroContactoEmergencia || '';
        row[COLUMN_MAPPING.FIRMA] = trabajador.firma || '';
        row[COLUMN_MAPPING.FOTO] = trabajador.foto || '';
        
        return row;
    }

    // ========================================
    // AGREGAR NUEVO TRABAJADOR
    // ========================================
    async addTrabajador(trabajador) {
        try {
            console.log('➕ Agregando trabajador a Google Sheets...');
            
            // Generar ID si no tiene
            if (!trabajador.id) {
                trabajador.id = this.generateUUID();
            }
            
            // Convertir a row
            const row = this.trabajadorToRow(trabajador);
            
            // Append a la Sheet
            const url = `${this.baseUrl}/${GOOGLE_CONFIG.spreadsheetId}/values/${GOOGLE_CONFIG.range}:append?valueInputOption=RAW&key=${GOOGLE_CONFIG.apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [row]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Trabajador agregado:', result);
            
            // Limpiar cache
            this.cache.data = null;
            
            showToast('Trabajador agregado correctamente', 'success');
            return trabajador;
            
        } catch (error) {
            console.error('❌ Error agregando trabajador:', error);
            showToast('Error al guardar en Google Sheets: ' + error.message, 'error');
            throw error;
        }
    }

    // ========================================
    // ACTUALIZAR TRABAJADOR
    // ========================================
    async updateTrabajador(id, updates) {
        try {
            console.log('✏️ Actualizando trabajador en Google Sheets...');
            
            // Primero obtener el trabajador actual para saber su fila
            const trabajadores = await this.getTrabajadores();
            const trabajador = trabajadores.find(t => t.id === id);
            
            if (!trabajador) {
                throw new Error('Trabajador no encontrado');
            }
            
            // Merge updates
            const updatedTrabajador = { ...trabajador, ...updates };
            
            // Convertir a row
            const row = this.trabajadorToRow(updatedTrabajador);
            
            // Update en la fila específica
            const range = `${GOOGLE_CONFIG.sheetName}!A${trabajador.rowNumber}:AF${trabajador.rowNumber}`;
            const url = `${this.baseUrl}/${GOOGLE_CONFIG.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${GOOGLE_CONFIG.apiKey}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [row]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            console.log('✅ Trabajador actualizado');
            
            // Limpiar cache
            this.cache.data = null;
            
            showToast('Trabajador actualizado correctamente', 'success');
            return updatedTrabajador;
            
        } catch (error) {
            console.error('❌ Error actualizando trabajador:', error);
            showToast('Error al actualizar en Google Sheets: ' + error.message, 'error');
            throw error;
        }
    }

    // ========================================
    // ELIMINAR TRABAJADOR
    // ========================================
    async deleteTrabajador(id) {
        console.log('⚠️ La eliminación en Google Sheets requiere APIs adicionales');
        console.log('Por ahora, marca el estado como "inactivo"');
        
        // En lugar de eliminar, marcar como inactivo
        return await this.updateTrabajador(id, { estado: 'inactivo' });
    }

    // ========================================
    // UTILIDADES
    // ========================================
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Limpiar cache manualmente
    clearCache() {
        this.cache.data = null;
        this.cache.timestamp = null;
    }
}

// ========================================
// INSTANCIA GLOBAL
// ========================================
const googleDB = new GoogleSheetsDB();

console.log('✅ Google Sheets DB inicializado');
console.log('📊 Sheet ID:', GOOGLE_CONFIG.spreadsheetId);
console.log('📋 Hoja:', GOOGLE_CONFIG.sheetName);
