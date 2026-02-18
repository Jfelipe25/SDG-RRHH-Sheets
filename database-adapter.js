// ========================================
// DATABASE ADAPTER - Google Sheets Version
// ========================================
// Este archivo reemplaza la funcionalidad de LocalStorage
// con Google Sheets API

class Database {
    constructor() {
        console.log('📊 Inicializando Database con Google Sheets backend');
        this.googleDB = googleDB; // Usa la instancia global
        this.ready = false;
        this.init();
    }

    async init() {
        try {
            // Test de conexión
            await this.googleDB.getTrabajadores();
            this.ready = true;
            console.log('✅ Conexión a Google Sheets establecida');
        } catch (error) {
            console.error('❌ Error conectando a Google Sheets:', error);
            this.ready = false;
        }
    }

    // ========================================
    // TRABAJADORES
    // ========================================
    async getTrabajadores() {
        return await this.googleDB.getTrabajadores();
    }

    async getTrabajadorById(id) {
        const trabajadores = await this.googleDB.getTrabajadores();
        return trabajadores.find(t => t.id === id);
    }

    async getTrabajadorByCedula(cedula) {
        const trabajadores = await this.googleDB.getTrabajadores();
        return trabajadores.find(t => t.cedula === cedula);
    }

    async addTrabajador(trabajador) {
        return await this.googleDB.addTrabajador(trabajador);
    }

    async updateTrabajador(id, updates) {
        return await this.googleDB.updateTrabajador(id, updates);
    }

    async deleteTrabajador(id) {
        return await this.googleDB.deleteTrabajador(id);
    }

    // ========================================
    // MÉTODOS ADICIONALES (para compatibilidad)
    // ========================================
    
    // LocalStorage methods (deprecated, aquí por compatibilidad)
    loadData() {
        console.warn('⚠️ loadData() deprecated - usando Google Sheets');
        return { trabajadores: [] };
    }

    saveData() {
        console.warn('⚠️ saveData() deprecated - Google Sheets auto-guarda');
    }

    generateUUID() {
        return this.googleDB.generateUUID();
    }

    exportAll() {
        console.log('📤 Export from Google Sheets');
        return {
            source: 'Google Sheets',
            spreadsheetId: GOOGLE_CONFIG.spreadsheetId,
            exportDate: new Date().toISOString()
        };
    }
}

// Instancia global compatible con el código original
const db = new Database();

console.log('✅ Database Adapter (Google Sheets) cargado');
