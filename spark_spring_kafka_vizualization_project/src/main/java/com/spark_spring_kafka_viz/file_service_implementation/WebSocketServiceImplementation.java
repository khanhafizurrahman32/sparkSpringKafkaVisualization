package com.spark_spring_kafka_viz.file_service_implementation;

import com.spark_spring_kafka_viz.file_service_interface.WebSocketServiceInterface;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.simp.broker.BrokerAvailabilityEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONObject;
import org.json.JSONArray;


/**
 * Created by khanhafizurrahman on 13/6/18.
 */
@Service
public class WebSocketServiceImplementation implements WebSocketServiceInterface,ApplicationListener<BrokerAvailabilityEvent> {

    private final MessageSendingOperations<String> messagingTemplate;
    private AtomicBoolean brokerAvailable = new AtomicBoolean();

    @Autowired
    public WebSocketServiceImplementation(MessageSendingOperations<String> messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
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
        ArrayList<String> consumeMessagesValueList = new ArrayList<String>();
        while(true) {
            final ConsumerRecords<Long, String> consumerRecords = consumer.poll(50);
            for (ConsumerRecord record: consumerRecords){
                //JSONObject jsonObj = new JSONObject(record.value().toString());
                consumeMessagesValueList.add(record.value().toString());
                if(consumeMessagesValueList.size() % 50 == 0){
                    JSONArray jsarr = new JSONArray(consumeMessagesValueList);
                    System.out.printf("Consumer Record: (%s, %s, %d, %d)\n", record.key(), record.value(), record.partition(), record.offset());
                    System.out.println(consumeMessagesValueList.size());
                    try {
                        Thread.sleep(3000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    //this.messagingTemplate.convertAndSend("/topic/kafkaMessages", jsarr);
                    this.messagingTemplate.convertAndSend("/topic/kafkaMessages", consumeMessagesValueList);
                    consumeMessagesValueList = new ArrayList<String>();
                }
            }
            consumer.commitAsync();
        }

    }
    @Override
    public void consumeFinalKafkaMessage(String topic, String bootstrap_servers) {
        runFinalKafkaConsumer(topic, bootstrap_servers);
    }

    @Override
    public void onApplicationEvent(BrokerAvailabilityEvent brokerAvailabilityEvent) {

    }
}
