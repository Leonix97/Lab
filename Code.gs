/* ════════════════════════════════════════════════════════════════
   SERVIDOR DEL LABORATORIO CQC            (Google Apps Script)
   Va pegado en: Hoja de cálculo › Extensiones › Apps Script
   ════════════════════════════════════════════════════════════════ */

/* ───── AJUSTA SOLO ESTA PARTE ───── */
var CLAVE_EQUIPO = "cambia-esta-clave";      // la misma que pondrás en la app
var EDITORES = {                              // PIN : nombre de quien edita los Ajustes
  "1111": "L. TAFUR",
  "2222": "EDITOR 2",
  "3333": "EDITOR 3"
};
var CARPETA_FOTOS = "Fotos Ensayos Laboratorio CQC"; // carpeta de Drive (se crea sola)
var ZONA = "America/Lima";
/* ───────────────────────────────── */

var HOJA_LIB = "Ensayos";
var HOJA_CFG = "Configuracion";
var FIJAS = ["ID","FECHA","HORA","TEXTO COMPLETO","FOTO","UID"];

/* Ejecuta esta función UNA vez desde el editor para autorizar y crear todo */
function instalar(){
  hojaLib(); hojaCfg(); carpeta();
  Logger.log("Listo. Ahora: Implementar › Nueva implementación › Aplicación web.");
}

function doGet(){ return json({ok:true,msg:"Servidor del laboratorio activo"}); }

function doPost(e){
  var r;
  try{
    var q = JSON.parse(e.postData.contents);
    if(q.key !== CLAVE_EQUIPO) return json({ok:false,error:"Clave de equipo incorrecta"});
    switch(q.action){
      case "ping":       r = {ok:true, hoja:SpreadsheetApp.getActive().getUrl()}; break;
      case "getConfig":  r = getConfig(); break;
      case "checkPin":   r = EDITORES[q.pin] ? {ok:true,nombre:EDITORES[q.pin]} : {ok:false,error:"PIN incorrecto"}; break;
      case "saveConfig": r = saveConfig(q); break;
      case "addLib":     r = addLib(q); break;
      case "listLibs":   r = listLibs(String(q.fecha||""), !!q.fotos); break;
      case "searchLibs": r = searchLibs(String(q.q||"")); break;
      case "codigos":    r = codigos(); break;
      case "padre":      r = ajustarPadre(q); break;
      default:           r = {ok:false,error:"Acción desconocida"};
    }
  }catch(err){ r = {ok:false,error:String(err && err.message || err)}; }
  return json(r);
}
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function ahora(f){ return Utilities.formatDate(new Date(), ZONA, f); }

