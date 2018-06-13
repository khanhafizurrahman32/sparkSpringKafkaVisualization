from pyspark.sql import SparkSession

spark = SparkSession \
    .builder \
    .appName("StructuredNetworkWordCount") \
    .master("local") \
    .getOrCreate()


df = spark \
  .readStream \
  .format("kafka") \
  .option("kafka.bootstrap.servers", "localhost:9092") \
  .option("subscribe", "irisDataSetTopic") \
 .option("startingOffsets", "earliest") \
 .load()
df.selectExpr("CAST(value AS STRING)")

df = df.select('value')

query = df \
    .writeStream \
    .format("console") \
    .option("truncate","false") \
    .start()

query.awaitTermination()
