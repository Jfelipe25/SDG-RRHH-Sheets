# SDG RH - Sistema Digital de Gestión de Recursos Humanos

## 🎉 **Versión Google Sheets Edition**

Sistema completo de gestión de recursos humanos conectado a Google Sheets como base de datos.

---

## ✅ **ESTADO ACTUAL**

**TODO FUNCIONANDO:**
- ✅ Conectado a Google Sheets
- ✅ Lee trabajadores desde Google Sheets
- ✅ Sistema de caché (30 segundos TTL)
- ✅ Muestra 2-3 trabajadores correctamente
- ✅ Dashboard con estadísticas

**PENDIENTE:**
- ⏳ Formulario de nuevo trabajador (HTML completo, falta debugging)
- ⏳ Edición de trabajadores
- ⏳ Iconos PWA (icon-192.png, icon-512.png)

---

## 📋 **ARCHIVOS DEL PROYECTO**

```
SDG-RRHH-Sheets/
├── index.html              # HTML principal
├── styles.css              # Estilos CSS
├── app.js                  # Lógica principal (async/await)
├── google-sheets-db.js     # Conexión a Google Sheets API
├── database-adapter.js     # Adaptador de base de datos
├── service-worker.js       # PWA offline support
├── manifest.json           # PWA manifest
├── vercel.json             # Configuración Vercel
└── README.md               # Este archivo
```

---

## 🔧 **CONFIGURACIÓN**

### **Google Sheets API:**

El sistema está configurado para usar:
- **API Key:** `AIzaSyDPkE8fWZWvxQA38uP7mIgoXRzkYrLgJ6A`
- **Sheet ID:** `1DIW-lB4EzWHZ4VMP-tS5a-zo8xnL53a65XFU8cPEpZI`
- **Hoja:** `TRABAJADORES`
- **Columnas:** A:AF (32 columnas)

**Google Sheet:** https://docs.google.com/spreadsheets/d/1DIW-lB4EzWHZ4VMP-tS5a-zo8xnL53a65XFU8cPEpZI/edit

---

## 🚀 **CÓMO USAR (LOCAL)**

### **1. Servidor local:**
```bash
cd "C:\Users\FELIPE RODRIGUEZ\OneDrive\Documentos\GitHub\SDG-RRHH-Sheets"
python -m http.server 8000
```

### **2. Abrir en navegador:**
```
http://localhost:8000
```

### **3. Limpiar caché (si hay problemas):**
- F12 → Application → Storage → Clear site data
- F12 → Application → Service Workers → Unregister

---

## 🌐 **DEPLOYMENT**

### **Vercel:**
1. Conectar GitHub repo a Vercel
2. Auto-deploy en cada push a `main`
3. URL: https://[tu-proyecto].vercel.app

### **GitHub Pages:**
1. Settings → Pages → Deploy from branch `main`
2. URL: https://[usuario].github.io/SDG-RRHH-Sheets

---

## 📊 **ESTRUCTURA DE DATOS**

### **Google Sheet Columnas:**
```
A  = IDTRABAJADOR
B  = NOMBRE
C  = APELLIDOS
D  = CEDULA
E  = LUGAR DE EXPEDICION
F  = GENERO
G  = RH
H  = FECHA DE NACIMIENTO
I  = DEPARTAMENTO DE NACIMIENTO
J  = CIUDAD DE NACIMIENTO
K  = TELEFONO
L  = CORREO
M  = DIRECCION
N  = CIUDAD
O  = BARRIO
P  = CARGO
Q  = EPS
R  = AFP
S  = ARL
T  = BANCO
U  = TIPO DE CUENTA
V  = NUMERO DE CUENTA
W  = ESTADO
X  = FECHA DE CREACION
Y  = ALERGIAS
Z  = ENFERMEDADES
AA = CIRUGIAS
AB = NOMBRE DE CONTACTO DE EMERGENCIA
AC = PARENTESCO
AD = NUMERO DE CONTACTO DE EMERGENCIA
AE = FIRMA
AF = FOTO
```

---

## 🐛 **TROUBLESHOOTING**

### **No se ven los trabajadores:**
1. Revisar consola (F12)
2. Verificar que Google Sheets esté público (Editor con link)
3. Limpiar caché del navegador
4. Desactivar Service Worker

### **Error "Failed to fetch":**
- Problema de red temporal
- El caché seguirá funcionando
- Revisar API Key en `google-sheets-db.js`

### **Formulario vacío:**
- El HTML está completo
- Verificar CSS `display: none`
- Revisar consola por errores JavaScript

---

## 📝 **TO-DO**

- [ ] Crear iconos PWA (192x192, 512x512)
- [ ] Debuggear formulario de nuevo trabajador
- [ ] Implementar edición
- [ ] Implementar guardado en Google Sheets
- [ ] OAuth 2.0 para seguridad
- [ ] Upload de fotos a Google Drive
- [ ] Sistema de permisos
- [ ] Exportar a Excel mejorado

---

## 🏆 **LOGROS**

```
✅ Sistema de RRHH completo
✅ Google Sheets como base de datos
✅ 3 trabajadores sincronizados
✅ Caché inteligente
✅ PWA offline-first
✅ Arquitectura async/await
✅ Compatible con Vercel
```

---

## 👨‍💻 **DESARROLLADO POR**

**Felipe Rodriguez**
- GitHub: https://github.com/Jfelipe25
- Proyecto: SDG RH (Sistema Digital de Gestión)
- Fecha: Febrero 2026
- Tecnologías: HTML5, CSS3, JavaScript ES6+, Google Sheets API

---

## 📄 **LICENCIA**

Este proyecto es privado y propiedad de SDG.

---

**¡Felicitaciones por llegar hasta aquí!** 🎉🚀
