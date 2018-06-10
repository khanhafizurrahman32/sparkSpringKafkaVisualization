package io.kafka_spark_stream_visualization.POJO;

import javax.persistence.*;

/**
 * Created by khanhafizurrahman on 10/6/18.
 */

@Entity
public class FileDescription {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column
    private String fileName;
    @Column
    @Lob
    private byte[] file;

    public FileDescription() {
    }

    public FileDescription(Long id, String fileName) {
        this.id = id;
        this.fileName = fileName;
    }

    public FileDescription(Long id,String fileName, byte[] file) {
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
