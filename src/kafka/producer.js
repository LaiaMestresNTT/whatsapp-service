async function sendAvroMessage(producer, registry, schemaId, topic, payload) {
  try {
    const encodedValue = await registry.encode(schemaId, payload);
    await producer.send({
      topic,
      messages: [{ value: encodedValue }]
    });
    console.log(`✅ 📤  Mensaje Avro enviado al topic ${topic}`);
  } catch (err) {
    console.error(`❌ 📤  Error enviando mensaje Avro al topic ${topic}:`, err);
  }
}

module.exports = { sendAvroMessage };
