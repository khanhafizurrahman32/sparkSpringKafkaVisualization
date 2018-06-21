import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Sidebar extends Component{
  render (){
    return (
      <div className="sideNav">
          <ul>
            <li><Link to="/AddNewDataSet">Add New Dataset </Link></li>
            <li><Link to="/EvaluationCriteriaSelection">Evaluation </Link></li>
            <li><Link to="/MultipleFormInput">Multiple </Link></li>
          </ul>
      </div>

    );
  }
}

export default Sidebar
