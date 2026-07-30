/**
 * Consulta el estado de la plantilla en Meta: PENDING, APPROVED o REJECTED.
 * No envies la campana real hasta que veas APPROVED.
 *
 * Uso:
 *   node src/verEstadoPlantilla.js
 */
require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.KAPSO_API_KEY;
const PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;
const NOMBRE_PLANTILLA = process.env.NOMBRE_PLANTILLA || "invitacion_foro_seguridad";

const BASE_URL = "https://api.kapso.ai/meta/whatsapp/v24.0";

async function verEstado() {
    try {
          const resp = await axios.get(`${BASE_URL}/${PHONE_NUMBER_ID}/message_templates`, {
                  headers: { "X-API-Key": API_KEY },
                  params: { name: NOMBRE_PLANTILLA },
          });

      const plantillas = resp.data?.data || [];
          if (plantillas.length === 0) {
                  console.log(
                            `No se encontro ninguna plantilla llamada "${NOMBRE_PLANTILLA}". Ya ejecutaste "npm run crear-plantilla"?`
                          );
                  return;
          }

      plantillas.forEach((p) => {
              console.log(`Plantilla: ${p.name} | Idioma: ${p.language} | Estado: ${p.status}`);
              if (p.status === "REJECTED") {
                        console.log("Motivo de rechazo:", JSON.stringify(p.rejected_reason || p, null, 2));
              }
      });

      const aprobada = plantillas.some((p) => p.status === "APPROVED");
          if (aprobada) {
                  console.log("La plantilla ya esta APROBADA. Puedes continuar con la prueba y la campana.");
          } else {
                  console.log("Aun no esta aprobada. Vuelve a ejecutar este comando en un rato.");
          }
    } catch (err) {
          console.error("Error al consultar la plantilla:");
          console.error(JSON.stringify(err.response?.data || err.message, null, 2));
          process.exit(1);
    }
}

verEstado();
