# Laboratorio CQC

App web (PWA) para registrar ensayos de laboratorio CQC desde el celular: correlativos automáticos (`ST.CA.RISTCH.RA.RMA.001`: prefijo, frente, ensayo, material y número), N° de capa, N° de ensayo por capa, procedencia, foto y la pestaña **Pendientes** con los ensayos que deja cada reemplazo de agua, cono de arena o muestra. Los datos van a una hoja de Google compartida por todo el equipo.

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
3. Arriba, en «AJUSTA SOLO ESTA PARTE», escribe en `USUARIOS` la contraseña y el nombre de cada persona (`true` = puede cambiar los Ajustes).
4. Elige la función `instalar` y pulsa **Ejecutar** (acepta los permisos).
5. **Implementar › Nueva implementación › Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
6. Copia la URL que termina en `/exec`.

Para agregar o quitar personas, o cuando cambie `Code.gs`: pega el código nuevo y ve a **Implementar › Administrar implementaciones › ✏️ › Versión: Nueva versión › Implementar** (así la URL no cambia).

## 2. Página (GitHub Pages)

1. Abre `index.html` y pega la URL `/exec` en la línea `var SERVIDOR = "…";` (casi al inicio del código). Solo tú cambias esta línea.
2. Crea un repositorio nuevo (por ejemplo `laboratorio-cqc`), aparte del de Liberaciones.
3. Sube todos los archivos de la tabla, menos `Code.gs`, en la raíz del repositorio.
4. **Settings › Pages › Branch: main / (root) › Save**.
5. Espera 1–2 minutos: la app queda en `https://TU-USUARIO.github.io/laboratorio-cqc/`.

Cada vez que subas cambios, aumenta el número de `CACHE` en `sw.js` (`laboratorio-v10` → `laboratorio-v11`) para que los celulares tomen la versión nueva.

## 3. Ingresar

Cada persona abre el enlace de la app, escribe **solo su contraseña** y toca **Ingresar**. Arriba aparece su nombre (y si es Editor o Registrador). La primera vez necesita internet; después la sesión queda guardada en el celular. Cada ensayo subido guarda en la hoja quién lo registró (columna REGISTRÓ).

La primera vez, entra con tu contraseña de editor, ve a **⚙** y pulsa **Guardar para todos** para publicar la configuración del equipo.

## 4. Instalar en Android

1. Abre el enlace de la app en **Google Chrome**.
2. Toca el botón **📲 Instalar** de la cabecera (o **⚙ › Instalar app**). Si no aparece: menú **⋮ › Instalar aplicación** (o «Agregar a pantalla principal»).
3. Queda el ícono **Laboratorio** en el celular: abre a pantalla completa, funciona sin señal y guarda en cola lo que registres hasta que vuelva la señal.
4. Manteniendo presionado el ícono aparecen accesos directos: **Nuevo**, **Pendientes** y **Del día**.

En iPhone: abre el enlace en Safari › Compartir › **Agregar a inicio**.

> La instalación necesita HTTPS (GitHub Pages ya lo tiene). Abierto como archivo local no se puede instalar.

## Cómo se usa

- **Nuevo:** fecha y turno (el turno noche conserva su fecha después de medianoche) → frente → material → ensayo → correlativo (automático, editable con aviso) → N° de capa → N° de ensayo (solo CA y RA) → procedencia → subir.
- **Pendientes:** al subir un RA quedan G, CH y L (y PE + GE si marcaste «Aplica Proctor»); el PE no deja pendientes; el CA deja CH; la «Muestra» (para materiales sin reemplazo, como el suelo de baja permeabilidad) deja G, CH y L. Toca el pendiente para registrarlo: capa y procedencia vienen del generador y no se modifican.
- **Del día:** lista compartida, buscador, botones «Copiar para el RD» por frente y el botón «RD y panel fotográfico (.xlsx)», que descarga una hoja «RD. <código>» por frente (columnas A–L como el RD del laboratorio) y la hoja «R.Fotogr. Laboratorio» con las fotos de todos los frentes, separadas por turno, 3 por fila, con título y descripción.
- **⚙ Ajustes (solo editores guardan):**
  - **Correlativo:** prefijo (ST.CA) y dígitos. Se arma `PREFIJO.FRENTE.ENSAYO.MATERIAL.NÚMERO`, por ejemplo `ST.CA.RISTCH.RA.RMA.001`, y cada combinación lleva su propio contador.
  - **Frentes:** botón Editar (nombre, nombre corto, código para correlativo y sus materiales) y Duplicar (pide nombre y código nuevos; su numeración empieza en 001).
  - **Dentro de cada material del frente:** Editar → código del material, ensayos que aplican (con su “siguiente” número) y procedencias que aplican.
  - **Materiales, Ensayos y Procedencias:** listas generales. En Ensayos puedes crear uno nuevo y definir su código, qué pendientes deja, si muestra “Aplica Proctor”, si pide N° de ensayo por capa o si no lleva correlativo propio.
