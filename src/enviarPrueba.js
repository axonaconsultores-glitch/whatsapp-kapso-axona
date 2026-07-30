/**
 * Envia UN solo mensaje de prueba, a TU propio numero (NUMERO_DE_PRUEBA en .env).
 * Ejecuta esto antes de la campana real para confirmar que todo funciona.
 *
 * Uso:
 *   node src/enviarPrueba.js
 */
require("dotenv").config();
const { enviarPlantilla } = require("./kapsoClient");

const numeroPrueba = process.env.NUMERO_DE_PRUEBA;

if (!numeroPrueba) {
    console.error(
          "Define NUMERO_DE_PRUEBA en tu archivo .env con tu propio numero (ej: 573001234567)"
        );
    process.exit(1);
}

enviarPlantilla(numeroPrueba, "Prueba")
  .then((data) => {
        console.log("Mensaje de prueba enviado. Revisa tu WhatsApp.");
        console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
        console.error("Error al enviar el mensaje de prueba:");
        console.error(JSON.stringify(err.response?.data || err.message, null, 2));
        process.exit(1);
  });
