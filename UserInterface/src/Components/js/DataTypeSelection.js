import React, { Component } from 'react';

class DataTypeSelection extends Component {
  constructor(props){
    super(props);
    this.state = {selectedOption: 'option1'};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

// if I put console to this.state it will output as previous stored value
  handleChange(event) {
    this.setState({selectedOption: event.target.value});
  }

  handleSubmit(event){
    console.log(this.state.selectedOption);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="radio">
          <label>
            <input type="radio" value="option1" checked={this.state.selectedOption === 'option1'} onChange={this.handleChange}/>
            Option 1
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" value="option2" checked={this.state.selectedOption === 'option2'} onChange={this.handleChange}/>
            Option 2
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" value="option3" checked={this.state.selectedOption === 'option3'} onChange={this.handleChange}/>
            Option 3
          </label>
        </div>
        <button className="btn btn-default" type="submit">submit</button>

      </form>
    );
  }
}

export default DataTypeSelection;
