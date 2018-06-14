package com.spark_spring_kafka_viz.file_service_implementation;

import com.spark_spring_kafka_viz.POJO.FileDescription;
import com.spark_spring_kafka_viz.POJO.ResponseMetaData;
import com.spark_spring_kafka_viz.file_service_interface.FileServiceInterface;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

    @Override
    public ResponseMetaData save(MultipartFile multipartFile) throws IOException {
        FileDescription individualFile = new FileDescription();
        individualFile.setFileName(multipartFile.getOriginalFilename());
        individualFile.setFile(multipartFile.getBytes());
        saveUploadedFiles(multipartFile);
        ResponseMetaData metaData = new ResponseMetaData();
        metaData.setMessage("success");
        metaData.setStatus(200);
        return metaData;
    }

    private void saveUploadedFiles(MultipartFile multipartFile) throws IOException{
        byte[] bytes = multipartFile.getBytes();
        Path path = Paths.get(UPLOADED_FOLDER + multipartFile.getOriginalFilename());
        Files.write(path, bytes);
    }

    @Override
    public String getHeadersName(String inputFilePath) {
        String absolutePath = UPLOADED_FOLDER + inputFilePath;
        List<String> headerNames = new ArrayList<String>();
        String headerNamesString = "";
        try {
            File inputF = new File(absolutePath);
            InputStream inputFS = new FileInputStream(inputF);
            BufferedReader br = new BufferedReader(new InputStreamReader(inputFS));

            headerNames = Stream.of(br.readLine()).map(line -> line.split(","))
                    .flatMap(Arrays:: stream).collect(Collectors.toList());

        } catch (Exception e) {
            // TODO: handle exception
        }
        for (String s : headerNames)
        {
            headerNamesString += s + ",";
        }
        return headerNamesString;
    }

    @Override
    public List<String> contentsInJson(String inputFilePath) {
        String absolutePath = UPLOADED_FOLDER + inputFilePath;
        List<String> fileContents = new ArrayList<String>();
        try {
            Stream<String> csv_data_File_Stream = Files.lines(Paths.get(absolutePath)).skip(1);
            fileContents = csv_data_File_Stream.collect(Collectors.toList());
            fileContents.forEach(System.out::println);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return fileContents;
    }


}
