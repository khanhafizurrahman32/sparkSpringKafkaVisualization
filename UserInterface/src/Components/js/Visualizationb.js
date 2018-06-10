import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import $ from 'jquery';

class Visualization extends Component {
  constructor(props){
    super(props);
    this.state ={
      jsonData : [],
      date: new Date()
    };
    this.testVariable = 'this is a test';
    this.makeplot = this.makeplot.bind(this);
    this.loadHandler = this.loadHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.processData = this.processData.bind(this);
    }

  makeplot(){
    console.log('inside makeplot');
  }
  fetchDataFromJson(){
    return fetch('https://facebook.github.io/react-native/movies.json')
      .then((response) => response.json())
      .then((responseJson) => {
          console.log(responseJson.movies)
          this.setState({jsonData : responseJson.movies},function(){

          });
      })
      .catch((error) =>{
          console.error(error);
      });
  }
  componentDidMount(){
    this.fetchDataFromJson()
    this.fetchDataFromCSV();
  }

  fetchDataFromCSV(){
    let reader = new FileReader();
    reader.readAsText('/Users/khanhafizurrahman/Desktop/Thesis/code/Thesis_Implementation/UploadFiles/irisdataset.csv')
    reader.onload = this.loadHandler;
    reader.onerror = this.errorHandler;
  }

  loadHandler(event){
    let csv = event.target.result;
    this.processData(csv);
  }

  errorHandler(event){
    alert('can not')
  }

  processData(csv){
    let allTextLines = csv.split('/\r\n|\n');

    for(let i =0; i<allTextLines.length; i ++){
      let row = allTextLines[i].split(',');
      console.log(row)
    }
  }


  render() {
    const figure = {
      data: [{
        type: 'scatter',
        x: [1, 2, 3],
        y: [4, 5, 6]
      }],
      layout:{
        title: 'A react-plotly.js chart'
      }
    }
    return(
      <div className='patient'>
          {this.makeplot()}
          <Plot data={figure.data} layout={figure.layout} />
      </div>

    //

    )


    /*return (
        <Plot
          data={[
            {
              x: [1, 2, 3],
              y: [2, 6, 3],
              type: 'scatter',
              mode: 'lines+points',
              marker: {color: 'red'},
            },
            {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
          ]}
          layout={{width: 320, height: 240, title: 'A Fancy Plot'}}
        />
      );*/
  }
}

export default Visualization;
