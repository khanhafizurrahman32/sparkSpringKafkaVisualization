import React, { Component } from 'react';

//https://gist.github.com/AshikNesin/e44b1950f6a24cfcd85330ffc1713513
class AddNewDataset extends Component {

  constructor(props){
    super(props);
    this.state ={
      file:null
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onFormSubmit(e){
    e.preventDefault();
    const formData = new FormData();
    formData.append('file',this.state.file);
    var request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/toaFixedPlace");
    request.send(formData)
    request.onload = function () {
      if (request.status === 200){
        console.log('uploaded successfully');
      }else {
        alert ('an error occured')
      }
    }.bind(this)
  }

  onChange(e){
    this.setState({file:e.target.files[0]})
  }

  render() {
    let formDiv;
    formDiv = <div>
                <label className="control-label label-title"> Please choose a File to upload</label>
                <div className="form-group fieldset">
                  <form onSubmit={this.onFormSubmit}>
                    <input type="file" className="form-control" name="uploadFile" onChange= {this.onChange} />
                    <br />
                    <button type="submit" className="btn btn-info">Upload</button>
                  </form>
                </div>
              </div>
    return (
      <div id="form-container">
        { formDiv }
      </div>
    );
  }
}

export default AddNewDataset;
