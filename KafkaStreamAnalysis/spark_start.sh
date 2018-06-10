#!/bin/sh

echo $1
echo $2
echo $3
echo $4
echo $5
/Users/khanhafizurrahman/server/spark-2.3.0-bin-hadoop2.7/bin/spark-submit --master local[*] --packages org.apache.spark:spark-sql-kafka-0-10_2.11:2.3.0,org.apache.kafka:kafka-clients:1.0.0 /Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/kafkaStreamAnalysis/sparkStreamingProject/index.py $1 $2 $3 $4 $5
