import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import $ from 'jquery';
import Plotly from 'plotly.js/dist/plotly';


class Visualization extends Component {
  constructor(props){
    super(props);
    this.state= {
      headerFiles :'',
      fileTypes:'',
      currentFileTobProcessed: '',
      ContentsInJsonArray: [],
      drawingData_state: [],
      drawingLayout_state: {}
    }
    this.getHeaderFiles = this.getHeaderFiles.bind(this);
    this.getContentsOfTheFiles = this.getContentsOfTheFiles.bind(this);
    this.startPreprocessingFile = this.startPreprocessingFile.bind(this);
    this.createJsonContainingHeader_n_Contents = this.createJsonContainingHeader_n_Contents.bind(this);
    //this.getCurrentFile = this.getCurrentFile.bind(this);
    this.startRawDataVisualization = this.startRawDataVisualization.bind(this);
    this.unpackRows = this.unpackRows.bind(this);
  }

  startPreprocessingFile(){
    var currentFileTobProcessed = sessionStorage.getItem('currentFile');
    $.ajax({
      url: "http://localhost:8080/api/preprocessingFile",
      data: {'inputFilePath': currentFileTobProcessed},
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
    var currentFileTobProcessed = sessionStorage.getItem('currentFile');
    $.ajax({
      url: "http://localhost:8080/api/getHeadersOfaFile",
      data: {'inputFilePath': currentFileTobProcessed},
      dataType: 'json',
      success: function(data){
        console.log(data)
        sessionStorage.setItem('fieldNames', data[0]);
        sessionStorage.setItem('fieldTypes', data[1]);
        this.setState({
          headerFiles : data[0],
          fileTypes : data[1]
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

  drawParallelCoordinates(visualization_method, classLabels_numeric, drawingVals){
    let return_vals = [];
    const dimensions_array = [];
    let header_names = this.state.headerFiles;
    for(let i = 0; i <drawingVals.length; i++){
      let obj = {
        range: [Math.floor(Math.min(...drawingVals[i])), Math.ceil(Math.max(...drawingVals[0]))],
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
      width:800
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
      console.log('148', fieldNamesArray[i]);
      drawingVals.push(this.unpackRows(objArray, fieldNamesArray[i]));
    }
    /*console.log(drawingVals);
    var sepal_length_value = this.unpackRows(objArray, 'sepal_length');
    console.log(sepal_length_value);
    var sepal_width_value = this.unpackRows(objArray, 'sepal_width');
    var petal_length_value = this.unpackRows(objArray, 'petal_length');
    var petal_width_value = this.unpackRows(objArray, 'petal_width');
    var classLabels = this.unpackRows(objArray, 'class');*/
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
    var visualization_method= sessionStorage.getItem('visualizationMethod');
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
      /*data = [{
        z: [sepal_length_value, sepal_width_value, petal_length_value, petal_width_value],
        type: visualization_method
      }];*/
    } else if (visualization_method === "parcoords"){
      let response_vals = this.drawParallelCoordinates(visualization_method, classLabels_numeric, drawingVals);
      data = response_vals[0];
      layout = response_vals[1];
    }
    else {
      /*data = [
        {
          x: sepal_length_value,
          y: sepal_width_value,
          type: visualization_method,
          mode: 'markers',
          marker: {color: arr,
                   size: 10
                  },
        },
      ]*/  
    }

    /*var layout= {width: 540, height: 450, title: 'Raw data ', 
                xaxis: {title: 'Sepal length', showgrid: false}, 
                yaxis: {title: 'Sepal width', showgrid: false}} */
    
    this.setState({drawingData_state: data});
    this.setState({drawingLayout_state: layout})
  }

  render() {
    if(this.state.headerFiles === ''){
      return (
        <div className='patient'>
          <label> Process Data For Visualization: </label> &nbsp; &nbsp;
          <input type="button" onClick={this.startPreprocessingFile} value="Preprocessing Of The File" /> &nbsp; &nbsp;
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
