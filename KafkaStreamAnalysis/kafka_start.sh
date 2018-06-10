#!/bin/bash

PIDS=$(ps ax | grep -i 'kafka\.Kafka')

if [ -z "$PIDS" ]; then
  echo "No kafka server to stop"
else
  kill SIGTERM $PIDS
fi

PIDS_bootstrap=$(ps ax | grep -i 'zookeeper')


if [ -z "$PIDS_bootstrap" ]; then
  echo "No zookeeper to stop"
else
  kill SIGTERM $PIDS_bootstrap
fi

echo $KAFKA_HOME
echo "now in kafka home"
/Users/khanhafizurrahman/kafka_2.11-1.0.0/bin/zookeeper-server-start.sh /Users/khanhafizurrahman/kafka_2.11-1.0.0/config/zookeeper.properties & 
sleep 10
echo "zookeeper started"
/Users/khanhafizurrahman/kafka_2.11-1.0.0/bin/kafka-server-start.sh /Users/khanhafizurrahman/kafka_2.11-1.0.0/config/server.properties &
sleep 10
echo "kafka server started"
/Users/khanhafizurrahman/kafka_2.11-1.0.0/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic $1
/Users/khanhafizurrahman/kafka_2.11-1.0.0/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic $2
echo "topic created"

