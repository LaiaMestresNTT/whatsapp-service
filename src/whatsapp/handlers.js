const { sendAvroMessage } = require('../kafka/producer');

async function handleIncomingMessage(client, msg, producer, registry, schemaId) {
  const texto = msg.body.trim().toLowerCase();
  if (texto.startsWith('buenas bot')) {
    console.log(`🤖 Invocación detectada: ${msg.body}`);

    // NO VA LA RESPUESTA AUTOMÁTICA
    //await client.sendMessage(msg.from, '✅ Mensaje recibido por el Bot, ¡hola!');

    const message = { id: msg.from, text: msg.body };
    await sendAvroMessage(producer, registry, schemaId, 'whatsapp-in', message);
  }
}

async function handleOwnMessage(client, msg, producer, registry, schemaId) {
  if (msg.fromMe && msg.body.trim().toLowerCase().startsWith('buenas bot')) {
    const message = { id: msg.from, text: msg.body };
    await sendAvroMessage(producer, registry, schemaId, 'whatsapp-in', message);
  }
}

module.exports = { handleIncomingMessage, handleOwnMessage };
