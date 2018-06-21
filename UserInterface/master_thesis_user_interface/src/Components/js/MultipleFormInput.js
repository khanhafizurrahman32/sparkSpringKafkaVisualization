import React, { Component } from 'react';
import $ from 'jquery';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js/dist/plotly';

let stompClient;
class MultipleFormInput extends Component {
  constructor(props){
    super(props);
    this.state = {
      select_datasets:'',
      vizualization_method:'',
      topic_name:'',
      topic_output_name:'',
      receiveValues: [], // state: DataSetSelection
      selectedDataSet: '', // state: DataSetSelection
      selectedOption: '',
      reduced_drawing_data_state: [],
      reduced_drawing_layout_state: {width: 500, height: 500},
      stompClient: '',
      headerFiles :'',
      fieldTypes:'',
      currentFileTobProcessed: '',
      ContentsInJsonArray: [],
      drawingData_state: [],
      drawingLayout_state: {width: 500, height: 500,}
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.createTopic = this.createTopic.bind(this);
    this.sendDatatoTopic = this.sendDatatoTopic.bind(this);
    this.startkafkasparkCommand = this.startkafkasparkCommand.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.visualization = this.visualization.bind(this);
    this.startPreprocessingFile = this.startPreprocessingFile.bind(this);
    this.getHeaderFiles = this.getHeaderFiles.bind(this);
    this.getContentsOfTheFiles = this.getContentsOfTheFiles.bind(this);
    this.startRawDataVisualization = this.startRawDataVisualization.bind(this);
  }

  startPreprocessingFile(){
    $.ajax({
      url: "http://localhost:8080/api/preprocessingFile",
      data: {'inputFilePath': this.state.select_datasets},
      dataType: 'text',
      success: function(data){
        console.log(data);
      },
      error: function(xhr, status, err){
        console.log(xhr, status, err);
      }
    })
  }

  getHeaderFiles(){
    $.ajax({
      url: "http://localhost:8080/api/getHeadersOfaFile",
      data: {'inputFilePath': this.state.select_datasets},
      dataType: 'json',
      success: function(data){
        console.log(data)
        this.setState({
          headerFiles : data[0],
          fieldTypes : data[1]
        })
      }.bind(this),
      error: function(xhr, status, err){
      }
    });
  }

  getContentsOfTheFiles(){
    $.ajax({
       url: "http://localhost:8080/api/startProcessingFile",
       data: {'inputFilePath': this.state.select_datasets},
       dataType: 'json',
       cache: 'false',
       success: function(data){
         var containsofTheFile = [];
         for (var i =0; i <data.length; i++){
           containsofTheFile.push(data[i]);
         }
         this.createJsonContainingHeader_n_Contents(this.state.headerFiles, containsofTheFile);
       }.bind(this),
       error: function(xhr, status, err){
       }
   });
  }

  createJsonContainingHeader_n_Contents(header_of_file,contents_of_file){
    //var headerList = header_of_file.split(',');
    var objArray = [];
    header_of_file.splice(-1,1);
  	for (var i =0; i< contents_of_file.length; i++){
  		var containFileList = contents_of_file[i].split(',');
  		var obj = {};
  		for (var j = 0; j < (header_of_file.length); j++){
  			obj[''+header_of_file[j]+''] = containFileList[j];
  		}
      objArray.push(obj);
      this.setState({ContentsInJsonArray: objArray});
	  } 
  }

  setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
  }

  connect(){
      var socket = new SockJS('http://localhost:8080/gs-guide-websocket');
      stompClient = Stomp.over(socket); // use different web socket other than browsers native websocket
      stompClient.connect({}, function (frame) {
          this.setConnected(true);
          console.log('Connected: ' + frame);
          // subscribe method returns id and unsubscribe method
          stompClient.subscribe('/topic/kafkaMessages', function (messageFromKafka) {
              let input_messages = new Array(messageFromKafka.body);
              let data_for_drawing = this.manipulateDataForDrawing(input_messages);
              this.drawGraph(data_for_drawing);
          }.bind(this));
      }.bind(this)); 
  }

  checkallElementsoofArrayEqualorNot(arr){
    return new Set(arr).size == 1
  }

