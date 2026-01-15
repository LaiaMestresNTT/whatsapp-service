const axios = require('axios');

async function setupConnect() {
  const CONNECT_URL = 'http://connect:8083/connectors';
  const CONNECTOR_NAME = 'mongo-sink-whatsapp';

  const connectorConfig = {
    name: CONNECTOR_NAME,
    config: {
      "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
      "tasks.max": "1",
      "topics": "whatsapp-in",
      "connection.uri": "mongodb://mongodb_container:27017/?replicaSet=rs0",
      "database": "whatsapp_db",
      "collection": "historial_mensajes",
      "key.converter": "org.apache.kafka.connect.storage.StringConverter",
      "value.converter": "io.confluent.connect.avro.AvroConverter",
      "value.converter.schema.registry.url": "http://schema-registry:8081",
      "value.converter.enhanced.avro.schema.support": "true",
      "document.id.strategy": "com.mongodb.kafka.connect.sink.processor.id.strategy.PartialValueStrategy",
      "document.id.strategy.partial.value.projection.type": "allowlist",
      "document.id.strategy.partial.value.projection.list": "id",
      "writemodel.strategy": "com.mongodb.kafka.connect.sink.writemodel.strategy.ReplaceOneBusinessKeyStrategy"
    }
  };

  console.log(`⏳ Verificando Kafka Connect en ${CONNECT_URL}...`);

  // Reintento simple por si Connect tarda en arrancar
  for (let i = 0; i < 10; i++) {
    try {
      const resp = await axios.get(CONNECT_URL);
      const connectors = resp.data;

      if (connectors.includes(CONNECTOR_NAME)) {
        console.log(`✅ Kafka Connector "${CONNECTOR_NAME}" ya está configurado.`);
        return;
      }

      await axios.post(CONNECT_URL, connectorConfig);
      console.log(`🚀 Kafka Connector "${CONNECTOR_NAME}" configurado con éxito.`);
      return;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log(`✅ El conector "${CONNECTOR_NAME}" ya se estaba creando.`);
        return;
      }
      if (error.code === 'ECONNREFUSED' || (error.response && error.response.status === 404)) {
        console.log(`...esperando a Kafka Connect (${i + 1}/10)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('❌ Error configurando Kafka Connect:', error.message);
        break;
      }
    }
  }
}

module.exports = setupConnect;