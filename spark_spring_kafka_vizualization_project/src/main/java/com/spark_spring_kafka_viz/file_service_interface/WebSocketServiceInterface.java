package com.spark_spring_kafka_viz.file_service_interface;

/**
 * Created by khanhafizurrahman on 12/6/18.
 */
public interface WebSocketServiceInterface {
    void consumeFinalKafkaMessage(String topic, String bootstrap_servers);
}
