from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

spark = SparkSession \
    .builder \
    .appName('csv01') \
    .master('local[*]') \
    .getOrCreate()

spark.conf.set("spark.sql.streaming.checkpointLocation", "/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/checkPoint")
userSchema = StructType().add("name", "string").add("age", "integer")


df = spark \
    .readStream \
    .schema(userSchema) \
    .option("sep",",") \
    .csv("/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/kafkaStreamAnalysis/csvInput")

df.printSchema()

"""df.writeStream \
    .format("console") \
    .option("truncate", "false") \
    .start() \
    .awaitTermination()"""

"""df.writeStream \
    .format("csv") \
    .option("path", "/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/kafkaStreamAnalysis/csvOutput") \
    .start() \
    .awaitTermination()"""

df \
  .selectExpr("CAST(Name AS STRING) AS key", "to_json(struct(*)) AS value") \
  .writeStream \
  .format("kafka") \
  .option("kafka.bootstrap.servers", "localhost:9092") \
  .option("topic", "topic1") \
  .start() \
  .awaitTermination()