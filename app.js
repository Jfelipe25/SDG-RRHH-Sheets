// ========================================
// SDG RH - Sistema Digital de Gestión
// Recursos Humanos v1.0
// ========================================

// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================
const SDG_CONFIG = {
    appName: 'SDG RH',
    version: '1.0.0',
    storageKey: 'sdg_rh_data',
    autoSaveInterval: 30000, // 30 segundos
};

// ========================================
// BASE DE DATOS (LocalStorage)
// ========================================
class Database {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem(SDG_CONFIG.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            trabajadores: [],
            contratos: [],
            vacaciones: [],
            incapacidades: [],
            permisos: [],
            formacion: [],
            lastUpdate: new Date().toISOString()
        };
    }

    saveData() {
        this.data.lastUpdate = new Date().toISOString();
        localStorage.setItem(SDG_CONFIG.storageKey, JSON.stringify(this.data));
        console.log('✅ Datos guardados');
    }

    // TRABAJADORES
    getTrabajadores() {
        return this.data.trabajadores || [];
    }

    getTrabajadorById(id) {
        return this.data.trabajadores.find(t => t.id === id);
    }

    getTrabajadorByCedula(cedula) {
        return this.data.trabajadores.find(t => t.cedula === cedula);
    }

    addTrabajador(trabajador) {
        trabajador.id = this.generateUUID();
        trabajador.createdAt = new Date().toISOString();
        trabajador.updatedAt = new Date().toISOString();
        this.data.trabajadores.push(trabajador);
        this.saveData();
        return trabajador;
    }

    updateTrabajador(id, updates) {
        const index = this.data.trabajadores.findIndex(t => t.id === id);
        if (index !== -1) {
            this.data.trabajadores[index] = {
                ...this.data.trabajadores[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            return this.data.trabajadores[index];
        }
        return null;
    }

    deleteTrabajador(id) {
        this.data.trabajadores = this.data.trabajadores.filter(t => t.id !== id);
        // También eliminar datos relacionados
        this.data.contratos = this.data.contratos.filter(c => c.idTrabajador !== id);
        this.data.vacaciones = this.data.vacaciones.filter(v => v.idTrabajador !== id);
        this.data.incapacidades = this.data.incapacidades.filter(i => i.idTrabajador !== id);
        this.data.permisos = this.data.permisos.filter(p => p.idTrabajador !== id);
        this.data.formacion = this.data.formacion.filter(f => f.idTrabajador !== id);
        this.saveData();
    }

    // UTILIDADES
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // EXPORTAR TODO
    exportAll() {
        return {
            ...this.data,
            exportDate: new Date().toISOString(),
            version: SDG_CONFIG.version
        };
    }
}

// Instancia global de la base de datos
const db = new Database();

// ========================================
// GESTIÓN DE PANTALLAS
// ========================================
class ScreenManager {
    constructor() {
        this.screens = {
            dashboard: document.getElementById('dashboardScreen'),
            detail: document.getElementById('trabajadorDetailScreen'),
            form: document.getElementById('trabajadorFormScreen')
        };
        this.currentScreen = 'dashboard';
    }

    show(screenName) {
        Object.keys(this.screens).forEach(key => {
            this.screens[key].classList.remove('active');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    showDashboard() {
        this.show('dashboard');
        renderTrabajadores();
        updateStats();
    }

    showDetail(trabajadorId) {
        this.show('detail');
        renderTrabajadorDetail(trabajadorId);
    }

    showForm(trabajadorId = null) {
        this.show('form');
        if (trabajadorId) {
            loadTrabajadorToForm(trabajadorId);
            document.getElementById('formTitle').textContent = 'Editar Trabajador';
        } else {
            resetForm();
            document.getElementById('formTitle').textContent = 'Nuevo Trabajador';
        }
    }
}

const screenManager = new ScreenManager();

// ========================================
// RENDERIZADO DE TRABAJADORES
// ========================================
function renderTrabajadores(filter = '') {
    const container = document.getElementById('trabajadoresList');
    const emptyState = document.getElementById('emptyState');
    let trabajadores = db.getTrabajadores();

    // Aplicar filtro de búsqueda
    if (filter) {
        const filterLower = filter.toLowerCase();
        trabajadores = trabajadores.filter(t => {
            return (
                t.nombre?.toLowerCase().includes(filterLower) ||
                t.apellidos?.toLowerCase().includes(filterLower) ||
                t.cedula?.includes(filterLower) ||
                t.cargo?.toLowerCase().includes(filterLower) ||
                t.correo?.toLowerCase().includes(filterLower) ||
                t.telefono?.includes(filterLower)
            );
        });
    }

    // Aplicar filtro de estado
    const estadoFilter = document.getElementById('filterEstado').value;
    if (estadoFilter !== 'all') {
        trabajadores = trabajadores.filter(t => t.estado === estadoFilter);
    }

    // Actualizar contador
    document.getElementById('trabajadoresCount').textContent = trabajadores.length;

    // Mostrar empty state o lista
    if (trabajadores.length === 0 && !filter) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    } else {
        container.style.display = 'grid';
        emptyState.style.display = 'none';
    }

    // Renderizar cards
    container.innerHTML = trabajadores.map(t => createTrabajadorCard(t)).join('');
}

function createTrabajadorCard(trabajador) {
    const estadoEmoji = {
        'activo': '🟢',
        'vacaciones': '🟡',
        'incapacidad': '🔵',
        'permiso': '⚪',
        'inactivo': '🔴'
    };

    const estadoClass = `estado-${trabajador.estado || 'activo'}`;
    const fotoUrl = trabajador.foto || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="40"%3E👤%3C/text%3E%3C/svg%3E';

    // Contar registros relacionados
    const contratosCount = db.data.contratos.filter(c => c.idTrabajador === trabajador.id).length;
    const vacacionesCount = db.data.vacaciones.filter(v => v.idTrabajador === trabajador.id).length;

    return `
        <div class="trabajador-card ${estadoClass}" onclick="screenManager.showDetail('${trabajador.id}')">
            <div class="card-photo">
                <img src="${fotoUrl}" alt="${trabajador.nombre}">
                <div class="qr-indicator" title="Ver QR">
                    <span>📱</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-name">${trabajador.nombre} ${trabajador.apellidos}</h3>
                <div class="card-info">
                    <span class="card-cargo">💼 ${trabajador.cargo || 'Sin cargo'}</span>
                    <span class="card-estado">${estadoEmoji[trabajador.estado || 'activo']} ${capitalizeFirst(trabajador.estado || 'activo')}</span>
                </div>
                <div class="card-contact">
                    <span>📱 ${trabajador.telefono || 'N/A'}</span>
                    <span>📧 ${trabajador.correo || 'N/A'}</span>
                </div>
                <div class="card-stats">
                    <span>📄 ${contratosCount} Contrato${contratosCount !== 1 ? 's' : ''}</span>
                    <span>🏖️ ${vacacionesCount} Vacacion${vacacionesCount !== 1 ? 'es' : ''}</span>
                </div>
                <div class="card-cedula">
                    CC: ${trabajador.cedula}
                </div>
            </div>
        </div>
    `;
}

// ========================================
// DETALLE DE TRABAJADOR
// ========================================
function renderTrabajadorDetail(trabajadorId) {
    const trabajador = db.getTrabajadorById(trabajadorId);
    if (!trabajador) {
        showToast('Trabajador no encontrado', 'error');
        screenManager.showDashboard();
        return;
    }

    const container = document.getElementById('trabajadorDetailContent');
    const fotoUrl = trabajador.foto || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="80"%3E👤%3C/text%3E%3C/svg%3E';
    
    const estadoEmoji = {
        'activo': '🟢',
        'vacaciones': '🟡',
        'incapacidad': '🔵',
        'permiso': '⚪',
        'inactivo': '🔴'
    };

    // Calcular edad si tiene fecha de nacimiento
    let edad = '';
    if (trabajador.fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(trabajador.fechaNacimiento);
        let edadNum = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edadNum--;
        }
        edad = `${edadNum} años`;
    }

    container.innerHTML = `
        <div class="detail-container">
            <div class="detail-profile">
                <div class="profile-photo-large">
                    <img src="${fotoUrl}" alt="${trabajador.nombre}">
                </div>
                <h1 class="profile-name">${trabajador.nombre} ${trabajador.apellidos}</h1>
                <div class="profile-status">
                    <span class="status-badge status-${trabajador.estado || 'activo'}">
                        ${estadoEmoji[trabajador.estado || 'activo']} ${capitalizeFirst(trabajador.estado || 'activo')}
                    </span>
                </div>
                <div class="profile-qr" id="qrCodeContainer"></div>
            </div>

            <div class="detail-sections">
                <!-- Información Personal -->
                <div class="info-section">
                    <h3 class="info-section-title">👤 Información Personal</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Cédula</span>
                            <span class="info-value">${trabajador.cedula}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Lugar Expedición</span>
                            <span class="info-value">${trabajador.lugarExpedicion || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Género</span>
                            <span class="info-value">${capitalizeFirst(trabajador.genero || 'N/A')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">RH</span>
                            <span class="info-value">${trabajador.rh || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha Nacimiento</span>
                            <span class="info-value">${formatDate(trabajador.fechaNacimiento) || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Edad</span>
                            <span class="info-value">${edad || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Lugar Nacimiento</span>
                            <span class="info-value">${trabajador.ciudadNacimiento || 'N/A'}, ${trabajador.departamentoNacimiento || ''}</span>
                        </div>
                    </div>
                </div>

                <!-- Información de Contacto -->
                <div class="info-section">
                    <h3 class="info-section-title">📞 Información de Contacto</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Teléfono</span>
                            <span class="info-value">
                                <a href="tel:${trabajador.telefono}" class="contact-link">
                                    📱 ${trabajador.telefono}
                                </a>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Correo</span>
                            <span class="info-value">
                                <a href="mailto:${trabajador.correo}" class="contact-link">
                                    📧 ${trabajador.correo}
                                </a>
                            </span>
                        </div>
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <span class="info-label">Dirección</span>
                            <span class="info-value">${trabajador.direccion || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Ciudad</span>
                            <span class="info-value">${trabajador.ciudad || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Barrio</span>
                            <span class="info-value">${trabajador.barrio || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Información Laboral -->
                <div class="info-section">
                    <h3 class="info-section-title">💼 Información Laboral</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Cargo</span>
                            <span class="info-value">${trabajador.cargo || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha Vinculación</span>
                            <span class="info-value">${formatDate(trabajador.fechaVinculacion) || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">EPS</span>
                            <span class="info-value">${trabajador.eps || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">AFP</span>
                            <span class="info-value">${trabajador.afp || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">ARL</span>
                            <span class="info-value">${trabajador.arl || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Información Bancaria -->
                <div class="info-section">
                    <h3 class="info-section-title">🏦 Información Bancaria</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Tipo de Cuenta</span>
                            <span class="info-value">${capitalizeFirst(trabajador.tipoCuenta || 'N/A')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Número de Cuenta</span>
                            <span class="info-value">${trabajador.numeroCuenta || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Información Médica -->
                <div class="info-section">
                    <h3 class="info-section-title">🏥 Información Médica</h3>
                    <div class="info-grid">
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <span class="info-label">Alergias</span>
                            <span class="info-value">${trabajador.alergias || 'Ninguna registrada'}</span>
                        </div>
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <span class="info-label">Enfermedades</span>
                            <span class="info-value">${trabajador.enfermedades || 'Ninguna registrada'}</span>
                        </div>
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <span class="info-label">Cirugías</span>
                            <span class="info-value">${trabajador.cirugias || 'Ninguna registrada'}</span>
                        </div>
                    </div>
                </div>

                <!-- Contacto de Emergencia -->
                <div class="info-section">
                    <h3 class="info-section-title">🚨 Contacto de Emergencia</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nombre</span>
                            <span class="info-value">${trabajador.nombreContactoEmergencia || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Parentesco</span>
                            <span class="info-value">${trabajador.parentesco || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Teléfono</span>
                            <span class="info-value">
                                ${trabajador.numeroContactoEmergencia ? `<a href="tel:${trabajador.numeroContactoEmergencia}" class="contact-link">📱 ${trabajador.numeroContactoEmergencia}</a>` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                ${trabajador.firma ? `
                <div class="info-section">
                    <h3 class="info-section-title">✍️ Firma</h3>
                    <div class="signature-display">
                        <img src="${trabajador.firma}" alt="Firma">
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    // Generar QR Code
    setTimeout(() => {
        generateQRCode(trabajadorId);
    }, 100);

    // Event listeners para botones
    document.getElementById('editTrabajadorBtn').onclick = () => {
        screenManager.showForm(trabajadorId);
    };

    document.getElementById('deleteTrabajadorBtn').onclick = () => {
        if (confirm(`¿Está seguro de eliminar a ${trabajador.nombre} ${trabajador.apellidos}?\n\nEsta acción no se puede deshacer.`)) {
            db.deleteTrabajador(trabajadorId);
            showToast('Trabajador eliminado correctamente', 'success');
            screenManager.showDashboard();
        }
    };

    document.getElementById('generatePDFBtn').onclick = () => {
        generateTrabajadorPDF(trabajador);
    };
}

// ========================================
// FORMULARIO DE TRABAJADOR
// ========================================
function resetForm() {
    document.getElementById('trabajadorForm').reset();
    document.getElementById('photoPreview').innerHTML = `
        <span class="placeholder-icon">📷</span>
        <span class="placeholder-text">Click para capturar</span>
    `;
    
    const canvas = document.getElementById('firmaCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    currentEditingId = null;
    updateFormProgress();
}

let currentEditingId = null;

function loadTrabajadorToForm(trabajadorId) {
    const trabajador = db.getTrabajadorById(trabajadorId);
    if (!trabajador) return;

    currentEditingId = trabajadorId;

    // Cargar todos los campos
    const fields = [
        'nombre', 'apellidos', 'cedula', 'lugarExpedicion', 'genero', 'rh',
        'fechaNacimiento', 'departamentoNacimiento', 'ciudadNacimiento',
        'telefono', 'correo', 'direccion', 'ciudad', 'barrio',
        'cargo', 'estado', 'fechaVinculacion', 'eps', 'afp', 'arl',
        'tipoCuenta', 'numeroCuenta',
        'alergias', 'enfermedades', 'cirugias',
        'nombreContactoEmergencia', 'parentesco', 'numeroContactoEmergencia'
    ];

    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && trabajador[field]) {
            element.value = trabajador[field];
        }
    });

    // Calcular edad
    if (trabajador.fechaNacimiento) {
        calcularEdad();
    }

    // Cargar foto
    if (trabajador.foto) {
        document.getElementById('photoPreview').innerHTML = `
            <img src="${trabajador.foto}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover;">
        `;
    }

    // Cargar firma
    if (trabajador.firma) {
        const canvas = document.getElementById('firmaCanvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = trabajador.firma;
    }

    updateFormProgress();
}

// ========================================
// MANEJO DE FOTO
// ========================================
document.getElementById('fotoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Comprimir imagen
                const canvas = document.createElement('canvas');
                const maxSize = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('photoPreview').innerHTML = `
                    <img src="${compressed}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover;">
                `;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// ========================================
// MANEJO DE FIRMA
// ========================================
const firmaCanvas = document.getElementById('firmaCanvas');
const firmaCtx = firmaCanvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

firmaCanvas.addEventListener('mousedown', startDrawing);
firmaCanvas.addEventListener('mousemove', draw);
firmaCanvas.addEventListener('mouseup', stopDrawing);
firmaCanvas.addEventListener('mouseout', stopDrawing);

// Touch events
firmaCanvas.addEventListener('touchstart', handleTouchStart);
firmaCanvas.addEventListener('touchmove', handleTouchMove);
firmaCanvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;
    
    firmaCtx.strokeStyle = '#000';
    firmaCtx.lineWidth = 2;
    firmaCtx.lineCap = 'round';
    
    firmaCtx.beginPath();
    firmaCtx.moveTo(lastX, lastY);
    firmaCtx.lineTo(e.offsetX, e.offsetY);
    firmaCtx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = firmaCanvas.getBoundingClientRect();
    isDrawing = true;
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
}

function handleTouchMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = firmaCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    firmaCtx.strokeStyle = '#000';
    firmaCtx.lineWidth = 2;
    firmaCtx.lineCap = 'round';
    
    firmaCtx.beginPath();
    firmaCtx.moveTo(lastX, lastY);
    firmaCtx.lineTo(x, y);
    firmaCtx.stroke();
    
    lastX = x;
    lastY = y;
}