- **Copiar para el RD:** en «Del día», un botón por frente copia las filas del día en el orden de las columnas A–L del RD de Excel (fecha, turno, estructura, tipo de ensayo, —, —, capa, material, cantera, correlativo, observaciones, —). En Excel, clic en la columna A de la primera fila libre de la hoja del frente y pegar.
- **Sin actividades:** en «Nuevo», tras elegir el frente, el botón «Sin actividades en este turno» deja la fila correspondiente en el RD.
- **Estructuras y formato por frente:** en ⚙, cada frente puede tener estructuras (con código opcional) y su propio formato de correlativo usando {PRE} {FRENTE} {EST} {ENSAYO} {MAT} {N}.
- **Evaluación de material:** es un ensayo más (botón EM). Su correlativo es PREFIJO.FRENTE.EM.N° (sin código de material) y deja pendientes G, CH y L, que también usan EM (ej. ST.CA.RISTCH.G.EM.013).
- **Detalle:** al registrar, el interruptor “Agregar detalle” abre un campo libre que sale como línea DETALLE.
- **🧮 Calcular › Reemplazo de agua:** frente y material (vienen elegidos si entras desde «Calcular este ensayo») → 1. calibración (lectura final − inicial del caudalímetro) → 2. pesos del material extraído (4 dígitos por casilla: 2340 = 23.40 kg; la grilla se pliega y muestra el total) → 3. lecturas inicial y final al llenar hoyo + anillo (volumen del hoyo = (final − inicial) − calibración) → DH → 4. test fill (DMS y COPH) → densidad seca y % de compactación. Con «Usar la DH en el registro» la DH pasa al ensayo que estabas registrando.
- **Test fill:** se cargan en ⚙ › Frentes › Editar › material › Editar › Test fill (nombre, DMS, COPH). Pulsa «Guardar para todos» para que el equipo los vea.
- **Datos compartidos:** la hoja de Google manda. Cada celular guarda una copia de sus propios registros para trabajar sin señal; al sincronizar, los que ya no están en la hoja (porque se eliminaron desde otro celular) se descartan, salvo los que todavía esperan señal en la cola.
- **🧮 Calcular › Granulometría:** igual que el formato ST.CA.IN.005.F003 (tamizado compuesto con separación en N°4): retenidos de la fracción gruesa (6" a N°4), masa húmeda que pasa N°4, humedad del fino (la misma muestra se lava y se tamiza) y retenidos del fino (N°10 a N°200 y fondo). Da bolones, gravas, arenas y finos, SUCS (con LL e IP) y la curva dentro del huso.
- **Huso granulométrico:** en ⚙ › Frentes › Editar › material › Editar › Huso granulométrico (tamiz, mm, mínimo y máximo). Ya viene cargado «BACKFILL ETAPA 1B» en Tajo Chalarina › Relleno controlado.
- **📚 Normas:** fichas de estudio de las normas ASTM de los ensayos (D5030, D1556, D2216, D6913, D4318, D698, D854, D2487): para qué sirve, equipo, procedimiento, fórmulas, criterios y errores comunes, más un repaso de preguntas por norma o general. Son resúmenes propios, no el texto de la norma; el botón «Norma oficial» abre la página de ASTM.
- **Ensayos que no son generadores** (CH, G, L, PE, GE…): en «Nuevo» solo se registran eligiendo el pendiente de su RA, CA, EM o muestra, para que queden enlazados y se marquen como hechos. Registrarlos sin generador solo lo puede hacer quien tiene permiso de editar y eliminar.
- **Correlativo de los hijos:** en ⚙ › Frentes › Editar › material › Editar, cada generador (RA, CA, EM, muestra) tiene «Correlativo de sus hijos» con − / +. Por ejemplo, con +2 en el RA del relleno controlado, el RA-042 propone a sus hijos el 044 (siempre editable).
- **Aplica carga puntual:** la evaluación de material (EM) y la muestra para laboratorio tienen el botón «Aplica carga puntual»; si se marca, deja pendiente el ensayo CP (índice de carga puntual, ASTM D5731), igual que «Aplica Proctor».
- **Texto para WhatsApp:** el botón «📋 Copiar» de «Nuevo» y «📋 Copiar texto» de «Del día» dan un texto corto con negritas (fecha y turno, ensayo, correlativo y DH). Los ensayos hijos solo llevan el correlativo y su estado (en horno / terminado); al terminar un ensayo en proceso, el texto se copia solo. La hoja de Google sigue recibiendo las columnas de siempre.
- **RA y CA:** piden nivel de cota, test fill (RA) o DMS (CA) con su CH óptimo —se eligen de los configurados en ⚙ para el material o se escriben a mano— y el RA también ciclos. El CA ahora también pide DH.
