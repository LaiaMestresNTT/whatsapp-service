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

async function registerSchema(registry) {
  const { id } = await registry.register({
    type: SchemaType.AVRO,
    schema: JSON.stringify(schema),
    subject: 'whatsapp-in-value'
  });
  console.log(`✅ Esquema registrado con ID: ${id}`);
  return id;
}

module.exports = { registerSchema };
