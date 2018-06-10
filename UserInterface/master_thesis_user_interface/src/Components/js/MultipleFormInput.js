import React, { Component } from 'react';
import $ from 'jquery';
import post from 'axios';

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
      selectedOption: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createTopic = this.createTopic.bind(this);
    this.sendDatatoTopic = this.sendDatatoTopic.bind(this);
    this.startkafkasparkCommand = this.startkafkasparkCommand.bind(this);
    this.passSelectedDataToVisualization = this.passSelectedDataToVisualization.bind(this);
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
      this.setState({topic_output_name: v})
      console.log("v: "+v);
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

  testFunction(){
    console.log('ll');
  }

  fetchDataFromDirectory(){
    $.ajax({
      url: 'http://localhost:8080/api/readAllFiles',
      dataType: 'json',
      cache: 'false',
      success: function(data){
        this.testFunction();
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
        <label> Name of the Topic: {this.state.topic_output_name} </label> &nbsp; &nbsp;
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

       <input type="submit" value="submit" />

      </form>


    );
  }
}

export default MultipleFormInput;
