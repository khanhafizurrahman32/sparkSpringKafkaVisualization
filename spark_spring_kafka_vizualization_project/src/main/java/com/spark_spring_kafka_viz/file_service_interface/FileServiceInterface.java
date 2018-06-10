package com.spark_spring_kafka_viz.file_service_interface;

import com.spark_spring_kafka_viz.POJO.FileDescription;
import com.spark_spring_kafka_viz.POJO.ResponseMetaData;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */
public interface FileServiceInterface {
    ArrayList<FileDescription> findAll();
    ResponseMetaData save (MultipartFile multipartFile) throws IOException;
    String getHeadersName(String inputFilePath);
}
