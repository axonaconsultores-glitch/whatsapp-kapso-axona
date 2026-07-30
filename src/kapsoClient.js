const axios = require("axios");

const BASE_URL = "https://api.kapso.ai/meta/whatsapp/v24.0";

function crearCliente() {
    const apiKey = process.env.KAPSO_API_KEY;
    const phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
        throw new Error(
                "Falta KAPSO_API_KEY o KAPSO_PHONE_NUMBER_ID en tu archivo .env"
              );
  }

  return axios.create({
        baseURL: `${BASE_URL}/${phoneNumberId}`,
        headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
  });
}

/**
 * Envia un mensaje de plantilla (requerido para mensajes iniciados por el negocio).
 * @param {string} numero - Numero en formato internacional sin "+" (ej: 573001234567)
 * @param {string} nombreContacto - Se usa para rellenar la variable {{1}} del cuerpo
 */
async function enviarPlantilla(numero, nombreContacto) {
    const cliente = crearCliente();
    const nombrePlantilla = process.env.NOMBRE_PLANTILLA || "invitacion_foro_seguridad";
    const idioma = process.env.IDIOMA_PLANTILLA || "es";

  const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: numero,
        type: "template",
        template: {
                name: nombrePlantilla,
                language: { code: idioma },
                components: [
                  {
                              type: "body",
                              parameters: [{ type: "text", text: nombreContacto || "" }],
                  },
                        ],
        },
  };

  const resp = await cliente.post("/messages", payload);
    return resp.data;
}

module.exports = { enviarPlantilla };
