package com.spark_spring_kafka_viz.file_service_interface;

import java.util.Map;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */
public interface DataAnalysisServiceInterface {
    void startKafkaTerminalCommandsFromJava(String topicName, String outputTopicName);
    void sendDataToKafkaTopic(Map<String, String> parameters);
    void submitPysparkProjectTerminalCommand(Map<String, String> parameters);
}
