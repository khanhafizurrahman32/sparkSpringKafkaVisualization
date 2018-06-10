package com.spark_spring_kafka_viz.POJO;



/**
 * Created by khanhafizurrahman on 10/6/18.
 */


public class FileDescription {

    private Long id;
    private String fileName;
    private byte[] file;

    public FileDescription() {
    }

    public FileDescription(Long id, String fileName) {
        this.id = id;
        this.fileName = fileName;
    }

    public FileDescription(Long id, String fileName, byte[] file) {
        this.id = id;
        this.fileName = fileName;
        this.file = file;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public byte[] getFile() {
        return file;
    }

    public void setFile(byte[] file) {
        this.file = file;
    }
}