  manipulateDataForDrawing(input_messages){
 
    let globalArray = [];
    let arr = [];
    let input_array = [];
    let input_array_json = []
    
    input_messages.forEach(function(elem){
      input_array.push(JSON.parse(elem));  
    })

    // input_array is a multi dimensional where external length is 1 and inner length is 50: inner length is
    // of type String thats why we convert each into object
    input_array.forEach(function(elem){
      elem.forEach(function(inner_elem){
        input_array_json.push(JSON.parse(inner_elem))
      })
    })

    let total_keys = Object.keys(input_array_json[0]).length
    
    // we try to have final array like this: column header_1:[], column header_2:[] therefore we first create
    // the inner array and push inner array into final array
    for (let i=0; i<total_keys; i++){
      input_array_json.forEach(function(elem){
        arr.push(elem[(Object.keys(input_array_json[0]))[i]]);
      })
      if(arr.length === 50){
        if (this.checkallElementsoofArrayEqualorNot(arr) != true)
          globalArray.push(arr); 
        arr = []
      }
    }

    console.log(globalArray);
    return globalArray;
  }

  disconnect(){
      console.log('disconnect');
      if (stompClient !== null) {
          stompClient.disconnect();
      }
      this.setConnected(false);
      console.log("Disconnected"); 
  }

  visualization(event){
      event.preventDefault();
      // body of STOMP message must be String
      var stompBody = {topic: this.state.topic_output_name, bootstrap_servers: '127.0.0.1:9092'}
      stompClient.send("/app/checkContinuosData", {}, JSON.stringify(stompBody)); //parameters: destination, headers, body
  }


  drawGraph(data_for_drawing){
    console.log('graph localization');
    console.log(data_for_drawing);
    var data;
    if (this.state.visualization_method === "heatmap"){
      data = [
        {
          z : [data_for_drawing[0], data_for_drawing[1]],
          type: this.state.visualization_method
        }
      ];
    }else {
      data = [{
        type: this.state.vizualization_method,
        x: data_for_drawing[0],
        y: data_for_drawing[1]
      }]
    }
    console.log(data); 
    var layout =  {width: 400, height: 500, title: 'Reduced Visualization'} 
    this.setState({reduced_drawing_data_state: data})
    this.setState({reduced_drawing_layout_state: layout})
  }

  handleInputChange(event) {
    const target = event.target;
    let value = '';
    if (target.type === 'radio') {
      value = target.value
    }else if (target.type === 'text') {
      value = target.value;
      let v = value + "_output"
      this.setState({topic_output_name: v})
   
    }else {
      value = target.value
    }
    const name = target.name

    this.setState(() => ({
      [name]: value,
    }));
  }

  createTopic(event){
    console.log(this.state.vizualization_method);  
    // need to set output topic into a state
    $.ajax({
      url: "http://localhost:8080/api/startKafkaCommandShell",
      cache: 'false',
      method: 'POST',
      data: {topicName: this.state.topic_name, outputTopicName: this.state.topic_output_name},
      success: function(data){
      }.bind(this),
      error: function(xhr, status, err){
      }.bind(this)
    });
  }

  sendDatatoTopic(event){
    console.log('send Data to Topic');
    event.preventDefault();
    this.sendDataToKafka();
  }

  sendDataToKafka(){
    console.log(this.state.select_datasets, this.state.topic_name, this.state.headerFiles, this.state.fieldTypes)
    $.ajax({
      url: "http://localhost:8080/api/sendDatatoKafka",
      cache: 'false',
      method: 'POST',
      data: {kafka_broker_end_point:'127.0.0.1:9092', 
             csv_input_file:this.state.select_datasets,
             topic_name: this.state.topic_name,
             fieldNameListNameAsString: this.state.headerFiles.join(),
             fieldTypeListNameAsString: this.state.fieldTypes.join()
            },
      success: function(data){
      }.bind(this),
      error: function(xhr, status, err){
      }.bind(this)
    });
  }

  startkafkasparkCommand(event){
    console.log('inside startkafkasparkCommand');
    event.preventDefault();
    this.sparkAnalysisStart();
  }

