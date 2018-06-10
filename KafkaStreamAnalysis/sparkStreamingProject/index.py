from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.functions import pandas_udf, PandasUDFType
from pyspark.sql.types import *
import sys
from pandas import DataFrame, concat
import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.preprocessing import LabelEncoder


def createSparkSession(appName,master_server):
    spark = SparkSession \
        .builder \
        .appName(appName) \
        .master(master_server) \
        .getOrCreate()

    return spark

def createInitialDataFrame(spark, kafka_bootstrap_server, subscribe_topic):
    df = spark \
        .readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", kafka_bootstrap_server) \
        .option("subscribe", subscribe_topic) \
        .load()
    return df

def inputSchema():
    schema = StructType([
        StructField("sepal_length_in_cm", DoubleType()), \
        StructField("sepal_width_in_cm", DoubleType()), \
        StructField("petal_length_in_cm", DoubleType()), \
        StructField("petal_width_in_cm", DoubleType()), \
        StructField("class", StringType()), \
        StructField("emni", StringType())
    ])
    return schema

def outputSchema():
    output_schema = StructType([
    #StructField("class", StringType()),
    StructField("mean_sepal_length", DoubleType()),
    StructField("mean_sepal_width", DoubleType()),
    StructField("mean_petal_length", DoubleType()),
    StructField("mean_petal_width", DoubleType()),
    ])

    return output_schema

def outputOfScikitLearnSchema():
    output_of_scikit_learn = StructType([
        StructField("c1", DoubleType()),
        StructField("c2", DoubleType()),
    ])
    return output_of_scikit_learn

def outputKafkaSchema():
    output_kafka_schema = StructType([
        StructField("key", StringType()),
        StructField("value", StringType())
    ])
    return output_kafka_schema

def outputAsJson(pd_df):
    json_string = pd_df.to_json(path_or_buf='/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/kafkaStreamAnalysis/output_json/test2.json',orient= 'split')

def getMean(X, XLabel):
    CLabel = np.unique(XLabel)
    mean_vectors = np.zeros((X.shape[0],len(CLabel)))
    k = 0
    for i in(CLabel):
        loc=(XLabel == i).nonzero()[1] # at [0] gives value, [1] gives position
        mean_value = np.mean(X[:,loc],axis=1).reshape(-1,1) # axis 1 because it is equivalent in matlab mean(X,2)
                                                            # reshape to make it column vector
        mean_vectors[:,k] = mean_value.flatten()  # flatten need to make it one dimensional array
        k = k +1
    return mean_vectors,CLabel


def FLDA_Cholesky(feature_data,feature_label_data):
    C, CLabel = getMean(feature_data, feature_label_data)
    L = np.dot(C.T,C)
    R = np.linalg.cholesky(L).T # T to make equivalent to matlab code
    R_Inv = np.linalg.inv(R)
    Q = np.dot(C,R_Inv)
    G = np.dot(Q,R_Inv.T)
    return G,Q,C

output_of_scikit_learn = outputOfScikitLearnSchema()

@pandas_udf(output_of_scikit_learn, functionType=PandasUDFType.GROUPED_MAP)
def traditional_LDA(df):
    X1 = DataFrame(df['sepal_length_in_cm'])
    X2 = DataFrame(df['sepal_width_in_cm'])
    X3 = DataFrame(df['petal_length_in_cm'])
    X4 = DataFrame(df['petal_width_in_cm'])
    Y = DataFrame(df['class'])
    y = np.ravel(Y.values)
    enc = LabelEncoder()
    label_encoder = enc.fit(y)
    y = label_encoder.transform(y) + 1
    X = concat([X1, X2, X3, X4], axis=1, ignore_index=True)
    sklearn_lda = LDA()
    X_lda_sklearn = sklearn_lda.fit_transform(X,y)
    X_lda_sklearn_df = DataFrame(X_lda_sklearn) # pandas.core.frame.DataFrame
    outputAsJson(X_lda_sklearn_df)
    return X_lda_sklearn_df

