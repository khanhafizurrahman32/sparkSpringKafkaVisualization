package io.kafka_spark_stream_visualization.service_interface;

import io.kafka_spark_stream_visualization.POJO.FileDescription;
import java.util.ArrayList;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */
public interface FileServiceInterface {
    ArrayList<FileDescription> findAll();
}

