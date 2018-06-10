package io.kafka_spark_stream_visualization.service_implementation;

import io.kafka_spark_stream_visualization.POJO.FileDescription;
import io.kafka_spark_stream_visualization.service_interface.FileServiceInterface;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */

@Service
public class FileServiceImplementation implements FileServiceInterface {

    final static String UPLOADED_FOLDER = "/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/UploadFiles/";

    @Override
    public ArrayList<FileDescription> findAll() {
        File folder = new File (UPLOADED_FOLDER);
        File[] listOfFiles = folder.listFiles();
        ArrayList<FileDescription>  ListOfFilesInDirectory = new ArrayList <FileDescription> ();
        for (int i= 0; i < listOfFiles.length; i++) {
            System.out.println(listOfFiles[i].getName());
            FileDescription detailsOfFile = new FileDescription((long) i,listOfFiles[i].getName());
            ListOfFilesInDirectory.add(detailsOfFile);
        }
        return ListOfFilesInDirectory;
    }
}
