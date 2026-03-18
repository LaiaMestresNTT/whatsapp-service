const { Kafka, Partitioners } = require('kafkajs');
const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry');

async function setupKafka() {
  const kafka = new Kafka({
    clientId: 'whatsapp-service',
    brokers: ['broker:9092'],
    retry: {
      initialRetryTime: 300,
      retries: 10 // Aumentamos reintentos por si el broker está arrancando
    }
  });

  const admin = kafka.admin();
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  const consumer = kafka.consumer({ groupId: 'whatsapp-out-group' });
  const registry = new SchemaRegistry({ host: 'http://schema-registry:8081' });

  await producer.connect();
  await consumer.connect();

 // Crear topics si no existen
   await admin.connect();
   await admin.createTopics({
     waitForLeaders: true,
     topics: [
       { topic: 'whatsapp-in', numPartitions: 1, replicationFactor: 1 },
       { topic: 'whatsapp-out', numPartitions: 1, replicationFactor: 1 }
     ]
   });
   await admin.disconnect();

  console.log(`✅ Kafka configurado correctamente`);
  return { producer, consumer, registry };
}

module.exports = { setupKafka };
