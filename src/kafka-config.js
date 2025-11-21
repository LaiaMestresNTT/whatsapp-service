const { Kafka, Partitioners } = require('kafkajs');
const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry');

const kafka = new Kafka({
  clientId: 'whatsapp-service',
  brokers: ['broker:29092']
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
const consumer = kafka.consumer({ groupId: 'whatsapp-out-group' });
const registry = new SchemaRegistry({ host: 'http://schema-registry:8081' });

async function createTopics() {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [
      { topic: 'whatsapp-in', numPartitions: 1, replicationFactor: 1 },
      { topic: 'whatsapp-out', numPartitions: 1, replicationFactor: 1 }
    ],
    waitForLeaders: true
  });
  console.log('✅ Topics creados: whatsapp-in, whatsapp-out');
  await admin.disconnect();
}

module.exports = { producer, consumer, createTopics, registry };