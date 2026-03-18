async function startConsumer(consumer, client, registry) {
  try {
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const decoded = await registry.decode(message.value);
          const userId = decoded.user_id;
          const text = decoded.message;

          await client.sendMessage(userId, text);

          console.log(`✅ 📩 Respuesta enviada a ${userId}: ${text}`);
        } catch (err) {
          console.error('❌ 📩 Error procesando mensaje del consumidor:', err);
        }
      }
    });
    console.log('✅ Consumer iniciado para whatsapp-out');
  } catch (err) {
    console.error('❌ Error iniciando consumer:', err);
  }
}

module.exports = { startConsumer };