document.getElementById('clearFirmaBtn').addEventListener('click', function() {
    firmaCtx.clearRect(0, 0, firmaCanvas.width, firmaCanvas.height);
});

// ========================================
// CALCULAR EDAD AUTOMÁTICA
// ========================================
document.getElementById('fechaNacimiento').addEventListener('change', calcularEdad);

function calcularEdad() {
    const fechaNac = document.getElementById('fechaNacimiento').value;
    if (fechaNac) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNac);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        document.getElementById('edad').value = edad + ' años';
    }
}

// ========================================
// PROGRESO DEL FORMULARIO
// ========================================
function updateFormProgress() {
    const form = document.getElementById('trabajadorForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let filled = 0;
    
    inputs.forEach(input => {
        if (input.value.trim() !== '') filled++;
    });
    
    const percentage = Math.round((filled / inputs.length) * 100);
    document.getElementById('formProgress').textContent = percentage + '%';
}

// Actualizar progreso en tiempo real
document.getElementById('trabajadorForm').addEventListener('input', updateFormProgress);

// ========================================
// GUARDAR TRABAJADOR
// ========================================
document.getElementById('trabajadorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        apellidos: document.getElementById('apellidos').value.trim(),
        cedula: document.getElementById('cedula').value.trim(),
        lugarExpedicion: document.getElementById('lugarExpedicion').value.trim(),
        genero: document.getElementById('genero').value,
        rh: document.getElementById('rh').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        departamentoNacimiento: document.getElementById('departamentoNacimiento').value.trim(),
        ciudadNacimiento: document.getElementById('ciudadNacimiento').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        ciudad: document.getElementById('ciudad').value.trim(),
        barrio: document.getElementById('barrio').value.trim(),
        cargo: document.getElementById('cargo').value.trim(),
        estado: document.getElementById('estado').value,
        fechaVinculacion: document.getElementById('fechaVinculacion').value,
        eps: document.getElementById('eps').value.trim(),
        afp: document.getElementById('afp').value.trim(),
        arl: document.getElementById('arl').value.trim(),
        tipoCuenta: document.getElementById('tipoCuenta').value,
        numeroCuenta: document.getElementById('numeroCuenta').value.trim(),
        alergias: document.getElementById('alergias').value.trim(),
        enfermedades: document.getElementById('enfermedades').value.trim(),
        cirugias: document.getElementById('cirugias').value.trim(),
        nombreContactoEmergencia: document.getElementById('nombreContactoEmergencia').value.trim(),
        parentesco: document.getElementById('parentesco').value.trim(),
        numeroContactoEmergencia: document.getElementById('numeroContactoEmergencia').value.trim()
    };

    // Obtener foto
    const photoPreview = document.getElementById('photoPreview').querySelector('img');
    if (photoPreview) {
        formData.foto = photoPreview.src;
    }

    // Obtener firma
    const firmaCanvas = document.getElementById('firmaCanvas');
    const firmaData = firmaCanvas.toDataURL('image/png');
    if (firmaData && firmaData !== 'data:,') {
        formData.firma = firmaData;
    }

    // Validar cédula única
    if (currentEditingId) {
        // Editando: verificar que la cédula no esté en uso por otro trabajador
        const existing = db.getTrabajadorByCedula(formData.cedula);
        if (existing && existing.id !== currentEditingId) {
            showToast('Ya existe un trabajador con esa cédula', 'error');
            return;
        }
        
        // Actualizar
        db.updateTrabajador(currentEditingId, formData);
        showToast('Trabajador actualizado correctamente', 'success');
    } else {
        // Nuevo: verificar que la cédula no exista
        if (db.getTrabajadorByCedula(formData.cedula)) {
            showToast('Ya existe un trabajador con esa cédula', 'error');
            return;
        }
        
        // Crear nuevo
        db.addTrabajador(formData);
        showToast('Trabajador agregado correctamente', 'success');
    }

    screenManager.showDashboard();
});

