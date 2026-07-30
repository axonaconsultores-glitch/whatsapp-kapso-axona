# Campana de invitacion por WhatsApp - Foro de Seguridad de la Informacion (AXONA)

Este proyecto envia la invitacion del foro por WhatsApp a tu lista de contactos que ya autorizaron recibir mensajes comerciales, usando Kapso (plan gratuito) como intermediario hacia la API oficial de WhatsApp Business (Meta).

Toda la logica del programa ya fue probada (lectura de contactos, filtro de quien autorizo, control de numeros invalidos, y que no se dupliquen envios si el proceso se interrumpe).

## Parte 1 - Verificar Kapso (una sola vez)

1. Entra a https://app.kapso.ai con la cuenta axona.consultores@gmail.com.
2. 2. Busca WhatsApp en el menu. Si ya ves un numero conectado, sigue al paso 3. Si no, haz clic en Connect WhatsApp Number y sigue el asistente (Embedded Signup) usando el numero de WhatsApp Business de AXONA.
   3. 3. Copia el Phone Number ID que aparece junto al numero conectado.
      4. 4. Ve a Project Settings > API Keys y copia tu API Key.
        
         5. ## Parte 2 - Configurar los secretos en GitHub (una sola vez)
        
         6. 1. Ve a la pestana Settings > Secrets and variables > Actions de este repositorio.
            2. 2. Crea estos 3 secretos, uno por uno: KAPSO_API_KEY, KAPSO_PHONE_NUMBER_ID, NUMERO_DE_PRUEBA (tu propio WhatsApp, formato 573XXXXXXXXX).
              
               3. Estos secretos solo los ves tu y GitHub; no pasan por este chat.
              
               4. ## Parte 3 - Crear y aprobar la plantilla del mensaje
              
               5. WhatsApp exige que cualquier mensaje que tu inicias use una plantilla previamente aprobada por Meta. Ve a la pestana Actions, selecciona el workflow "Campana WhatsApp AXONA", boton Run workflow, elige la accion crear-plantilla. Luego revisa el estado con la accion ver-plantilla hasta ver APPROVED.
              
               6. ## Parte 4 - Probar con un solo mensaje
              
               7. Run workflow con la accion prueba. Revisa tu WhatsApp: debes ver el texto con los dos botones de enlace.
              
               8. ## Parte 5 - Preparar tu lista real de contactos
              
               9. 1. Copia datos/contactos_ejemplo.csv como datos/contactos.csv y subelo al repositorio.
                  2. 2. Completa las columnas: nombre, numero (formato internacional sin +, ej 573001234567), autorizo_mensajes (escribe si solo si esa persona autorizo), fecha_autorizacion.
                     3. 3. Solo se envia mensaje a las filas marcadas si.
                       
                        4. ## Parte 6 - Simular la campana
                       
                        5. Run workflow con la accion simular. Muestra a quien se enviaria y a quien se excluiria, sin gastar mensajes reales.
                       
                        6. ## Parte 7 - Enviar la campana real
                       
                        7. Run workflow con la accion enviar. Envia un mensaje cada 1.2 segundos aproximadamente. Si se corta a mitad de camino, puedes volver a correr la misma accion: no reenvia a quien ya quedo registrado como enviado (siempre que subas de vuelta el logs/resultado_envio.csv descargado). Al final, en Artifacts, puedes descargar el archivo resultado-envio con el detalle de cada mensaje.
                       
                        8. ## Sobre costos
                       
                        9. Kapso plan gratuito incluye 2000 mensajes al mes, mas que suficiente para 100. Meta cobra por separado cada mensaje tipo marketing entregado, directamente a tu cuenta de Meta Business. Revisa las tarifas vigentes en tu WhatsApp Manager antes de enviar a los 100.
                       
                        10. ## Sobre cumplimiento
                       
                        11. Solo se envia a quien tenga autorizo_mensajes en si. El mensaje incluye una linea para que quien no quiera mas mensajes lo indique respondiendo; atiende esas respuestas. Guarda tu contactos.csv con las fechas de autorizacion como respaldo.
                        12. 
