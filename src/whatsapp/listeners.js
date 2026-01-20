const { handleIncomingMessage, handleOwnMessage } = require('./handlers');

function attachListeners(client, producer, registry, schemaId) {
  client.on('message', msg => handleIncomingMessage(client, msg, producer, registry, schemaId));
  client.on('message_create', msg => handleOwnMessage(client, msg, producer, registry, schemaId));
}

module.exports = { attachListeners };
