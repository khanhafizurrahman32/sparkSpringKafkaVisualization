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

# option("startingOffsets", "earliest") option allow to read data from the beginning otherwise we can only view data when we submit after application starts...
def createInitialDataFrame(spark, kafka_bootstrap_server, subscribe_topic):
    df = spark \
        .readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", kafka_bootstrap_server) \
        .option("subscribe", subscribe_topic) \
        .option("startingOffsets", "earliest") \
        .load()
    return df

def inputSchema2(fieldNameList, fieldTypeList):
    schema = StructType()
    j = 0
    for i in fieldNameList:
        schema = schema.add(fieldNameList[j], fieldTypeList[j])
        j = j + 1
    return schema


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

# In Lda, we found the variance using eigen vectors and choose the best among those variances
def outputOfFLDAAlgorithm(X,G):
    eigen_val_of_G, eigen_vec_of_G = np.linalg.eig(G)
    print(eigen_val_of_G)
    Y = np.dot(X,eigen_vec_of_G)
    return Y

def renameCols(df, output_df):
    input_cols = list(df)
    output_cols = list(output_df)
    i = 0
    for x in output_cols:
        output_df.rename(columns={x: input_cols[i]}, inplace=True)
        i = i + 1
    return output_df

def arrangeDatasets(df, output_df):
    input_cols = list(df)
    output_cols = list(output_df)
    remaining_cols = list(set(input_cols) - set(output_cols))
    for x in remaining_cols:
        output_df[x] = 0
    return output_df

def dimensionality_reduction(inputSchema_output):
    @pandas_udf(inputSchema_output, functionType=PandasUDFType.GROUPED_MAP)
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
        print 'ddd'
        sklearn_lda = LDA()
        X_lda_sklearn = sklearn_lda.fit_transform(X,y)
        X_lda_sklearn_df = DataFrame(X_lda_sklearn) # pandas.core.frame.DataFrame
        print(list(X_lda_sklearn_df))
        output_df = renameCols(df,X_lda_sklearn_df)
        print(list(output_df))
        output_df = arrangeDatasets(df,output_df) 
        return output_df
    return traditional_LDA

def dimensionality_reduction_FLDA(inputSchema_output):
    @pandas_udf(inputSchema_output, functionType=PandasUDFType.GROUPED_MAP)
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
        output_of_alg = outputOfFLDAAlgorithm(feature_data, G)
        return output_of_alg
    return flda

def writeStream(df3):
    df3.writeStream \
        .format("console") \
        .option("truncate","false") \
        .start() \
        .awaitTermination()

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

def kafkaAnalysisProcess(appName,master_server,kafka_bootstrap_server,subscribe_topic,schema):
    spark = createSparkSession(appName,master_server)
    spark.conf.set("spark.sql.streaming.checkpointLocation", "/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/checkPoint/test_writeStream_to_kafka")
    df = createInitialDataFrame(spark, kafka_bootstrap_server, subscribe_topic)
    df = df.selectExpr("CAST(value AS STRING)")
    df1 = df.select(from_json(df.value, schema).alias("json"))
    df2 = df1.select('json.*')
    traditional_LDA = dimensionality_reduction(schema)
    df3 = df2.groupby("emni").apply(traditional_LDA)
    df3_sub = df3.selectExpr("CAST(sepal_length_in_cm AS STRING) AS key","to_json(struct(*)) AS value")
    #df4 = df2.groupby("emni").apply(flda)
    return df3_sub # should be df3, df4

if __name__ == '__main__':
    appName = str(sys.argv[1])
    master_server = str(sys.argv[2])
    kafka_bootstrap_server = str(sys.argv[3])
    subscribe_topic = str(sys.argv[4])
    subscribe_output_topic = str(sys.argv[5])
    fieldNameListNameAsString = str(sys.argv[6])
    fieldNames = map(str,fieldNameListNameAsString.strip('[]').split(','))
    fieldNameList = []
    for i in fieldNames:
        fieldNameList.append(i.replace("\"","")) 
    fieldTypeListNameAsString = str(sys.argv[7])
    fieldTypes = map(str,fieldTypeListNameAsString.strip('[]').split(','))
    fieldTypeList = []
    for i in fieldTypes:
        fieldTypeList.append(i.replace("\"",""))
    schema = inputSchema2(fieldNameList, fieldTypeList)
    #write_to_console_df,write_to_kafka_df = kafkaAnalysisProcess(appName,master_server,kafka_bootstrap_server,subscribe_topic)
    write_to_console_df = kafkaAnalysisProcess(appName,master_server,kafka_bootstrap_server,subscribe_topic, schema)
    columns_of_the_schema = write_to_console_df.columns
    for column in columns_of_the_schema:
        pass
    test_writeStream_to_kafka(testDataFrame = write_to_console_df, kafka_bootstrap_server = kafka_bootstrap_server, output_topic = subscribe_output_topic)
    #writeStream(df3= write_to_console_df)
    #writeStreamtoKafka(df3= write_to_console_df, output_topic= subscribe_output_topic) # value of df3 will be changed to write_to_kafka_df
