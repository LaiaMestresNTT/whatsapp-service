const { initClient, waitForReady } = require('./whatsapp/client');
const { setupKafka } = require('./config/kafka');
const { registerSchema } = require('./config/avro-schemas');
const { attachListeners } = require('./whatsapp/listeners');
const { startConsumer } = require('./kafka/consumer');
const setupConnect = require('./config/connect');

(async () => {
  try {
    //CONFIG
    console.log('⏩ Conectando Kafka....')
    const { producer, consumer, registry } = await setupKafka();
    console.log('⏩ Registrando schemas avro...')
    const schemaId = await registerSchema(registry);
    console.log('⏩ Registrando conectores MongoSink ...')
    await setupConnect();

    //CLIENT
    console.log('⏩ Inicializando cliente WhatsApp...')
    const client = await initClient();
    if (!client) {
      throw new Error('Cliente WhatsApp no inicializado');
    }
    await waitForReady(client, { timeoutMs: 180000 })

    // LISTENERS + CONSUMER
    console.log('⏩ Inicializando listeners y consumers...')
    attachListeners(client, producer, registry, schemaId);
    await startConsumer(consumer, client);


    console.log('⭐ Microservicio WhatsApp iniciado');
  } catch (err) {
    console.error('❌ Error al iniciar el servicio:', err);
    process.exit(1);
  }
})();