// ========================================
// BÚSQUEDA Y FILTROS
// ========================================
document.getElementById('searchInput').addEventListener('input', function(e) {
    renderTrabajadores(e.target.value);
});

document.getElementById('filterEstado').addEventListener('change', function() {
    const searchValue = document.getElementById('searchInput').value;
    renderTrabajadores(searchValue);
});

// ========================================
// ESTADÍSTICAS
// ========================================
function updateStats() {
    const trabajadores = db.getTrabajadores();
    
    document.getElementById('totalTrabajadores').textContent = trabajadores.length;
    document.getElementById('trabajadoresActivos').textContent = 
        trabajadores.filter(t => t.estado === 'activo').length;
    
    // TODO: Alertas de contratos próximos a vencer
    document.getElementById('alertasVencimiento').textContent = 0;
    
    // TODO: Permisos pendientes de aprobación
    document.getElementById('permisosPendientes').textContent = 0;
}

// ========================================
// EXPORTAR A EXCEL
// ========================================
document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);

function exportToExcel() {
    const trabajadores = db.getTrabajadores();
    
    if (trabajadores.length === 0) {
        showToast('No hay trabajadores para exportar', 'warning');
        return;
    }

    // Preparar datos
    const data = trabajadores.map(t => ({
        'ID': t.id,
        'Nombre': t.nombre,
        'Apellidos': t.apellidos,
        'Cédula': t.cedula,
        'Teléfono': t.telefono,
        'Correo': t.correo,
        'Cargo': t.cargo,
        'Estado': t.estado,
        'Fecha Vinculación': t.fechaVinculacion,
        'Ciudad': t.ciudad,
        'EPS': t.eps,
        'AFP': t.afp,
        'ARL': t.arl
    }));

    // Crear libro Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Trabajadores');

    // Descargar
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `SDG_RH_Trabajadores_${fecha}.xlsx`);
    
    showToast('Excel exportado correctamente', 'success');
}

