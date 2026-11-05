# Laboratorio CQC

App web (PWA) para registrar ensayos de laboratorio CQC desde el celular: correlativos automáticos (`ST.CA.RISTCH.RA.RMA.001`…), N° de capa, N° de ensayo por capa, procedencia, foto y la pestaña **Pendientes** con los ensayos que deja cada reemplazo de agua, cono de arena o muestra. Los datos van a una hoja de Google compartida por todo el equipo.

## Archivos

| Archivo | Va en | Para qué |
|---|---|---|
| `index.html` | GitHub | La app |
| `sw.js` | GitHub | Funciona sin señal y se actualiza sola |
| `manifest.webmanifest` | GitHub | Permite instalarla en Android como app |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | GitHub | Íconos de la app |
| `exceljs.min.js` | GitHub | Arma el reporte diario en Excel |
| `logo-izq.jpg`, `logo-der.png` | GitHub | Logos del reporte (cópialos del repositorio de Liberaciones; si faltan, el reporte sale sin logos) |
| `Code.gs` | Google Apps Script | El servidor (no se sube a GitHub) |

## 1. Servidor (Google)

1. Crea una hoja de cálculo nueva en Google Drive (por ejemplo «Laboratorio CQC»).
2. **Extensiones › Apps Script**, borra lo que haya y pega todo `Code.gs`.
3. Arriba, en «AJUSTA SOLO ESTA PARTE», cambia `CLAVE_EQUIPO` y los PIN de `EDITORES`.
4. Elige la función `instalar` y pulsa **Ejecutar** (acepta los permisos).
5. **Implementar › Nueva implementación › Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
6. Copia la URL que termina en `/exec`.

Cuando cambie `Code.gs`: pega el código nuevo y ve a **Implementar › Administrar implementaciones › ✏️ › Versión: Nueva versión › Implementar** (así la URL no cambia).

## 2. Página (GitHub Pages)

1. Crea un repositorio nuevo (por ejemplo `laboratorio-cqc`), aparte del de Liberaciones.
2. Sube todos los archivos de la tabla, menos `Code.gs`, en la raíz del repositorio.
3. **Settings › Pages › Branch: main / (root) › Save**.
4. Espera 1–2 minutos: la app queda en `https://TU-USUARIO.github.io/laboratorio-cqc/`.

Cada vez que subas cambios, aumenta el número de `CACHE` en `sw.js` (`laboratorio-v10` → `laboratorio-v11`) para que los celulares tomen la versión nueva.

## 3. Conectar la app

1. Abre la app, toca **⚙** y pega la URL `/exec` y la clave de equipo › **Conectar**.
2. Activa el modo editor con tu PIN y pulsa **Guardar para todos** (publica la configuración).
3. Toca **Copiar enlace para el equipo** y mándalo por WhatsApp: al abrirlo, cada celular queda conectado.

## 4. Instalar en Android

1. Abre el enlace del equipo en **Google Chrome**.
2. Toca el botón **📲 Instalar** de la cabecera (o **⚙ › Instalar app**). Si no aparece: menú **⋮ › Instalar aplicación** (o «Agregar a pantalla principal»).
3. Queda el ícono **Laboratorio** en el celular: abre a pantalla completa, funciona sin señal y guarda en cola lo que registres hasta que vuelva la señal.
4. Manteniendo presionado el ícono aparecen accesos directos: **Nuevo**, **Pendientes** y **Del día**.

En iPhone: abre el enlace en Safari › Compartir › **Agregar a inicio**.

> La instalación necesita HTTPS (GitHub Pages ya lo tiene). Abierto como archivo local no se puede instalar.

## Cómo se usa

- **Nuevo:** fecha y turno (el turno noche conserva su fecha después de medianoche) → frente → material → ensayo → correlativo (automático, editable con aviso) → N° de capa → N° de ensayo (solo CA y RA) → procedencia → subir.
- **Pendientes:** al subir un RA quedan G, CH y L (y PE si marcaste «Aplica Proctor»); el PE deja GE y la corrección de humedad; el CA deja CH; la «Muestra» (para materiales sin reemplazo, como el suelo de baja permeabilidad) deja G, CH y L. Toca el pendiente para registrarlo: capa y procedencia vienen del generador y no se modifican.
- **Del día:** lista compartida, buscador y reporte diario en Excel.
- **⚙ Ajustes:** formato del correlativo, abreviaturas, siguiente correlativo, qué deja pendiente cada ensayo, ensayos que no aplican por material, frentes, materiales y procedencias.
