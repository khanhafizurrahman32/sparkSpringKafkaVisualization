import React, { Component } from 'react';
import $ from 'jquery';

class DataSetSelection extends Component {
  constructor(props){
    super(props);
    this.state = {
      receiveValues: [],
      selectedDataSet: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({selectedDataSet: event.target.value});
    console.log(event.target.value);
  }

  handleSubmit(event){
    console.log(this.state.selectedDataSet)
    event.preventDefault();
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

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
          <label>Category</label> <br />
          <div>
            <select value={this.state.value} onChange={this.handleChange}>
              {this.state.receiveValues}
           </select>
         </div>
         <br />
         <input type="submit" value="submit" />
      </form>
    );
  }
}

export default DataSetSelection;
