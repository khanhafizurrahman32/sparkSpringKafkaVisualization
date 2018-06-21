import React, { Component } from 'react';
import './App.css';
import Sidebar from './Components/sidebar';
import DataTypeSelection from './Components/js/DataTypeSelection';
import DataSetSelection from './Components/js/DataSetSelection';
import AddNewDataset from './Components/js/AddNewDataset';
import Visualization from './Components/js/Visualization';
import Visualizationb from './Components/js/Visualizationb';
import MultipleFormInput from './Components/js/MultipleFormInput';
import EvaluationCriteriaSelection from './Components/js/EvaluationCriteriaSelection';
import learningWebSocket from './Components/js/learningWebSocket'
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
                  <Route exact path="/DataTypeSelection" component={DataTypeSelection} />
                  <Route exact path="/DataSetSelection" component={DataSetSelection} />
                  <Route exact path="/AddNewDataset" component={AddNewDataset} />
                  <Route exact path="/Visualizationb" component={Visualizationb} />
                  <Route exact path="/Visualization" component={Visualization} />
                  <Route exact path="/EvaluationCriteriaSelection" component={EvaluationCriteriaSelection} />
                  <Route exact path="/MultipleFormInput" component={MultipleFormInput} />
                  <Route exact path="/learningWebSocket" component={learningWebSocket} />
                </div>
            </div>
          </Router>
      </div>
    );
  }
}

export default App;
