import React, { Component } from 'react';
import $ from 'jquery';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Plot from 'react-plotly.js';

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
      reduced_drawing_layout_state: {},
      stompClient: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createTopic = this.createTopic.bind(this);
    this.sendDatatoTopic = this.sendDatatoTopic.bind(this);
    this.startkafkasparkCommand = this.startkafkasparkCommand.bind(this);
    this.passSelectedDataToVisualization = this.passSelectedDataToVisualization.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.visualization = this.visualization.bind(this);
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
      var stompBody = {topic: sessionStorage.getItem('topic_name'), bootstrap_servers: '127.0.0.1:9092'}
      stompClient.send("/app/checkContinuosData", {}, JSON.stringify(stompBody)); //parameters: destination, headers, body
  }


  drawGraph(data_for_drawing){
    console.log('graph localization');
  
    var data = [{
        type: 'bar',
        x: data_for_drawing[0],
        y: data_for_drawing[1]
    }]

    var layout =  {width: 600, height: 500, title: 'Reduced Visualization'} 
    this.setState({reduced_drawing_data_state: data})
    this.setState({reduced_drawing_layout_state: layout})
  }

  handleInputChange(event) {
    const target = event.target;
    let value = '';
    if (target.type === 'radio') {
      sessionStorage.setItem('visualizationMethod', target.value);
      value = target.value
    }else if (target.type === 'text') {
      value = target.value;
      let v = value + "_output"
      sessionStorage.setItem('topic_name', v);
      this.setState({topic_output_name: v})
   
    }else {
      sessionStorage.setItem('currentFile', target.value);
      value = target.value
    }
    const name = target.name

    this.setState(() => ({
      [name]: value,
    }));
  }

  handleSubmit(event){
    console.log(this.state.select_datasets);
    console.log(this.state.vizualization_method);
    console.log(this.state.topic_name);
    event.preventDefault();
  }

  createTopic(event){
    
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
    $.ajax({
      url: "http://localhost:8080/api/sendDatatoKafka",
      cache: 'false',
      method: 'POST',
      data: {kafka_broker_end_point:'127.0.0.1:9092', csv_input_file:this.state.select_datasets, topic_name: this.state.topic_name},
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
      data: {app_name:'learning01', master_server:'local[*]', kafka_bootstrap_server: '127.0.0.1:9092', subscribe_topic: this.state.topic_name,  subscribe_output_topic: this.state.topic_output_name},
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


  passSelectedDataToVisualization(){

  }
  render() {

    return (
      <form onSubmit={this.handleSubmit}>
        <label>DataSet Selection: </label> <br />
        <div>
          <select name="select_datasets" value={this.state.value} onChange={this.handleInputChange}>
            {this.state.receiveValues}
         </select>
        </div>
        <br />
        <label>Visualization method: </label> <br />
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
            <input type="radio" name="vizualization_method" value="parallel_coordinates" onChange={this.handleInputChange}/>
            Parallel Coordinates
          </label>
        </div>
        <br />
        <label> Name of the Topic: </label> &nbsp; &nbsp;
        <input type="text" name = "topic_name" placeholder="topic_name" onChange={this.handleInputChange}></input>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        <input type="button" onClick={this.createTopic} value="createTopic!" />
        <br />
        <label> Send Data to Topic: </label> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        <input type="button" onClick={this.sendDatatoTopic} value="Send Data" />
        <br />
        <label> Start Dimensionality Reduction: </label> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        <input type="button" onClick={this.startkafkasparkCommand} value="Dimensionality Reduction"></input>
        <br />
        <br />
      
       <div className="form-group">
            <label htmlFor="connect">WebSocket connection:</label>
            <button id="connect" className="btn btn-default" type="submit" onClick={this.connect}>Connect</button>
            <button id="disconnect" className="btn btn-default" type="submit" disabled="disabled" onClick={this.disconnect}>Disconnect
            </button>
        </div>

        <form className="form-inline">
            <button id="send" className="btn btn-default" type="submit" onClick={this.visualization}>Visualization</button>
        </form>

        <Plot data= {this.state.reduced_drawing_data_state} layout={this.state.reduced_drawing_layout_state} />
      </form>


    );
  }
}

export default MultipleFormInput;
