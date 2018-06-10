package com.spark_spring_kafka_viz.file_service_implementation;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.spark_spring_kafka_viz.file_service_interface.DataAnalysisServiceInterface;
import com.spark_spring_kafka_viz.utilities.printOutput;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.stream.Stream;

import static com.spark_spring_kafka_viz.file_service_implementation.FileServiceImplementation.UPLOADED_FOLDER;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */
@Service
public class DataAnalysisServiceImplementation implements DataAnalysisServiceInterface {

    private static String kafka_broker_end_point = null;
    private static String csv_input_File = null;
    private static String csv_injest_topic = null;

    @Override
    public void startKafkaTerminalCommandsFromJava(String topicName, String outputTopicName) {
        String command_to_run = "sh /Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/FinalCode/KafkaStreamAnalysis/kafka_start.sh " + topicName + " " + outputTopicName;
        Runtime rt = Runtime.getRuntime();
        printOutput outputMessage, errorReported;

        try {
            Process proc = rt.exec(command_to_run);
            errorReported = getStreamWrapper(proc.getErrorStream(), "ERROR");
            outputMessage = getStreamWrapper(proc.getInputStream(), "OUTPUT");
            errorReported.start();
            outputMessage.start();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private printOutput getStreamWrapper(InputStream is, String type){
        return  new printOutput(is, type);
    }

    public void sendDataToKafkaTopic(Map<String, String> parameters) {
        kafka_broker_end_point = parameters.get("kafka_broker_end_point");
        csv_input_File = parameters.get("csv_input_file");
        csv_input_File = UPLOADED_FOLDER + csv_input_File;
        System.out.println(csv_input_File);
        csv_injest_topic = parameters.get("topic_name");
        publishCSVFileData();
    }

    private Producer<String,String> createKafkaProducer() {
        Properties prop = new Properties();
        prop.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka_broker_end_point);
        prop.setProperty(ProducerConfig.CLIENT_ID_CONFIG, "csvDataKafkaProducer");
        prop.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        prop.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        return new KafkaProducer<String, String>(prop);
    }

    private void publishCSVFileData() {
        final Producer<String, String> csv_data_producer = createKafkaProducer();
        final CountDownLatch countDownLatch = new CountDownLatch(1);
        ObjectNode lineNode = JsonNodeFactory.instance.objectNode();

        try {
            Stream<String> csv_data_File_Stream = Files.lines(Paths.get(csv_input_File)).skip(1);
            long start = System.currentTimeMillis();
            csv_data_File_Stream.forEach(line -> {
                String [] parts_by_parts = line.split(",");

                lineNode.put("sepal_length_in_cm", Float.parseFloat(parts_by_parts [0]));
                lineNode.put("sepal_width_in_cm", Float.parseFloat(parts_by_parts[1]));
                lineNode.put("petal_length_in_cm", Float.parseFloat(parts_by_parts[2]));
                lineNode.put("petal_width_in_cm", Float.parseFloat(parts_by_parts[3]));
                lineNode.put("class", parts_by_parts[4]);
                lineNode.put("emni", "dummyClass");
                final ProducerRecord<String, String> csv_record =
                        new ProducerRecord<String, String>(csv_injest_topic, UUID.randomUUID().toString(), lineNode.toString());

                try {
                    Thread.currentThread().sleep(0, 1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                csv_data_producer.send(csv_record, ((metadata, exception) -> {
                    if (metadata != null){
                        System.out.println("Data Sent --> " + csv_record.key() + " | " + csv_record.value() + " | " + metadata.partition());
                    } else {
                        System.out.println("Error Sending Data Event --> " + csv_record.value());
                    }
                }));
            });

            long end = System. currentTimeMillis();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    @Override
    public void submitPysparkProjectTerminalCommand(Map<String, String> parameters) {
        String app_name = parameters.get("app_name");
        String master_server = parameters.get("master_server");
        String kafka_bootstrap_server = parameters.get("kafka_bootstrap_server");
        String subscribe_topic = parameters.get("subscribe_topic");
        String subscribe_output_topic = parameters.get("subscribe_output_topic");
        System.out.println("inside submitPysparkProjectTerminalCommand");
        System.out.println(app_name + '\t' +  master_server + '\t' + kafka_bootstrap_server + '\t' + subscribe_topic + '\t' + subscribe_output_topic);

        String command_to_run = "sh /Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/FinalCode/KafkaStreamAnalysis/spark_start.sh "
                + app_name + " "
                + master_server + " "
                + kafka_bootstrap_server + " "
                + subscribe_topic + " "
                + subscribe_output_topic;

        Runtime rt = Runtime.getRuntime();
        printOutput outputMessage, errorReported;

        try {
            Process proc = rt.exec(command_to_run);
            errorReported = getStreamWrapper(proc.getErrorStream(), "ERROR");
            outputMessage = getStreamWrapper(proc.getInputStream(), "OUTPUT");
            errorReported.start();
            outputMessage.start();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private Properties configurFinalKafkaConsumerProperties(String bootstrap_servers) {
        final Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap_servers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "kafkaExampleConsumer"); // check whether it has dependency on producers group id config
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        return props;
    }

    private Consumer<Long, String> createFinalKafkaConsumer(String topic, String bootstrap_servers){
        final Properties props = configurFinalKafkaConsumerProperties(bootstrap_servers);
        final Consumer<Long, String> consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Collections.singletonList(topic));
        return consumer;
    }

    private void runFinalKafkaConsumer(String topic, String bootstrap_servers) {
        final Consumer<Long, String> consumer = createFinalKafkaConsumer(topic, bootstrap_servers);
        final int giveUp = 100; int noRecordsCount = 0;

        while(true) {
            final ConsumerRecords<Long, String> consumerRecords = consumer.poll(10);


            consumerRecords.forEach(record -> {
                System.out.printf("Consumer Record: (%s, %s, %d, %d)\n", record.key(), record.value(), record.partition(), record.offset());
            });

            consumer.commitAsync();
        }
    }
    @Override
    public void consumeFinalKafkaMessage(String topic, String bootstrap_servers) {
        runFinalKafkaConsumer(topic, bootstrap_servers);
    }
}
