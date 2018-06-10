import React, { Component } from 'react';
import post from 'axios';

//https://gist.github.com/AshikNesin/e44b1950f6a24cfcd85330ffc1713513
class AddNewDataset extends Component {

  constructor(props){
    super(props);
    this.state ={
      file:null
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
  }

  onFormSubmit(e){
    e.preventDefault()
    this.fileUpload(this.state.file).then((response) => {
      console.log(response.data);
    }).catch((fromReject) => {
      console.log(fromReject)
    })
  }

  onChange(e){
    this.setState({file:e.target.files[0]})
  }

  fileUpload(file){
    const url = 'http://localhost:8080/upload/toaFixedPlace';
    const formData = new FormData();
    formData.append('file',file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return post(url, formData, config)
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

  uploadFile(fileInput) {
    console.log('FileUpload.uploadFile() file selected: ',fileInput);
    console.log(fileInput.target.files);
  }
}

export default AddNewDataset;
