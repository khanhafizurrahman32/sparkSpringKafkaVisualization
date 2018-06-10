package com.spark_spring_kafka_viz.web;

import com.spark_spring_kafka_viz.POJO.FileDescription;
import com.spark_spring_kafka_viz.POJO.ResponseMetaData;
import com.spark_spring_kafka_viz.file_service_interface.DataAnalysisServiceInterface;
import com.spark_spring_kafka_viz.file_service_interface.FileServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */
@RestController
@RequestMapping(value = "/api")
public class spark_spring_kafka_viz_controller {

    private FileServiceInterface fileService;
    private DataAnalysisServiceInterface dataAnalysisService;

     @Autowired
     public spark_spring_kafka_viz_controller(FileServiceInterface fileService, DataAnalysisServiceInterface dataAnalysisService) {
         this.fileService = fileService;
         this.dataAnalysisService = dataAnalysisService;
     }

     @CrossOrigin
     @RequestMapping("/readAllFiles")
     public ArrayList<FileDescription> getAllFiles() {
         System.out.println("inside read All files");
         return fileService.findAll();
     }

    @CrossOrigin
    @RequestMapping(value = "/toaFixedPlace", method = RequestMethod.POST )
    public @ResponseBody ResponseMetaData handleFileUpload(@RequestParam(value="file") MultipartFile multipartFile) throws IOException {
        return fileService.save(multipartFile);
    }

    @CrossOrigin
    @RequestMapping("/startKafkaCommandShell")
    public void commandKafkaShellStart(@RequestParam Map<String, String> parameters) {
        String topicName = parameters.get("topicName");
        String outputTopicName = parameters.get("outputTopicName");
        System.out.println(topicName);
        System.out.println(outputTopicName);
        dataAnalysisService.startKafkaTerminalCommandsFromJava(topicName, outputTopicName);
    }

    @CrossOrigin
    @RequestMapping("/sendDatatoKafka")
    public void sendData(@RequestParam Map<String, String> parameters) {

        System.out.println(parameters.get("kafka_broker_end_point"));
        System.out.println(parameters.get("csv_input_file"));
        System.out.println(parameters.get("topic_name"));
        dataAnalysisService.sendDataToKafkaTopic(parameters);
    }

    @CrossOrigin
    @RequestMapping("/startPythonCommandShell")
    public void commandSparkCreate(@RequestParam Map<String, String> parameters) {
        dataAnalysisService.submitPysparkProjectTerminalCommand(parameters);
    }

    @CrossOrigin
    @RequestMapping("/getHeadersOfaFile")
    public String getHeadersList(@RequestParam(value="inputFilePath") String inputFilePath) {
        return fileService.getHeadersName(inputFilePath);
    }

    @MessageMapping("/checkContinuosData")
    @SendTo("/topic/kafkaMessages")
    public void sentFinalKafkaMessagetoFrontEnd(String topic, String bootstrap_servers) {
         dataAnalysisService.consumeFinalKafkaMessage(topic, bootstrap_servers);
    }
}
