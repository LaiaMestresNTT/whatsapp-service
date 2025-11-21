const initClient = require('./client-initializer.js');
const { producer, consumer, createTopics, registry } = require('./kafka-config');
const { SchemaType } = require('@kafkajs/confluent-schema-registry');

async function start() {
  const client = await initClient();
  await createTopics();
  await producer.connect();
  await consumer.connect();

  // Definir el esquema Avro
  const schema = {
    type: 'record',
    name: 'WhatsAppMessage', // Corrige el nombre (sin typo)
    namespace: 'com.alertbotspring.avro',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'text', type: 'string' }
    ]
  };

  // Registrar el esquema en Schema Registry
  const { id: schemaId } = await registry.register({
    type: SchemaType.AVRO,
    schema: JSON.stringify(schema), // Asegúrate que sea string
    subject: 'whatsapp-in-value'    // Subject correcto
  });

  console.log(`✅ Esquema registrado con ID: ${schemaId}`);

  // MENSAJES ENTRANTES
  client.on('message', async msg => {
    const texto = msg.body.trim().toLowerCase();

    if (texto.startsWith('buenas bot')) {
      console.log(`🤖 Invocación detectada: ${msg.body}`);
      await msg.reply('✅ Mensaje recibido por el Bot, ¡hola!');

      // Crear objeto Avro
      const message = { id: msg.from, text: msg.body };
      const encodedValue = await registry.encode(schemaId, message);

      await producer.send({
        topic: 'whatsapp-in',
        messages: [{ value: encodedValue }]
      });

      console.log('✅ Mensaje enviado en Avro al topic whatsapp-in');
    }
  });

 //MENSAJES PROPIOS
 client.on('message_create', async msg => {
    if (msg.fromMe) {
      const texto = msg.body.trim().toLowerCase();
      if (texto.startsWith('buenas bot')) {
        console.log(`🤖 Invocación detectada: ${msg.body}`);

         // Crear objeto Avro
          const message = { id: msg.from, text: msg.body };
          const encodedValue = await registry.encode(schemaId, message);

          await producer.send({
            topic: 'whatsapp-in',
            messages: [{ value: encodedValue }]
          });
      }
    }
  });

  // MENSAJES SALIDA
  await consumer.subscribe({ topic: 'whatsapp-out' });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const { to, text } = JSON.parse(message.value.toString());
      await client.sendMessage(to, text);
      console.log(`✅ Respuesta enviada a ${to}: ${text}`);
    }
  });
}

start();