// ========================================
// GENERAR PDF DEL PERFIL
// ========================================
function generateTrabajadorPDF(trabajador) {
    showToast('Generando PDF...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // Azul SDG
    doc.text('SDG RH - Perfil del Trabajador', 20, y);
    
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Nombre
    doc.setFont(undefined, 'bold');
    doc.text(`${trabajador.nombre} ${trabajador.apellidos}`, 20, y);
    y += 8;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Cédula: ${trabajador.cedula}`, 20, y);
    y += 6;
    doc.text(`Cargo: ${trabajador.cargo || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Estado: ${capitalizeFirst(trabajador.estado || 'activo')}`, 20, y);
    
    y += 10;
    
    // Información de contacto
    doc.setFont(undefined, 'bold');
    doc.text('Información de Contacto', 20, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.text(`Teléfono: ${trabajador.telefono || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Correo: ${trabajador.correo || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Dirección: ${trabajador.direccion || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Ciudad: ${trabajador.ciudad || 'N/A'}`, 20, y);
    
    y += 10;
    
    // Información laboral
    doc.setFont(undefined, 'bold');
    doc.text('Información Laboral', 20, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha de Vinculación: ${formatDate(trabajador.fechaVinculacion) || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`EPS: ${trabajador.eps || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`AFP: ${trabajador.afp || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`ARL: ${trabajador.arl || 'N/A'}`, 20, y);
    
    y += 10;
    
    // Contacto de emergencia
    if (trabajador.nombreContactoEmergencia) {
        doc.setFont(undefined, 'bold');
        doc.text('Contacto de Emergencia', 20, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${trabajador.nombreContactoEmergencia}`, 20, y);
        y += 6;
        doc.text(`Parentesco: ${trabajador.parentesco || 'N/A'}`, 20, y);
        y += 6;
        doc.text(`Teléfono: ${trabajador.numeroContactoEmergencia || 'N/A'}`, 20, y);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generado el ${new Date().toLocaleString('es-CO')} por SDG RH v${SDG_CONFIG.version}`, 20, 280);
    
    // Descargar
    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`Perfil_${trabajador.nombre}_${trabajador.apellidos}_${fecha}.pdf`);
    
    showToast('PDF generado correctamente', 'success');
}

// ========================================
// GENERAR QR CODE
// ========================================
function generateQRCode(trabajadorId) {
    const container = document.getElementById('qrCodeContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const qrData = {
        id: trabajadorId,
        app: 'SDG RH',
        url: window.location.origin + '?trabajador=' + trabajadorId
    };
    
    new QRCode(container, {
        text: JSON.stringify(qrData),
        width: 150,
        height: 150,
        colorDark: '#1e40af',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Agregar texto debajo del QR
    const qrLabel = document.createElement('p');
    qrLabel.className = 'qr-label';
    qrLabel.textContent = 'Escanea para ver perfil';
    container.appendChild(qrLabel);
}

// ========================================
// SISTEMA DE TOASTS
// ========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// EVENT LISTENERS GLOBALES
// ========================================
document.getElementById('nuevoTrabajadorBtn').addEventListener('click', () => {
    screenManager.showForm();
});

document.getElementById('backToListBtn').addEventListener('click', () => {
    screenManager.showDashboard();
});

document.getElementById('cancelFormBtn').addEventListener('click', () => {
    if (confirm('¿Desea cancelar? Los cambios no guardados se perderán.')) {
        screenManager.showDashboard();
    }
});

document.getElementById('cancelFormBtn2').addEventListener('click', () => {
    if (confirm('¿Desea cancelar? Los cambios no guardados se perderán.')) {
        screenManager.showDashboard();
    }
});

// ========================================
// UTILIDADES
// ========================================
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
}

// ========================================
// INICIALIZACIÓN
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 SDG RH Iniciado');
    
    // Cargar trabajadores
    renderTrabajadores();
    updateStats();
    
    // Verificar si hay parámetro de trabajador en URL
    const urlParams = new URLSearchParams(window.location.search);
    const trabajadorId = urlParams.get('trabajador');
    if (trabajadorId) {
        screenManager.showDetail(trabajadorId);
    }
    
    showToast('¡Bienvenido a SDG RH!', 'success');
});

// ========================================
// AUTO-GUARDADO
// ========================================
setInterval(() => {
    console.log('💾 Auto-guardado ejecutado');
}, SDG_CONFIG.autoSaveInterval);

console.log('✅ SDG RH - App.js cargado correctamente');
