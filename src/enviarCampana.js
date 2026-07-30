/**
 * Envia el mensaje de invitacion al foro a toda la lista de contactos
 * que autorizaron mensajes comerciales (datos/contactos.csv).
 *
 * MODO SIMULACION (recomendado primero, no envia nada real):
 *   node src/enviarCampana.js --dry-run
 *
 * ENVIO REAL:
 *   node src/enviarCampana.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { enviarPlantilla } = require("./kapsoClient");

const RUTA_CONTACTOS = path.join(__dirname, "..", "datos", "contactos.csv");
const RUTA_LOG = path.join(__dirname, "..", "logs", "resultado_envio.csv");
const ESPERA_ENTRE_MENSAJES_MS = 1200;
const esSimulacion = process.argv.includes("--dry-run");

// Horario laboral valido para Colombia: 10:00am a 4:00pm (16:00)
const HORA_INICIO_VALIDA = 10;
const HORA_FIN_VALIDA = 16;

function horaActualColombia() {
  const formateador = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "numeric",
    hour12: false,
  });
  return parseInt(formateador.format(new Date()), 10);
}

function estaEnHorarioValido() {
  const hora = horaActualColombia();
  return hora >= HORA_INICIO_VALIDA && hora < HORA_FIN_VALIDA;
}

function cargarContactos() {
  if (!fs.existsSync(RUTA_CONTACTOS)) {
    console.error(
      `No encontre ${RUTA_CONTACTOS}. Copia datos/contactos_ejemplo.csv como datos/contactos.csv y completalo con tu lista real.`
    );
    process.exit(1);
  }
  const contenido = fs.readFileSync(RUTA_CONTACTOS, "utf-8");
  return parse(contenido, { columns: true, skip_empty_lines: true, trim: true });
}

function cargarYaEnviados() {
  if (!fs.existsSync(RUTA_LOG)) return new Set();
  const contenido = fs.readFileSync(RUTA_LOG, "utf-8");
  const filas = parse(contenido, { columns: true, skip_empty_lines: true });
  return new Set(
    filas.filter((f) => f.estado === "enviado").map((f) => f.numero)
  );
}

function registrarResultado(fila) {
  const encabezado = "numero,nombre,estado,detalle,fecha\n";
  const existe = fs.existsSync(RUTA_LOG);
  if (!existe) fs.writeFileSync(RUTA_LOG, encabezado);
  const linea = `${fila.numero},"${fila.nombre}",${fila.estado},"${(fila.detalle || "").replace(/"/g, "'")}",${new Date().toISOString()}\n`;
  fs.appendFileSync(RUTA_LOG, linea);
}

function dormir(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ejecutarCampana() {
  const contactos = cargarContactos();
  const yaEnviados = cargarYaEnviados();

  const pendientes = contactos.filter(
    (c) => (c.autorizo_mensajes || "").toLowerCase() === "si" && !yaEnviados.has(c.numero)
  );
  const excluidos = contactos.length - pendientes.length - yaEnviados.size;

  console.log(`Total en el archivo: ${contactos.length}`);
  console.log(`Ya enviados anteriormente (se omiten): ${yaEnviados.size}`);
  console.log(`Pendientes de enviar ahora: ${pendientes.length}`);
  if (esSimulacion) {
    console.log("MODO SIMULACION: no se enviara ningun mensaje real.");
  } else {
    if (!estaEnHorarioValido()) {
      console.log(
        `Fuera de horario laboral. Los envios reales solo se permiten entre las ` +
        `${HORA_INICIO_VALIDA}:00am y las ${HORA_FIN_VALIDA - 12}:00pm, hora Colombia. ` +
        `Hora actual en Colombia: ${horaActualColombia()}:00. ` +
        `Vuelve a ejecutar esta accion dentro de ese horario. No se envio ningun mensaje.`
      );
      process.exit(1);
    }
    console.log("MODO ENVIO REAL: se enviaran mensajes de verdad.");
  }

  let exitosos = 0;
  let fallidos = 0;

  for (const contacto of pendientes) {
    const numero = (contacto.numero || "").replace(/[^0-9]/g, "");
    const nombre = contacto.nombre || "";

    if (!numero || numero.length < 10) {
      console.log(`Saltando "${nombre}" - numero invalido: "${contacto.numero}"`);
      registrarResultado({ numero: contacto.numero, nombre, estado: "invalido", detalle: "numero mal formado" });
      fallidos++;
      continue;
    }

    if (esSimulacion) {
      console.log(`(simulado) Se enviaria a ${nombre} <${numero}>`);
      exitosos++;
      continue;
    }

    if (!estaEnHorarioValido()) {
      console.log(
        `Se alcanzo el limite del horario laboral (${HORA_FIN_VALIDA - 12}:00pm, hora Colombia). ` +
        `Se detiene el envio aqui; el resto queda pendiente para el siguiente horario valido.`
      );
      break;
    }

    try {
      const resultado = await enviarPlantilla(numero, nombre);
      console.log(`Enviado a ${nombre} <${numero}>`);
      registrarResultado({
        numero,
        nombre,
        estado: "enviado",
        detalle: resultado?.messages?.[0]?.id || "ok",
      });
      exitosos++;
    } catch (err) {
      const detalle = JSON.stringify(err.response?.data || err.message);
      console.log(`Fallo ${nombre} <${numero}>: ${detalle}`);
      registrarResultado({ numero, nombre, estado: "fallo", detalle });
      fallidos++;
    }

    await dormir(ESPERA_ENTRE_MENSAJES_MS);
  }

  console.log("Resumen:");
  console.log(`${exitosos} ok, ${fallidos} con problema, ${excluidos} excluidos (sin autorizacion)`);
  if (!esSimulacion) console.log(`Detalle completo en: ${RUTA_LOG}`);
}

ejecutarCampana();
/**
 * Envia el mensaje de invitacion al foro a toda la lista de contactos
 * que autorizaron mensajes comerciales (datos/contactos.csv).
 *
 * MODO SIMULACION (recomendado primero, no envia nada real):
 *   node src/enviarCampana.js --dry-run
 *
 * ENVIO REAL:
 *   node src/enviarCampana.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { enviarPlantilla } = require("./kapsoClient");

const RUTA_CONTACTOS = path.join(__dirname, "..", "datos", "contactos.csv");
const RUTA_LOG = path.join(__dirname, "..", "logs", "resultado_envio.csv");
const ESPERA_ENTRE_MENSAJES_MS = 1200;
const esSimulacion = process.argv.includes("--dry-run");

function cargarContactos() {
    if (!fs.existsSync(RUTA_CONTACTOS)) {
          console.error(
                  `No encontre ${RUTA_CONTACTOS}. Copia datos/contactos_ejemplo.csv como datos/contactos.csv y completalo con tu lista real.`
                );
          process.exit(1);
    }
    const contenido = fs.readFileSync(RUTA_CONTACTOS, "utf-8");
    return parse(contenido, { columns: true, skip_empty_lines: true, trim: true });
}

function cargarYaEnviados() {
    if (!fs.existsSync(RUTA_LOG)) return new Set();
    const contenido = fs.readFileSync(RUTA_LOG, "utf-8");
    const filas = parse(contenido, { columns: true, skip_empty_lines: true });
    return new Set(
          filas.filter((f) => f.estado === "enviado").map((f) => f.numero)
        );
}

function registrarResultado(fila) {
    const encabezado = "numero,nombre,estado,detalle,fecha\n";
    const existe = fs.existsSync(RUTA_LOG);
    if (!existe) fs.writeFileSync(RUTA_LOG, encabezado);
    const linea = `${fila.numero},"${fila.nombre}",${fila.estado},"${(fila.detalle || "").replace(/"/g, "'")}",${new Date().toISOString()}\n`;
    fs.appendFileSync(RUTA_LOG, linea);
}

function dormir(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ejecutarCampana() {
    const contactos = cargarContactos();
    const yaEnviados = cargarYaEnviados();

  const pendientes = contactos.filter(
        (c) => (c.autorizo_mensajes || "").toLowerCase() === "si" && !yaEnviados.has(c.numero)
      );
    const excluidos = contactos.length - pendientes.length - yaEnviados.size;

  console.log(`Total en el archivo: ${contactos.length}`);
    console.log(`Ya enviados anteriormente (se omiten): ${yaEnviados.size}`);
    console.log(`Pendientes de enviar ahora: ${pendientes.length}`);
    if (esSimulacion) {
          console.log("MODO SIMULACION: no se enviara ningun mensaje real.");
    } else {
          console.log("MODO ENVIO REAL: se enviaran mensajes de verdad.");
    }

  let exitosos = 0;
    let fallidos = 0;

  for (const contacto of pendientes) {
        const numero = (contacto.numero || "").replace(/[^0-9]/g, "");
        const nombre = contacto.nombre || "";

      if (!numero || numero.length < 10) {
              console.log(`Saltando "${nombre}" - numero invalido: "${contacto.numero}"`);
              registrarResultado({ numero: contacto.numero, nombre, estado: "invalido", detalle: "numero mal formado" });
              fallidos++;
              continue;
      }

      if (esSimulacion) {
              console.log(`(simulado) Se enviaria a ${nombre} <${numero}>`);
              exitosos++;
              continue;
      }

      try {
              const resultado = await enviarPlantilla(numero, nombre);
              console.log(`Enviado a ${nombre} <${numero}>`);
              registrarResultado({
                        numero,
                        nombre,
                        estado: "enviado",
                        detalle: resultado?.messages?.[0]?.id || "ok",
              });
              exitosos++;
      } catch (err) {
              const detalle = JSON.stringify(err.response?.data || err.message);
              console.log(`Fallo ${nombre} <${numero}>: ${detalle}`);
              registrarResultado({ numero, nombre, estado: "fallo", detalle });
              fallidos++;
      }

      await dormir(ESPERA_ENTRE_MENSAJES_MS);
  }

  console.log("Resumen:");
    console.log(`${exitosos} ok, ${fallidos} con problema, ${excluidos} excluidos (sin autorizacion)`);
    if (!esSimulacion) console.log(`Detalle completo en: ${RUTA_LOG}`);
}

ejecutarCampana();
