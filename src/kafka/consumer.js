async function startConsumer(consumer, client) {
  try {
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const { to, text } = JSON.parse(message.value.toString());
          await client.sendMessage(to, text);
          console.log(`✅ 📩  Respuesta enviada a ${to}: ${text}`);
        } catch (err) {
          console.error('❌ 📩  Error procesando mensaje del consumidor:', err);
        }
      }
    });
    console.log('✅ Consumer iniciado para whatsapp-out');
  } catch (err) {
    console.error('❌ Error iniciando consumer:', err);
  }
}

module.exports = { startConsumer };