  sparkAnalysisStart(){
    console.log('sparkAnalysisStart');
    $.ajax({
      url: "http://localhost:8080/api/startPythonCommandShell",
      cache: 'false',
      method: 'POST',
      data: {app_name:'learning01', 
             master_server:'local[*]', 
             kafka_bootstrap_server: '127.0.0.1:9092', 
             subscribe_topic: this.state.topic_name,  
             subscribe_output_topic: this.state.topic_output_name,
             fieldNameListNameAsString: this.state.headerFiles.join(),
             fieldTypeListNameAsString: this.state.fieldTypes.join()},
      success: function(data){
      }.bind(this),
      error: function(xhr, status, err){
      }.bind(this)
    });
  }

  componentDidMount(){
    this.fetchDataFromDirectory();
  }


  fetchDataFromDirectory(){
    $.ajax({
      url: 'http://localhost:8080/api/readAllFiles',
      dataType: 'json',
      cache: 'false',
      success: function(data){
        let items = [];
        for (let i =0; i<data.length; i++){
          items.push(<option key={data[i].id} value={data[i].fileName}>{data[i].fileName}</option>);
        }
        this.setState({receiveValues: items}, function(){
        });
      }.bind(this),
      error: function(xhr, status, err){
        console.log('', status, err);
      }.bind(this)
    });
  }

  drawParallelCoordinates(visualization_method, classLabels_numeric, drawingVals){
    let return_vals = [];
    const dimensions_array = [];
    let header_names = this.state.headerFiles;
    for(let i = 0; i <drawingVals.length; i++){
      let obj = {
        range: [Math.floor(Math.min(...drawingVals[i])), Math.ceil(Math.max(...drawingVals[i]))],
        label: header_names[i],
        values: drawingVals[i]
      }
      dimensions_array.push(obj);
    }
    let data = [{
      type: visualization_method,
      pad: [80,80,80,80],
      line: {
        color: classLabels_numeric,
        colorscale: [[0,'red'], [0.5, 'green'], [1,'blue']]
      },

      dimensions: dimensions_array
    }];

    let layout = {
      width:500
    }

    return_vals.push(data, layout);
    return return_vals;    
  }

  unpackRows(rows, key){
    return rows.map(function(row){
      return row[key];
    });
  }

  startRawDataVisualization(){
    var objArray = this.state.ContentsInJsonArray;
    let fieldNamesArray = this.state.headerFiles;
    console.log(fieldNamesArray);
    let drawingVals = [];
    console.log(objArray);
    for (let i =0; i<fieldNamesArray.length; i++){
      
      drawingVals.push(this.unpackRows(objArray, fieldNamesArray[i]));
    }
    let classLabels = drawingVals.pop();
    var classLabels_unique = classLabels.filter((v,i,a) => a.indexOf(v) === i);
    let dict = {}
    for (let i =0; i<classLabels_unique.length ; i ++){
      dict [classLabels_unique[i]] = i + 1; 
    }
    console.log(classLabels_unique);
    console.log(dict)
    let classLabels_numeric = classLabels.map(function(element){
      return dict[element]
    })
    var visualization_method= this.state.vizualization_method;
    //console.log(classLabels);
    var colorScale = Plotly.d3.scale.ordinal().range(["#1f77b4","#ff7f0e","#2ca02c"]).domain(classLabels_unique);
    var arr= [];
    var data;
    var layout;
    while(arr.length < objArray.length){
      var colorValues = colorScale(objArray[arr.length]['class']);
      arr[arr.length] = colorValues;
    }
    if (visualization_method === "heatmap"){
      data = [{
        z: drawingVals,
        type: visualization_method
      }];
      layout= {width: 540, height: 450, title: 'Raw data ', 
                xaxis: {title: '', showgrid: false}, 
                yaxis: {title: '', showgrid: false}}
    } else if (visualization_method === "parcoords"){
      let response_vals = this.drawParallelCoordinates(visualization_method, classLabels_numeric, drawingVals);
      data = response_vals[0];
      layout = response_vals[1];
    }
    
    this.setState({drawingData_state: data});
    this.setState({drawingLayout_state: layout})
  }

