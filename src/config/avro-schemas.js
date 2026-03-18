const { SchemaType } = require('@kafkajs/confluent-schema-registry');

const whatsAppMessageSchema = {
  type: 'record',
  name: 'WhatsAppMessage',
  namespace: 'com.alertbot.avro',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'text', type: 'string' }
  ]
};

const whatsAppResponseSchema = {
  type: 'record',
  name: 'WhatsAppResponse',
  namespace: 'com.alertbot.avro',
  fields: [
    { name: 'user_id', type: 'string' },
    { name: 'message', type: 'string' }
  ]
};

// El subject lo registra automaticamente con el "name"."namespace" del schema (eso no se puede cambiar)
async function registerSchema(registry) {
    const { id: messageId } = await registry.register({
      type: SchemaType.AVRO,
      schema: JSON.stringify(whatsAppMessageSchema)
    });

    const { id: responseId } = await registry.register({
      type: SchemaType.AVRO,
      schema: JSON.stringify(whatsAppResponseSchema)
    });

    console.log(`✅ Schema WhatsAppMessage registrado con ID: ${messageId}`);
    console.log(`✅ Schema WhatsAppResponse registrado con ID: ${responseId}`);
    return { messageId, responseId };
}

module.exports = { registerSchema };
