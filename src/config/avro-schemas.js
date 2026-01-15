const { SchemaType } = require('@kafkajs/confluent-schema-registry');

const schema = {
  type: 'record',
  name: 'WhatsAppMessage',
  namespace: 'com.alertbot.avro',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'text', type: 'string' }
  ]
};

// El subject lo registra automaticamente con el "name"."namespace" del schema (eso no se puede cambiar)
async function registerSchema(registry) {
  const { id } = await registry.register({
    type: SchemaType.AVRO,
    schema: JSON.stringify(schema)
  });
  console.log(`✅ Esquema registrado con ID: ${id}`);
  return id;
}

module.exports = { registerSchema };