/* ───── hojas y carpeta ───── */
function hojaLib(){
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(HOJA_LIB);
  if(!sh){
    sh = ss.insertSheet(HOJA_LIB);
    sh.getRange(1,1,1,FIJAS.length).setValues([FIJAS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange("A:C").setNumberFormat("@");
  }
  return sh;
}
function hojaCfg(){
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(HOJA_CFG);
  if(!sh){
    sh = ss.insertSheet(HOJA_CFG);
    sh.getRange(1,1,1,4).setValues([["VERSIÓN","FECHA","EDITOR","CONFIGURACIÓN (no editar a mano)"]]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange("B:B").setNumberFormat("@");
  }
  return sh;
}
function carpeta(){
  var p = PropertiesService.getScriptProperties(), id = p.getProperty("carpeta");
  if(id){ try{ return DriveApp.getFolderById(id); }catch(e){} }
  var f = DriveApp.createFolder(CARPETA_FOTOS);
  p.setProperty("carpeta", f.getId());
  return f;
}
function subcarpeta(nombre){
  var padre = carpeta(), it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}

/* ───── configuración compartida (cada guardado es una fila: historial) ───── */
function ultimaCfg(sh){
  var n = sh.getLastRow();
  if(n < 2) return null;
  var v = sh.getRange(n,1,1,4).getDisplayValues()[0];
  return {version:Number(v[0])||0, fecha:v[1], por:v[2], json:v[3]};
}
function getConfig(){
  var u = ultimaCfg(hojaCfg());
  if(!u) return {ok:true,config:null,version:0};
  return {ok:true,config:JSON.parse(u.json),version:u.version,fecha:u.fecha,por:u.por};
}
function saveConfig(q){
  var nombre = EDITORES[q.pin];
  if(!nombre) return {ok:false,error:"PIN incorrecto"};
  var txt = JSON.stringify(q.config||{});
  if(txt.length > 49000) return {ok:false,error:"La configuración es demasiado grande"};
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try{
    var sh = hojaCfg(), u = ultimaCfg(sh), ver = u ? u.version : 0;
    if(!q.force && Number(q.baseVersion||0) !== ver)
      return {ok:false,conflict:true,version:ver,por:u?u.por:"",fecha:u?u.fecha:""};
    var fecha = ahora("dd/MM/yyyy HH:mm");
    sh.appendRow([ver+1, fecha, nombre, txt]);
    return {ok:true,version:ver+1,fecha:fecha,por:nombre};
  } finally { lock.releaseLock(); }
}

/* ───── ensayos ───── */
function limpiarNombre(s){ return String(s||"").replace(/[\\\/:*?"<>|#%\n\r]+/g," ").replace(/\s+/g," ").trim().slice(0,120); }

function addLib(q){
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try{
    var sh = hojaLib();
    var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
    var colUid = headers.indexOf("UID")+1;

    // evita duplicados si la app reintenta un envío
    if(q.uid && sh.getLastRow() > 1){
      var hit = sh.getRange(2,colUid,sh.getLastRow()-1,1).createTextFinder(q.uid).matchEntireCell(true).findNext();
      if(hit){
        var fila = sh.getRange(hit.getRow(),1,1,headers.length).getDisplayValues()[0];
        return {ok:true,id:fila[0],foto:fila[headers.indexOf("FOTO")],repetida:true};
      }
    }

    // la fecha la manda la app (fecha del turno: el turno noche conserva su fecha después de medianoche)
    var fecha = /^\d{4}-\d{2}-\d{2}$/.test(String(q.fecha||"")) ? String(q.fecha) : ahora("yyyy-MM-dd"), hora = ahora("HH:mm");
    var fp = fecha.split("-");
    var props = PropertiesService.getScriptProperties();
    var n = Number(props.getProperty("e_"+fecha)||0)+1;
    props.setProperty("e_"+fecha, String(n));
    var nnn = ("00"+n).slice(-3);
    var id = "E"+fp[0].slice(2)+fp[1]+fp[2]+"-"+nnn;

    var fotoUrl = "";
    if(q.foto && q.foto.data){
      var nombre = nnn+"_"+limpiarNombre(q.nombreFoto||"Ensayo")+".jpg";
      var blob = Utilities.newBlob(Utilities.base64Decode(q.foto.data), q.foto.mime||"image/jpeg", nombre);
      var file = subcarpeta(fp[2]+"-"+fp[1]+"-"+fp[0].slice(2)).createFile(blob);
      try{ file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(e){}
      fotoUrl = file.getUrl();
    }

    // columnas dinámicas: una por cada dato del texto (PROYECTO, CAPA, MATERIAL, CORRELATIVO…)
    var campos = (Array.isArray(q.campos) ? q.campos : []).filter(function(c){
      var k = String(c[0]).toUpperCase().trim(); return FIJAS.indexOf(k) < 0 && k !== "TURNO" && k !== "DATOS APP";
    });

    // aviso si el correlativo (RA-001…) ya existe en la hoja (se registra igual)
    var dup = {};
    campos.forEach(function(c){
      var k = String(c[0]).toUpperCase().trim(), col = headers.indexOf(k)+1;
      if(k==="CORRELATIVO" && col > 0 && sh.getLastRow() > 1){
        var f = sh.getRange(2,col,sh.getLastRow()-1,1).createTextFinder(String(c[1])).matchEntireCell(true).findNext();
        if(f) dup[k] = true;
      }
    });
    campos.forEach(function(c){
      var k = String(c[0]).toUpperCase().trim();
      if(k && headers.indexOf(k) < 0){
        headers.push(k);
        sh.getRange(1,headers.length).setValue(k).setFontWeight("bold");
      }
    });
    ["TURNO","DATOS APP"].forEach(function(k){
      if(headers.indexOf(k) < 0){ headers.push(k); sh.getRange(1,headers.length).setValue(k).setFontWeight("bold"); }
    });
    var fila = headers.map(function(){ return ""; });
    fila[headers.indexOf("TURNO")] = String(q.turno||"");
    fila[headers.indexOf("DATOS APP")] = String(q.form||"").slice(0,45000);
    fila[headers.indexOf("ID")] = id;
    fila[headers.indexOf("FECHA")] = fecha;
    fila[headers.indexOf("HORA")] = hora;
    fila[headers.indexOf("TEXTO COMPLETO")] = String(q.texto||"");
    fila[headers.indexOf("FOTO")] = fotoUrl;
    fila[headers.indexOf("UID")] = String(q.uid||"");
    campos.forEach(function(c){ fila[headers.indexOf(String(c[0]).toUpperCase().trim())] = String(c[1]); });
    var r = sh.getLastRow()+1;
    sh.getRange(r,1,1,fila.length).setNumberFormat("@");   // texto: conserva ceros (RA-007, capa 05)
    sh.getRange(r,1,1,fila.length).setValues([fila]);
    return {ok:true,id:id,foto:fotoUrl,dupCorrelativo:!!dup["CORRELATIVO"]};
  } finally { lock.releaseLock(); }
}

/* lee todas las filas como objetos */
function filasLib(){
  var sh = hojaLib(), n = sh.getLastRow();
  if(n < 2) return [];
  var h = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  var d = sh.getRange(2,1,n-1,h.length).getDisplayValues();
  var ix = function(k){ return h.indexOf(k); };
  var iF=ix("FECHA"), iI=ix("ID"), iH=ix("HORA"), iT=ix("TEXTO COMPLETO"), iP=ix("FOTO"), iTu=ix("TURNO"), iD=ix("DATOS APP");
  return d.map(function(r){
    return {id:r[iI],fecha:r[iF],hora:r[iH],texto:r[iT],foto:r[iP],
            turno:iTu>=0?r[iTu]:"",form:iD>=0?r[iD]:""};
  });
}
function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

/* busca en todos los días; devuelve las 30 más recientes que contienen todas las palabras */
function searchLibs(q){
  var palabras = norm(q).split(/\s+/).filter(function(x){ return !!x; });
  if(!palabras.length) return {ok:true,items:[]};
  var filas = filasLib(), out = [];
  for(var i=filas.length-1; i>=0 && out.length<30; i--){
    var f = filas[i], t = norm(f.texto+" "+f.id+" "+f.fecha);
    if(palabras.every(function(p){ return t.indexOf(p) >= 0; })) out.push(f);
  }
  return {ok:true,items:out};
}

/* ensayos registrados (datos mínimos) para que la app proponga el siguiente correlativo,
   el N° de ensayo de cada capa y arme la lista de Pendientes */
function codigos(){
  var sh = hojaLib(), n = sh.getLastRow();
  if(n < 2) return {ok:true,items:[]};
  var h = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  var cD = h.indexOf("DATOS APP")+1, cU = h.indexOf("UID")+1, cI = h.indexOf("ID")+1;
  if(cD < 1) return {ok:true,items:[]};
  var datos = sh.getRange(2,cD,n-1,1).getValues(), uids = sh.getRange(2,cU,n-1,1).getValues(), ids = sh.getRange(2,cI,n-1,1).getValues();
  var out = [];
  datos.forEach(function(r,i){
    try{ var f = JSON.parse(r[0]); if(!f || !(f.v>=2)) return;
      out.push({u:String(uids[i][0]), id:String(ids[i][0]), k:f.tipo, n:Number(f.codN)||0, t:Number(f.t)||0, f:f.frente||"",
                m:f.material||"", pr:f.procedencia||"", c:f.capa||"", e:Number(f.nEns)||0, cod:f.cod||"", d:f.fecha||"",
                tu:f.turno||"", a:f.asoc||[], p:f.padre||"", x:f.x||[], o:f.o||{}});
    }catch(e){}
  });
  return {ok:true,items:out};
}

/* suma pendientes (p. ej. Proctor) u omite alguno en el ensayo que los originó */
function ajustarPadre(q){
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try{
    var sh = hojaLib(), n = sh.getLastRow();
    var h = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
    var cD = h.indexOf("DATOS APP")+1, cU = h.indexOf("UID")+1;
    if(n < 2 || cD < 1) return {ok:false,error:"No se encontró el ensayo de origen"};
    var hit = sh.getRange(2,cU,n-1,1).createTextFinder(String(q.padre||"")).matchEntireCell(true).findNext();
    if(!hit) return {ok:false,error:"No se encontró el ensayo de origen"};
    var cel = sh.getRange(hit.getRow(),cD), f = JSON.parse(cel.getValue()||"{}");
    f.x = (f.x||[]); (q.agregar||[]).forEach(function(k){ if(f.x.indexOf(k)<0) f.x.push(k); });
    f.o = f.o||{}; Object.keys(q.omitir||{}).forEach(function(k){ f.o[k] = String(q.omitir[k]).slice(0,200); });
    cel.setValue(JSON.stringify(f));
    return {ok:true};
  } finally { lock.releaseLock(); }
}

/* fotos=true incluye cada foto en base64 (para armar el reporte diario) */
function listLibs(fecha, fotos){
  var out = [];
  filasLib().forEach(function(it){
    if(it.fecha!==fecha) return;
    if(fotos && it.foto){
      var m = /\/d\/([\w-]+)/.exec(it.foto);
      try{ if(m) it.fotoData = Utilities.base64Encode(DriveApp.getFileById(m[1]).getBlob().getBytes()); }catch(e){}
    }
    out.push(it);
  });
  return {ok:true,items:out,hoja:SpreadsheetApp.getActive().getUrl()};
}
