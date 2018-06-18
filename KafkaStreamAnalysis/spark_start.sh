#!/bin/sh

/Users/khanhafizurrahman/server/spark-2.3.0-bin-hadoop2.7/bin/spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.11:2.3.0,org.apache.kafka:kafka-clients:1.0.0 /Users/khanhafizurrahman/Desktop/ThesisFinalCode/KafkaStreamAnalysis/src/index.py $1 $2 $3 $4 $5 $6 $7
