/**
 * Crea la plantilla de mensaje "invitacion_foro_seguridad" y la envia
 * a revision de Meta (WhatsApp). Esto solo se hace UNA VEZ.
 *
 * Uso:
 *   node src/crearPlantilla.js
 */
require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.KAPSO_API_KEY;
const BUSINESS_ACCOUNT_ID = process.env.KAPSO_BUSINESS_ACCOUNT_ID;

if (!API_KEY || !BUSINESS_ACCOUNT_ID) {
      console.error(
              "Falta KAPSO_API_KEY o KAPSO_BUSINESS_ACCOUNT_ID en tu archivo .env."
            );
      process.exit(1);
}

const BASE_URL = "https://api.kapso.ai/meta/whatsapp/v24.0";

const plantilla = {
      name: "invitacion_foro_seguridad",
      language: "es",
      category: "MARKETING",
      components: [
          {
                    type: "BODY",
                    text:
                                "Hola {{1}}, desde AXONA queremos invitarte a participar en nuestro foro: " +
                                "Lleva la Seguridad de la Informacion de tu Organizacion a Otro Nivel.\n\n" +
                                "Conoce los detalles y confirma tu inscripcion en los enlaces a continuacion. " +
                                "Si no deseas volver a recibir este tipo de mensajes, respondenos indicandolo.",
                    example: {
                                body_text: [["Juan"]],
                    },
          },
          {
                    type: "BUTTONS",
                    buttons: [
                        {
                                      type: "URL",
                                      text: "Ver informacion del Foro",
                                      url: "https://www.linkedin.com/events/7485755037844008960",
                        },
                        {
                                      type: "URL",
                                      text: "Inscribirme al Foro",
                                      url: "https://forms.office.com/r/mh42aiUKGK",
                        },
                              ],
          },
            ],
};

async function crearPlantilla() {
      try {
              const resp = await axios.post(
                        `${BASE_URL}/${BUSINESS_ACCOUNT_ID}/message_templates`,
                        plantilla,
                  { headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" } }
                      );
              console.log("Plantilla enviada a revision de Meta:");
              console.log(JSON.stringify(resp.data, null, 2));
              console.log("Guarda el id que aparece arriba. Verifica el estado con: npm run ver-plantilla");
      } catch (err) {
              console.error("Error al crear la plantilla:");
              console.error(JSON.stringify(err.response?.data || err.message, null, 2));
              process.exit(1);
      }
}

crearPlantilla();
