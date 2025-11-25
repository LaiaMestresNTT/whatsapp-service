const { handleIncomingMessage, handleOwnMessage } = require('./handlers');

function attachListeners(client, producer, registry, schemaId) {
  client.on('message', msg => handleIncomingMessage(msg, producer, registry, schemaId));
  client.on('message_create', msg => handleOwnMessage(msg, producer, registry, schemaId));
}

module.exports = { attachListeners };
