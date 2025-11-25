const { Kafka, Partitioners } = require('kafkajs');
const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry');

async function setupKafka() {
  const kafka = new Kafka({
    clientId: 'whatsapp-service',
    brokers: ['broker:29092']
  });

  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  const consumer = kafka.consumer({ groupId: 'whatsapp-out-group' });
  const registry = new SchemaRegistry({ host: 'http://schema-registry:8081' });

  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'whatsapp-out' });

  console.log(`✅ Kafka configurado correctamente`);
  return { producer, consumer, registry };
}

module.exports = { setupKafka };