@pandas_udf(output_of_scikit_learn, functionType=PandasUDFType.GROUPED_MAP)
def flda(df):
    X1 = DataFrame(df['sepal_length_in_cm'])
    X2 = DataFrame(df['sepal_width_in_cm'])
    X3 = DataFrame(df['petal_length_in_cm'])
    X4 = DataFrame(df['petal_width_in_cm'])
    feature_data = concat([X1, X2, X3, X4], axis=1, ignore_index=True)
    feature_data = feature_data.values
    feature_data = feature_data.T
    feature_label_data = np.ravel((df['class']))
    feature_label_data = feature_label_data.T
    G, Q, C = FLDA_Cholesky(feature_data, feature_label_data)
    return G,Q,C

output_kafka_schema = outputKafkaSchema()

@pandas_udf(output_kafka_schema, functionType=PandasUDFType.GROUPED_MAP)
def testLDA(df):
    return df

def writeStream(df3):
    df3.writeStream \
        .format("console") \
        .option("truncate","false") \
        .start() \
        .awaitTermination()

def writeStreamtoKafka(df3, output_topic):
    df3 \
        .writeStream \
        .format("kafka") \
        .option("checkpointLocation", "/Users/khanhafizurrahman/Desktop/Thesis/code/checkpoint_Loc") \
        .option("kafka.bootstrap.servers", "127.0.0.1:9092") \
        .option("topic", output_topic) \
        .start() 

def test_writeStream_to_kafka(testDataFrame, kafka_bootstrap_server, output_topic):
    testDataFrame.printSchema()
    print(output_topic)
    query = testDataFrame \
        .writeStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("topic", output_topic) \
        .start() \
        .awaitTermination()

def test_writeStream_to_csv(testDataFrame):
    testDataFrame \
        .writeStream \
        .option("path", "./csv/a") \
        .option("checkpointLocation", "./tmp") \
        .format("csv") \
        .start()

def kafkaAnalysisProcess(appName,master_server,kafka_bootstrap_server,subscribe_topic):
    spark = createSparkSession(appName,master_server)
    spark.conf.set("spark.sql.streaming.checkpointLocation", "/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/checkPoint/test_writeStream_to_kafka")
    df = createInitialDataFrame(spark, kafka_bootstrap_server, subscribe_topic)
    df = df.selectExpr("CAST(value AS STRING)")
    schema = inputSchema()
    df1 = df.select(from_json(df.value, schema).alias("json"))
    df2 = df1.select('json.*')
    df2_sub = df2.selectExpr("CAST(sepal_length_in_cm AS STRING) AS key","to_json(struct(*)) AS value")
    #df2_sub_val = df2_sub.select('value') # only print the value of df2_sub
    df3 = df2.groupby("emni").apply(traditional_LDA)
    df4 = df2.groupby("emni").apply(flda)
    return df2_sub, df4 # should be df3, df4



if __name__ == '__main__':
    appName = str(sys.argv[1])
    master_server = str(sys.argv[2])
    kafka_bootstrap_server = str(sys.argv[3])
    subscribe_topic = str(sys.argv[4])
    subscribe_output_topic = str(sys.argv[5])
    write_to_console_df,write_to_kafka_df = kafkaAnalysisProcess(appName,master_server,kafka_bootstrap_server,subscribe_topic)
    columns_of_the_schema = write_to_console_df.columns
    for column in columns_of_the_schema:
        pass

    #test_writeStream_to_csv(testDataFrame = write_to_console_df)
    test_writeStream_to_kafka(testDataFrame = write_to_console_df, kafka_bootstrap_server = kafka_bootstrap_server, output_topic = subscribe_output_topic)
    #writeStream(df3= write_to_console_df)
    #writeStreamtoKafka(df3= write_to_console_df, output_topic= subscribe_output_topic) # value of df3 will be changed to write_to_kafka_df
