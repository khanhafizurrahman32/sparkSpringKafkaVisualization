import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import $ from 'jquery';
import Plotly from 'plotly.js/dist/plotly';


class Visualization extends Component {
  constructor(props){
    super(props);
    this.state= {
      headerFiles :'',
      currentFileTobProcessed: '',
      ContentsInJsonArray: [],
      drawingData_state: [],
      drawingLayout_state: {}
    }
    this.getHeaderFiles = this.getHeaderFiles.bind(this);
    this.getContentsOfTheFiles = this.getContentsOfTheFiles.bind(this);
    this.createJsonContainingHeader_n_Contents = this.createJsonContainingHeader_n_Contents.bind(this);
    //this.getCurrentFile = this.getCurrentFile.bind(this);
    this.startRawDataVisualization = this.startRawDataVisualization.bind(this);
    this.unpackRows = this.unpackRows.bind(this);
  }

  getHeaderFiles(){
    var currentFileTobProcessed = sessionStorage.getItem('currentFile');
    $.ajax({
      url: "http://localhost:8080/api/getHeadersOfaFile",
      data: {'inputFilePath': currentFileTobProcessed},
      dataType: 'text',
      success: function(data){
        this.setState({
          headerFiles : data.slice(0,-1)
        })
      }.bind(this),
      error: function(xhr, status, err){
      }
    });
  }

  getContentsOfTheFiles(){
    var currentFileTobProcessed = sessionStorage.getItem('currentFile');
    $.ajax({
       url: "http://localhost:8080/api/startProcessingFile",
       data: {'inputFilePath': currentFileTobProcessed},
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
    var headerList = header_of_file.split(',');
  	var objArray = [];
  	for (var i =0; i< contents_of_file.length; i++){
  		var containFileList = contents_of_file[i].split(',');
  		var obj = {};
  		for (var j = 0; j < (headerList.length); j++){
  			obj[''+headerList[j]+''] = containFileList[j];
  		}
		  objArray.push(obj);
      this.setState({ContentsInJsonArray: objArray});
	  } 
  }

  unpackRows(rows, key){
    return rows.map(function(row){
      return row[key];
    });
  }

  startRawDataVisualization(){
    var objArray = this.state.ContentsInJsonArray;
    var sepal_length_value = this.unpackRows(objArray, 'sepal_length');
    var sepal_width_value = this.unpackRows(objArray, 'sepal_width');
    var classLabels = this.unpackRows(objArray, 'class');
    var classLabels_unique = classLabels.filter((v,i,a) => a.indexOf(v) === i);
    var visualization_method= sessionStorage.getItem('visualizationMethod');
    //console.log(classLabels);
    var colorScale = Plotly.d3.scale.ordinal().range(["#1f77b4","#ff7f0e","#2ca02c"]).domain(classLabels_unique);
    var arr= [];
    while(arr.length < objArray.length){
      var colorValues = colorScale(objArray[arr.length]['class']);
      arr[arr.length] = colorValues;
    }
    var data = [
      {
        x: sepal_length_value,
        y: sepal_width_value,
        type: visualization_method,
        mode: 'markers',
        marker: {color: arr,
                 size: 10
                },
      },
    ]
    
    var layout= {width: 540, height: 450, title: 'Raw data ', 
                xaxis: {title: 'Sepal length', showgrid: false}, 
                yaxis: {title: 'Sepal width', showgrid: false}}
    
    this.setState({drawingData_state: data});
    this.setState({drawingLayout_state: layout})
  }



  render() {
    console.log(this.state.headerFiles);
    if(this.state.headerFiles === ''){
      return (
        <div className='patient'>
          <label> Process Data For Visualization: </label> &nbsp; &nbsp;
          <input type="button" onClick={this.getHeaderFiles} value="Schema Of The File" /> &nbsp; &nbsp;
          <input type="button" onClick={this.getContentsOfTheFiles} value="Contains Of The File" />
          <br /> <br />
          <input type="button" onClick={this.startRawDataVisualization} value="Visualization (Raw)" />
        </div>
      );
    } else {
        return (
          <div className='patient'>
            <label> Process Data For Visualization: </label> &nbsp; &nbsp;
            <input type="button" onClick={this.getHeaderFiles} value="Schema Of The File" /> &nbsp; &nbsp;
            <input type="button" onClick={this.getContentsOfTheFiles} value="Contains Of The File" />
            <br /> <br />
            <input type="button" onClick={this.startRawDataVisualization} value="Visualization (Raw)" />
            <div id='myDiv'></div>
            <Plot data={this.state.drawingData_state} layout={this.state.drawingLayout_state}/>
          </div>
        );
    }
  }
}

export default Visualization;
