package io.kafka_spark_stream_visualization.controller;

import io.kafka_spark_stream_visualization.POJO.FileDescription;
import io.kafka_spark_stream_visualization.service_interface.FileServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

/**
 * Created by khanhafizurrahman on 9/6/18.
 */
@RestController
public class project_rest_API_controller {
    /*private FileServiceInterface fileUploadService;

    @Autowired
    public project_rest_API_controller(FileServiceInterface fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @CrossOrigin
    @RequestMapping("/readAllFiles")
    public ArrayList<FileDescription> getAllFiles() {
        System.out.println("inside read All files");
        return fileUploadService.findAll();
    }*/

    @RequestMapping("/hello")
    public String sayHi(){
        return "hi";
    }
}