  render() {

    return (
      <div>
        <div>
          <span className= "label label-primary"> DataSet Selection: </span> &nbsp; &nbsp;
          <select name="select_datasets" value={this.state.value} onChange={this.handleInputChange}>
            {this.state.receiveValues}
          </select>
          <br /> <br/>
          <button type="button" className= "btn btn-default" onClick={this.startPreprocessingFile}> Preprocessing Of The File </button> &nbsp; &nbsp;
          <button type="button" className= "btn btn-default" onClick={this.getHeaderFiles}> Schema Of The File </button> &nbsp; &nbsp;
          <button type="button" className= "btn btn-default" onClick={this.getContentsOfTheFiles}> Content Of The File </button> &nbsp; &nbsp;
        </div>
        <hr />
        <div>
          <span className= "label label-primary">Topic Configuration:</span> <br /> <br />
          <form className="form-inline">
            <label htmlFor="Name_of_the_topic">Topic Name:</label> &nbsp; &nbsp;
            <input type="text" name = "topic_name" placeholder="topic_name" onChange={this.handleInputChange} className="form-control"></input> &nbsp;
            <button type="button" onClick={this.createTopic} className= "btn btn-default"> Create Topic </button>
          </form>
          <br />
          <form className="form-inline">
            <label htmlFor="Send_Data_to_topic">Send Data:</label> &nbsp; &nbsp;
            <button type="button" onClick={this.sendDatatoTopic} className= "btn btn-default"> Send Data </button>
          </form>
        </div>
        < hr/>
        <div className="row">
          <div className="col-sm-6 col-md-6 col-lg-6">
            <span className= "label label-primary"> Visualization Method: </span> &nbsp; &nbsp;
            <div className="radio">
              <label>
                <input type="radio" name="vizualization_method" value="scatter" onChange={this.handleInputChange} />
                Scatter
              </label>
            </div>
            <div className="radio">
              <label>
                <input type="radio" name="vizualization_method" value="heatmap"  onChange={this.handleInputChange}/>
                Heat Map
              </label>
            </div>
            <div className="radio">
              <label>
                <input type="radio" name="vizualization_method" value="parcoords" onChange={this.handleInputChange}/>
                Parallel Coordinates
              </label>
            </div>
          </div>
          <div className="col-sm-6 col-md-6 col-lg-6">
          <span className= "label label-primary"> WebServer Configuration: </span> &nbsp; &nbsp;
            <div className="form-group">
              <label htmlFor="connect_websocket">WebServer connection:</label> &nbsp; &nbsp;
              <button id="connect" className="btn btn-default btn-xs" type="button" onClick={this.connect}>Connect</button> &nbsp;
              <button id="disconnect" className="btn btn-default btn-xs" type="button" disabled="disabled" onClick={this.disconnect}>Disconnect
              </button>
              <br />
              <label htmlFor="connect_visualization">Visualization connection:</label> &nbsp; &nbsp;
              <button id="send" className="btn btn-default btn-sm" type="button" onClick={this.visualization}>Visualization</button> <br />
            </div>
          </div>
        </div>
        <hr />
        <div className= "row">
          <div className="col-sm-6 col-md-6 col-lg-6">
            <label htmlFor="raw_viz">Raw Data Visualization:</label> &nbsp; &nbsp;
            <button id="viz_raw" className="btn btn-default" type="button" onClick={this.startRawDataVisualization}>Visualization (Raw)</button> &nbsp;
          </div>
          <div className="col-sm-6 col-md-6 col-lg-6">
            <label htmlFor="raw_viz">Dimensional Reduced Data Visualization:</label> &nbsp; &nbsp;
            <button id="viz_red" className="btn btn-default" type="button" onClick={this.startkafkasparkCommand}>Visualization (Red.)</button> &nbsp;
          </div>
        </div>
        <hr />
        <div className= "row">
          <div className="col-sm-6 col-md-6 col-lg-6">
            <Plot data={this.state.drawingData_state} layout={this.state.drawingLayout_state}/>
          </div>
          <div className="col-sm-6 col-md-6 col-lg-6">
            <Plot data= {this.state.reduced_drawing_data_state} layout={this.state.reduced_drawing_layout_state} />
          </div>
        </div>
        
      </div>
    );
  }
}

export default MultipleFormInput;
