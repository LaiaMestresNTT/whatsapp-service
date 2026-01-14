#!/bin/bash

# Esperar a que Kafka Connect esté listo (puerto 8083)
echo "⏳ Esperando a que Kafka Connect arranque en http://connect:8083..."
while ! curl -s http://connect:8083/connector-plugins > /dev/null; do
  sleep 5
done

# Comprobar si el conector ya existe para no duplicarlo
if curl -s http://connect:8083/connectors | grep -q "mongo-sink-whatsapp"; then
  echo "✅ El conector mongo-sink-whatsapp ya está configurado."
else
  echo "🚀 Configurando el conector de MongoDB..."
  curl -X POST http://connect:8083/connectors \
    -H "Content-Type: application/json" \
    -d '{
      "name": "mongo-sink-whatsapp",
      "config": {
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
    }'
  echo "✅ Conector configurado con éxito."
fi