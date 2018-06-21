import React, { Component } from 'react';
import './App.css';
import Sidebar from './Components/sidebar';
import AddNewDataset from './Components/js/AddNewDataset';
import MultipleFormInput from './Components/js/MultipleFormInput';
import EvaluationCriteriaSelection from './Components/js/EvaluationCriteriaSelection';
import { BrowserRouter as Router, Route } from 'react-router-dom';

class App extends Component {

  render() {

    return (
      <div className="App">
          <Router>
            <div className="row">
                <div className="col-sm-2 col-md-3 col-lg-2" style={{'backgroundColor': 'lavender'}}>
                  <Sidebar />
                </div>
                <div className="col-sm-10 col-md-9 col-lg-10" style={{'backgroundColor': 'lavenderblush'}}>
                  <Route exact path="/AddNewDataset" component={AddNewDataset} />
                  <Route exact path="/EvaluationCriteriaSelection" component={EvaluationCriteriaSelection} />
                  <Route exact path="/MultipleFormInput" component={MultipleFormInput} />
                </div>
            </div>
          </Router>
      </div>
    );
  }
}

export default App;
